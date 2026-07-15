import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { GraphComponent } from '../../components/graph/graph.component';
import { Resultado } from '../../interfaces';
import { CategoriaPolitica, formatearCategoria } from '../../models';
import { SupabaseService } from '../../services/supabase.service';
import { TestStateService } from '../../services/test-state.service';

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [GraphComponent, RouterLink],
  template: `
    <section class="mx-auto grid w-full max-w-5xl gap-6 px-2 py-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Resultado</p>
          <h2 class="mt-2 text-3xl font-semibold text-white">Plano cartesiano del usuario</h2>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            (click)="compartirResultado()"
            class="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            {{ linkCopiado() ? 'Link copiado' : 'Compartir resultado' }}
          </button>

          <a
            routerLink="/home"
            class="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
          >
            Nuevo test
          </a>
        </div>
      </div>

      @if (cargando()) {
        <div class="rounded-lg border border-white/10 bg-zinc-950/85 p-6 text-zinc-200">
          Cargando resultado...
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-400/30 bg-red-950/50 p-5 text-sm leading-6 text-red-100">
          {{ error() }}
        </div>
      } @else if (resultado(); as resultadoActual) {
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <app-graph [x]="resultadoActual.x" [y]="resultadoActual.y" />

          <aside class="grid content-start gap-4 rounded-lg border border-white/10 bg-zinc-950/85 p-5">
            <div>
              <p class="text-sm text-zinc-400">Categoría</p>
              <p class="mt-2 text-2xl font-semibold text-white">{{ categoriaLegible() }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-md bg-white/5 p-4">
                <p class="text-sm text-zinc-400">X</p>
                <p class="mt-1 text-2xl font-semibold text-white">{{ resultadoActual.x }}</p>
              </div>

              <div class="rounded-md bg-white/5 p-4">
                <p class="text-sm text-zinc-400">Y</p>
                <p class="mt-1 text-2xl font-semibold text-white">{{ resultadoActual.y }}</p>
              </div>
            </div>
          </aside>
        </div>
      } @else {
        <div class="rounded-lg border border-white/10 bg-zinc-950/85 p-6 text-zinc-200">
          No hay resultado disponible.
        </div>
      }
    </section>
  `,
  styles: [],
})
export class ResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly testState = inject(TestStateService);

  readonly resultado = signal<Resultado | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly linkCopiado = signal(false);

  readonly categoriaLegible = computed(() => {
    const categoria = this.resultado()?.categoria as CategoriaPolitica | undefined;
    return categoria ? formatearCategoria(categoria) : '';
  });

  async ngOnInit(): Promise<void> {
    const resultadoEnEstado = this.testState.resultado();

    if (resultadoEnEstado) {
      this.resultado.set(resultadoEnEstado);
      this.cargando.set(false);
      return;
    }

    const participanteId = this.testState.participanteId();

    if (!participanteId) {
      await this.router.navigateByUrl('/home');
      return;
    }

    try {
      const resultado = await this.supabaseService.getResultado(participanteId);
      this.resultado.set(resultado);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo cargar el resultado.');
    } finally {
      this.cargando.set(false);
    }
  }

  async compartirResultado(): Promise<void> {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      this.linkCopiado.set(true);
      window.setTimeout(() => this.linkCopiado.set(false), 1800);
    } catch {
      this.error.set('No se pudo copiar el link del resultado.');
    }
  }
}
