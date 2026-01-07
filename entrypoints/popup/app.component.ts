import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block max-w-5xl mx-auto p-8 text-center' },
  template: `
    <div>
      <a href="https://wxt.dev" target="_blank">
        <img
          src="/wxt.svg"
          class="inline-block h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
          alt="WXT logo"
        />
      </a>
      <a href="https://angular.dev" target="_blank">
        <img
          src="/icon/128.png"
          class="inline-block h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#dd0031aa]"
          alt="Angular logo"
        />
      </a>
      <h1 class="text-5xl leading-tight">WXT + Angular</h1>
      <div class="p-8">
        <button
          type="button"
          class="rounded-lg border border-transparent bg-neutral-800 px-5 py-2.5 text-base font-medium text-white cursor-pointer transition-colors hover:border-indigo-400 focus:outline-4 focus:outline-auto"
          (click)="increment()"
        >
          count is {{ count() }}
        </button>
      </div>
      <p class="text-gray-500">Click on the WXT and Angular logos to learn more</p>
    </div>
  `,
})
export class AppComponent {
  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
  }
}
