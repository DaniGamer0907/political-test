import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { QuestionCardComponent } from '../../components/question-card/question-card.component';
import { Pregunta, RespuestaValor } from '../../interfaces';
import { determinarCategoria } from '../../models';
import { SupabaseService } from '../../services/supabase.service';
import { TestStateService } from '../../services/test-state.service';

type RespuestaLocal = {
  pregunta_id: string;
  valor: RespuestaValor;
};

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [ProgressBarComponent, QuestionCardComponent, RouterLink],
  template: `
    <section class="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-3xl content-center gap-6 px-2 py-8">
      <div class="flex items-center justify-between gap-4">
        <a
          routerLink="/home"
          class="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
        >
          Volver
        </a>

        @if (preguntas().length > 0) {
          <p class="text-sm text-zinc-400">Pregunta {{ preguntaActualNumero() }} de {{ preguntas().length }}</p>
        }
      </div>

      @if (cargando()) {
        <div class="rounded-lg border border-white/10 bg-zinc-950/85 p-6 text-zinc-200">
          Cargando preguntas...
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-400/30 bg-red-950/50 p-5 text-sm leading-6 text-red-100">
          {{ error() }}
        </div>
      } @else if (preguntaActual(); as pregunta) {
        <app-progress-bar [current]="preguntaActualNumero()" [total]="preguntas().length" />

        <app-question-card
          [pregunta]="pregunta"
          [questionNumber]="preguntaActualNumero()"
          [selectedValue]="valorRespuestaActual()"
          (answered)="responder($event)"
        />

        <div class="flex justify-start">
          <button
            type="button"
            [disabled]="indiceActual() === 0 || guardando()"
            (click)="preguntaAnterior()"
            class="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
        </div>

        @if (guardando()) {
          <p class="text-center text-sm text-zinc-300">Guardando resultado...</p>
        }
      } @else {
        <div class="rounded-lg border border-white/10 bg-zinc-950/85 p-6 text-zinc-200">
          No hay preguntas cargadas.
        </div>
      }
    </section>
  `,
  styles: [],
})
export class TestComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly testState = inject(TestStateService);

  readonly preguntas = signal<Pregunta[]>([]);
  readonly indiceActual = signal(0);
  readonly respuestas = signal<RespuestaLocal[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly preguntaActual = computed(() => this.preguntas()[this.indiceActual()] ?? null);
  readonly preguntaActualNumero = computed(() => this.indiceActual() + 1);
  readonly respuestaActual = computed(() => this.respuestas()[this.indiceActual()] ?? null);
  readonly valorRespuestaActual = computed<RespuestaValor | null>(() => this.respuestaActual()?.valor ?? null);

  async ngOnInit(): Promise<void> {
    if (!this.testState.participanteId()) {
      await this.router.navigateByUrl('/home');
      return;
    }

    try {
      const preguntas = await this.supabaseService.getPreguntas();
      this.preguntas.set(this.mezclarPreguntas(preguntas));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las preguntas.');
    } finally {
      this.cargando.set(false);
    }
  }

  async responder(valor: RespuestaValor): Promise<void> {
    if (this.guardando()) {
      return;
    }

    const pregunta = this.preguntaActual();

    if (!pregunta) {
      return;
    }

    this.respuestas.update((respuestas) => {
      const siguientes = [...respuestas];
      siguientes[this.indiceActual()] = { pregunta_id: pregunta.id, valor };
      return siguientes;
    });

    const esUltimaPregunta = this.indiceActual() === this.preguntas().length - 1;

    if (!esUltimaPregunta) {
      this.indiceActual.update((indice) => indice + 1);
      return;
    }

    await this.finalizarTest();
  }

  preguntaAnterior(): void {
    if (this.indiceActual() > 0 && !this.guardando()) {
      this.indiceActual.update((indice) => indice - 1);
    }
  }

  private mezclarPreguntas(preguntas: Pregunta[]): Pregunta[] {
    const mezcladas = [...preguntas];

    for (let indice = mezcladas.length - 1; indice > 0; indice -= 1) {
      const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
      [mezcladas[indice], mezcladas[indiceAleatorio]] = [
        mezcladas[indiceAleatorio],
        mezcladas[indice],
      ];
    }

    return mezcladas;
  }

  private async finalizarTest(): Promise<void> {
    const participanteId = this.testState.participanteId();

    if (!participanteId) {
      await this.router.navigateByUrl('/home');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    try {
      const { x, y } = this.calcularCoordenadas();
      const categoria = determinarCategoria(x, y);

      await this.supabaseService.guardarRespuestas(participanteId, this.respuestas());
      await this.supabaseService.guardarResultado(participanteId, x, y, categoria);
      this.testState.setResultado({
        id: crypto.randomUUID(),
        participante_id: participanteId,
        x,
        y,
        categoria,
      });
      await this.router.navigateByUrl('/result');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo guardar el resultado.');
    } finally {
      this.guardando.set(false);
    }
  }

  private calcularCoordenadas(): { x: number; y: number } {
    const preguntasPorId = new Map(this.preguntas().map((pregunta) => [pregunta.id, pregunta]));

    return this.respuestas().reduce(
      (total, respuesta) => {
        const pregunta = preguntasPorId.get(respuesta.pregunta_id);

        if (!pregunta) {
          return total;
        }

        return {
          x: total.x + respuesta.valor * Number(pregunta.eje_x),
          y: total.y + respuesta.valor * Number(pregunta.eje_y),
        };
      },
      { x: 0, y: 0 }
    );
  }
}
