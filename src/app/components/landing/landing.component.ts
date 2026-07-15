import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';
import { TestStateService } from '../../services/test-state.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <section class="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-2xl place-items-center px-2 py-8">
      <div class="w-full rounded-lg border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Brújula política</p>

        <h1 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">Test de ubicación política</h1>

        <p class="mt-4 text-base leading-7 text-zinc-300">
          Respondé una serie de preguntas y ubicá tu resultado en un plano con ejes X e Y.
        </p>

        <form class="mt-8 grid gap-5" (submit)="comenzar($event)">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Nombre</span>
            <input
              type="text"
              autocomplete="name"
              [value]="nombre()"
              (input)="actualizarNombre($event)"
              class="h-12 rounded-md border border-white/10 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20"
              placeholder="Tu nombre"
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Edad <span class="text-zinc-500">(opcional)</span></span>
            <input
              type="number"
              inputmode="numeric"
              min="0"
              max="120"
              [value]="edad()"
              (input)="actualizarEdad($event)"
              class="h-12 rounded-md border border-white/10 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20"
              placeholder="Ej. 25"
            />
          </label>

          @if (error()) {
            <p class="rounded-md border border-red-400/30 bg-red-950/50 px-4 py-3 text-sm text-red-100">
              {{ error() }}
            </p>
          }

          <button
            type="submit"
            [disabled]="!puedeComenzar() || cargando()"
            class="h-12 rounded-md bg-emerald-400 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {{ cargando() ? 'Creando participante...' : 'Comenzar' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [],
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly testState = inject(TestStateService);

  readonly nombre = signal('');
  readonly edad = signal('');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  puedeComenzar(): boolean {
    return this.nombre().trim().length > 0;
  }

  actualizarNombre(event: Event): void {
    this.nombre.set((event.target as HTMLInputElement).value);
  }

  actualizarEdad(event: Event): void {
    this.edad.set((event.target as HTMLInputElement).value);
  }

  async comenzar(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.puedeComenzar() || this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const edad = this.parseEdad();
      const participanteId = await this.supabaseService.crearParticipante(this.nombre().trim(), edad);

      this.testState.setParticipanteId(participanteId);
      await this.router.navigateByUrl('/test');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo comenzar el test.');
    } finally {
      this.cargando.set(false);
    }
  }

  private parseEdad(): number | undefined {
    const rawEdad = this.edad().trim();

    if (!rawEdad) {
      return undefined;
    }

    const edad = Number(rawEdad);
    return Number.isFinite(edad) ? edad : undefined;
  }
}
