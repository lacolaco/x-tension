import { defineConfig } from 'wxt';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'x-tension',
    description: 'Enhance your x.com experience',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: '{1557cd86-ae55-4b95-9a18-0af1aed65684}',
      },
    },
  },
  vite: () => ({
    resolve: {
      mainFields: ['module'],
    },
    plugins: [
      angular({
        tsconfig: 'tsconfig.app.json',
        // Only transform files in the popup directory
        transformFilter: (_code: string, id: string) => {
          return id.includes('/entrypoints/popup/');
        },
      }),
      tailwindcss(),
    ],
  }),
});
