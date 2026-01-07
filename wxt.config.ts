import { defineConfig } from 'wxt';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'x-tension',
    short_name: 'x-tension',
    description: 'Enhance your x.com experience with customizable features',
    homepage_url: 'https://github.com/lacolaco/x-tension',
    permissions: ['storage', 'webNavigation'],
    browser_specific_settings: {
      gecko: {
        id: '{1557cd86-ae55-4b95-9a18-0af1aed65684}',
        // Required for Firefox extensions - declares no data collection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data_collection_permissions: {
          required: ['none'],
        },
      } as Record<string, unknown>,
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
