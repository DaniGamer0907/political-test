import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="grid gap-2">
      <div class="flex items-center justify-between text-sm text-zinc-300">
        <span>Progreso</span>
        <span>{{ current() }} / {{ total() }}</span>
      </div>

      <div class="h-3 overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full bg-emerald-400 transition-all duration-300" [style.width.%]="progress()"></div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProgressBarComponent {
  readonly current = input.required<number>();
  readonly total = input.required<number>();

  protected readonly progress = computed(() => {
    const total = this.total();

    if (total <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (this.current() / total) * 100));
  });
}
