import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
      <p class="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">Test político</p>
      <h1 class="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Esqueleto inicial para ubicar al usuario en un plano cartesiano.
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
        Home, test y result ya están cableados. La lógica del cuestionario, el cálculo de ejes y la integración con
        Supabase quedan para la siguiente iteración.
      </p>
    </section>
  `,
  styles: [],
})
export class LandingComponent {}
