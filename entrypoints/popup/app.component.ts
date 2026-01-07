import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <a href="https://wxt.dev" target="_blank">
        <img src="/wxt.svg" class="logo" alt="WXT logo" />
      </a>
      <a href="https://angular.dev" target="_blank">
        <img src="/icon/128.png" class="logo angular" alt="Angular logo" />
      </a>
      <h1>WXT + Angular</h1>
      <div class="card">
        <button type="button" (click)="increment()">count is {{ count() }}</button>
      </div>
      <p class="read-the-docs">
        Click on the WXT and Angular logos to learn more
      </p>
    </div>
  `,
  styles: [`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.angular:hover {
      filter: drop-shadow(0 0 2em #dd0031aa);
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      color: #fff;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    h1 {
      font-size: 3.2em;
      line-height: 1.1;
    }
  `],
})
export class AppComponent {
  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
  }
}
