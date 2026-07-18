import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';
import { TestStateService } from '../../services/test-state.service';

type FormularioParticipante = {
  codigo: string;
  rangoEdad: string;
  genero: string;
  comunidades: string[];
  escuela: string;
  programa: string;
  nivelSocioeconomico: number | null;
  ideologia: string;
  ideologiaOtro: string;
};

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <section class="mx-auto w-full max-w-3xl px-2 py-8 sm:py-12">
      <div class="rounded-lg border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Brújula política</p>
        <h1 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">Test de ubicación política</h1>
        <p class="mt-4 text-base leading-7 text-zinc-300">
          Completá tus datos para comenzar el test y ubicar tu resultado en un plano con ejes X e Y.
        </p>

        <form class="mt-8 grid gap-5" (submit)="comenzar($event)">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Código</span>
            <input type="text" required autocomplete="off" [value]="formulario().codigo" (input)="actualizarTexto('codigo', $event)" placeholder="Ingresá tu código" class="campo" />
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Rango de edad</span>
            <select required [value]="formulario().rangoEdad" (change)="actualizarSelect('rangoEdad', $event)" class="campo">
              <option value="">Seleccioná una opción</option>
              @for (rango of rangosEdad; track rango) { <option [value]="rango">{{ rango }} años</option> }
            </select>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Género</span>
            <select required [value]="formulario().genero" (change)="actualizarSelect('genero', $event)" class="campo">
              <option value="">Seleccioná una opción</option>
              @for (genero of generos; track genero) { <option [value]="genero">{{ genero }}</option> }
            </select>
          </label>

          <fieldset class="grid gap-3">
            <legend class="text-sm font-medium text-zinc-200">¿Con cuál comunidad te autorreconocés?</legend>
            <div class="grid gap-2 sm:grid-cols-2">
              @for (comunidad of comunidadesDisponibles; track comunidad) {
                <label class="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-200">
                  <input type="checkbox" [checked]="formulario().comunidades.includes(comunidad)" (change)="alternarComunidad(comunidad)" class="h-4 w-4 accent-emerald-400" />
                  {{ comunidad }}
                </label>
              }
            </div>
          </fieldset>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">¿A qué escuela pertenecés?</span>
            <select required [value]="formulario().escuela" (change)="actualizarSelect('escuela', $event)" class="campo">
              <option value="">Seleccioná una opción</option>
              @for (escuela of escuelas; track escuela) { <option [value]="escuela">{{ escuela }}</option> }
            </select>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Programa de estudio</span>
            <select required [value]="formulario().programa" (change)="actualizarSelect('programa', $event)" class="campo">
              <option value="">Seleccioná una opción</option>
              @for (programa of programas; track programa) { <option [value]="programa">{{ programa }}</option> }
            </select>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">Nivel socioeconómico</span>
            <select required [value]="formulario().nivelSocioeconomico ?? ''" (change)="actualizarEstrato($event)" class="campo">
              <option value="">Seleccioná el estrato</option>
              @for (estrato of estratos; track estrato) { <option [value]="estrato">Estrato {{ estrato }}</option> }
            </select>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-zinc-200">¿Con qué ideología política te identificás?</span>
            <select required [value]="formulario().ideologia" (change)="actualizarSelect('ideologia', $event)" class="campo">
              <option value="">Seleccioná una opción</option>
              @for (ideologia of ideologias; track ideologia) { <option [value]="ideologia">{{ ideologia }}</option> }
            </select>
          </label>

          @if (formulario().ideologia === 'otro') {
            <label class="grid gap-2">
              <span class="text-sm font-medium text-zinc-200">Especificá tu ideología</span>
              <input type="text" required [value]="formulario().ideologiaOtro" (input)="actualizarTexto('ideologiaOtro', $event)" class="campo" />
            </label>
          }

          @if (error()) { <p class="rounded-md border border-red-400/30 bg-red-950/50 px-4 py-3 text-sm text-red-100">{{ error() }}</p> }

          <button type="submit" [disabled]="!puedeComenzar() || cargando()" class="h-12 rounded-md bg-emerald-400 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
            {{ cargando() ? 'Creando participante...' : 'Comenzar' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`.campo { height: 3rem; border-radius: .375rem; border: 1px solid rgb(255 255 255 / .1); background: white; padding: 0 1rem; color: #18181b; outline: none; } .campo:focus { border-color: rgb(110 231 183); box-shadow: 0 0 0 4px rgb(110 231 183 / .2); }`],
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly testState = inject(TestStateService);

  readonly rangosEdad = ['18-21', '22-25', '26-30', 'Más de 30'];
  readonly generos = ['Femenino', 'Masculino', 'Prefiero no decirlo'];
  readonly comunidadesDisponibles = ['Negro', 'Mulato', 'Afrodescendiente', 'Afrocolombiano', 'Indígena', 'LGBTIQ+', 'Ninguno'];
  readonly escuelas = ['Escuela de transformación digital', 'Escuela de negocios, leyes, sociedad', 'Escuela de ingeniería, arquitectura y diseño'];
  readonly programas = ['Administración de Empresas', 'Arquitectura', 'Ciencia de Datos', 'Ciencia Política y Relaciones Internacionales', 'Comunicación Social', 'Contaduría Pública', 'Derecho', 'Diseño', 'Economía', 'Finanzas y Negocios Internacionales', 'Ingeniería Ambiental', 'Ingeniería Biomédica', 'Ingeniería Civil', 'Ingeniería Eléctrica', 'Ingeniería Electrónica', 'Ingeniería Industrial', 'Ingeniería Mecánica', 'Ingeniería Mecatrónica', 'Ingeniería Naval', 'Ingeniería Química', 'Ingeniería de Sistemas y Computación'];
  readonly estratos = [1, 2, 3, 4, 5, 6];
  readonly ideologias = ['Capitalista', 'Comunista', 'Liberal', 'Socialdemócrata', 'Ninguna', 'Otro'];
  readonly formulario = signal<FormularioParticipante>({ codigo: '', rangoEdad: '', genero: '', comunidades: [], escuela: '', programa: '', nivelSocioeconomico: null, ideologia: '', ideologiaOtro: '' });
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  puedeComenzar(): boolean {
    const datos = this.formulario();
    return Boolean(datos.codigo.trim() && datos.rangoEdad && datos.genero && datos.comunidades.length && datos.escuela && datos.programa && datos.nivelSocioeconomico && datos.ideologia && (datos.ideologia !== 'otro' || datos.ideologiaOtro.trim()));
  }

  actualizarTexto(campo: 'codigo' | 'ideologiaOtro', event: Event): void { this.formulario.update((datos) => ({ ...datos, [campo]: (event.target as HTMLInputElement).value })); }
  actualizarSelect(campo: 'rangoEdad' | 'genero' | 'escuela' | 'programa' | 'ideologia', event: Event): void { this.formulario.update((datos) => ({ ...datos, [campo]: (event.target as HTMLSelectElement).value })); }
  actualizarEstrato(event: Event): void { this.formulario.update((datos) => ({ ...datos, nivelSocioeconomico: Number((event.target as HTMLSelectElement).value) || null })); }
  alternarComunidad(comunidad: string): void { this.formulario.update((datos) => ({ ...datos, comunidades: datos.comunidades.includes(comunidad) ? datos.comunidades.filter((item) => item !== comunidad) : [...datos.comunidades, comunidad] })); }

  async comenzar(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.puedeComenzar() || this.cargando()) return;
    this.cargando.set(true); this.error.set(null);
    try {
      const datos = this.formulario();
      const participanteId = await this.supabaseService.crearParticipante({
        codigo: datos.codigo.trim(),
        rango_edad: datos.rangoEdad,
        genero: datos.genero,
        comunidades: datos.comunidades,
        escuela: datos.escuela,
        programa: datos.programa,
        nivel_socioeconomico: datos.nivelSocioeconomico!,
        ideologia: datos.ideologia,
        ideologia_otro: datos.ideologia === 'otro' ? datos.ideologiaOtro.trim() : null,
      });
      this.testState.setParticipanteId(participanteId);
      await this.router.navigateByUrl('/test');
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'No se pudo comenzar el test.'); }
    finally { this.cargando.set(false); }
  }
}
