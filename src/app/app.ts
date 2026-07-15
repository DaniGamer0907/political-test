import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  styleUrls: [],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-white/10 bg-white/5 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a routerLink="/home" class="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
            {{ title() }}
          </a>

          <nav class="flex items-center gap-4 text-sm text-slate-300">
            <a routerLink="/home" routerLinkActive="text-white" class="transition hover:text-white">Home</a>
            <a routerLink="/test" routerLinkActive="text-white" class="transition hover:text-white">Test</a>
            <a routerLink="/result" routerLinkActive="text-white" class="transition hover:text-white">Result</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-6 py-10">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  protected readonly title = signal('compass-politico');
}
