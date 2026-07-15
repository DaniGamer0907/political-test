import { Component } from '@angular/core';

@Component({
  selector: 'app-graph',
  standalone: true,
  template: `
    <section class="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <div
        class="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-center text-sm text-slate-300"
      >
        Gráfico pendiente de implementación con Chart.js.
      </div>
    </section>
  `,
  styles: [],
})
export class GraphComponent {}
