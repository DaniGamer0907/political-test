import { Component } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="rounded-full bg-white/10 p-1">
      <div class="h-2 w-1/3 rounded-full bg-emerald-400"></div>
    </div>
  `,
  styles: [],
})
export class ProgressBarComponent {}
