import { defineConfig } from 'wxt';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    resolve: {
      mainFields: ['module'],
    },
    plugins: [
      angular({
        tsconfig: 'tsconfig.app.json',
      }),
      tailwindcss(),
    ],
  }),
});
