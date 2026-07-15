import { Component } from '@angular/core';

@Component({
  selector: 'app-question-card',
  standalone: true,
  template: `
    <article class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <ng-content />
    </article>
  `,
  styles: [],
})
export class QuestionCardComponent {}
