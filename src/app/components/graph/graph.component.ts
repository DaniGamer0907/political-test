import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-graph',
  standalone: true,
  template: `
    <section class="rounded-lg border border-white/10 bg-zinc-950/85 p-4 shadow-2xl shadow-black/25 sm:p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Plano cartesiano</p>
          <p class="mt-1 text-sm text-zinc-400">Rango visual: -50 a 50</p>
        </div>
      </div>

      <div class="relative aspect-square w-full overflow-hidden rounded-md border border-white/10 bg-white/5">
        <canvas #canvas class="absolute inset-0 h-full w-full"></canvas>

        <div class="pointer-events-none absolute left-3 top-3 max-w-[42%] rounded bg-black/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-100">
          Izquierda Autoritaria
        </div>
        <div class="pointer-events-none absolute right-3 top-3 max-w-[42%] rounded bg-black/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-100">
          Derecha Autoritaria
        </div>
        <div class="pointer-events-none absolute left-3 bottom-3 max-w-[42%] rounded bg-black/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-100">
          Izquierda Libertaria
        </div>
        <div class="pointer-events-none absolute right-3 bottom-3 max-w-[42%] rounded bg-black/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-100">
          Derecha Libertaria
        </div>

        <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
          Centro
        </div>
      </div>
    </section>
  `,
  styles: [],
})
export class GraphComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  @Input({ required: true })
  x = 0;

  @Input({ required: true })
  y = 0;

  private chart: Chart<'scatter'> | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewReady && (changes['x'] || changes['y'])) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.chart?.destroy();

    const pointX = this.clamp(this.x);
    const pointY = this.clamp(this.y);

    const data: ChartData<'scatter'> = {
      datasets: [
        {
          label: 'Eje X',
          data: [
            { x: -50, y: 0 },
            { x: 50, y: 0 },
          ],
          showLine: true,
          borderColor: 'rgba(148, 163, 184, 0.5)',
          borderWidth: 1,
          pointRadius: 0,
          tension: 0,
        },
        {
          label: 'Eje Y',
          data: [
            { x: 0, y: -50 },
            { x: 0, y: 50 },
          ],
          showLine: true,
          borderColor: 'rgba(148, 163, 184, 0.5)',
          borderWidth: 1,
          pointRadius: 0,
          tension: 0,
        },
        {
          type: 'scatter',
          label: 'Usuario',
          data: [{ x: pointX, y: pointY }],
          backgroundColor: '#34d399',
          borderColor: '#ecfeff',
          pointRadius: 8,
          pointHoverRadius: 10,
          pointBorderWidth: 3,
        },
      ],
    };

    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 250,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `X: ${context.parsed.x}, Y: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: -50,
            max: 50,
            grid: {
              color: 'rgba(148, 163, 184, 0.12)',
            },
            border: {
              color: 'rgba(148, 163, 184, 0.4)',
            },
            ticks: {
              color: 'rgba(226, 232, 240, 0.8)',
              stepSize: 25,
            },
          },
          y: {
            type: 'linear',
            min: -50,
            max: 50,
            grid: {
              color: 'rgba(148, 163, 184, 0.12)',
            },
            border: {
              color: 'rgba(148, 163, 184, 0.4)',
            },
            ticks: {
              color: 'rgba(226, 232, 240, 0.8)',
              stepSize: 25,
            },
          },
        },
      },
    };

    this.chart = new Chart(canvas, config);
  }

  private clamp(value: number): number {
    return Math.max(-50, Math.min(50, value));
  }
}
