import { Component, input, output } from '@angular/core';

import { Pregunta, RespuestaValor } from '../../interfaces';

type LikertOption = {
  label: string;
  value: RespuestaValor;
};

const LIKERT_OPTIONS: LikertOption[] = [
  { label: 'Muy en desacuerdo', value: -2 },
  { label: 'En desacuerdo', value: -1 },
  { label: 'Neutral', value: 0 },
  { label: 'De acuerdo', value: 1 },
  { label: 'Muy de acuerdo', value: 2 },
];

@Component({
  selector: 'app-question-card',
  standalone: true,
  template: `
    <article class="rounded-lg border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/25 sm:p-7">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Pregunta {{ questionNumber() }}</p>

      <h2 class="mt-4 text-xl font-semibold leading-8 text-white sm:text-2xl">
        {{ pregunta().texto }}
      </h2>

      <div class="mt-7 grid gap-3">
        @for (option of options; track option.value) {
          <button
            type="button"
            (click)="answered.emit(option.value)"
            [class.border-emerald-300]="selectedValue() === option.value"
            [class.bg-emerald-100]="selectedValue() === option.value"
            [class.ring-4]="selectedValue() === option.value"
            [class.ring-emerald-300\/25]="selectedValue() === option.value"
            class="min-h-12 rounded-md border border-white/10 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-950 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-300/25 sm:text-base"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </article>
  `,
  styles: [],
})
export class QuestionCardComponent {
  readonly pregunta = input.required<Pregunta>();
  readonly questionNumber = input.required<number>();
  readonly selectedValue = input<RespuestaValor | null>(null);
  readonly answered = output<RespuestaValor>();

  protected readonly options = LIKERT_OPTIONS;
}
