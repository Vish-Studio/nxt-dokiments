import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        optimizeDeps: {
          include: [
            '@phosphor-icons/react',
            '@storybook/addon-docs',
            '@storybook/react-dom-shim',
            'zustand',
            'zustand/middleware',
          ],
        },
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      // Plain Node tests for server-side modules that have no DOM and no story —
      // the retry/timeout policy in `src/lib/http/`, for example. Runs headless, so
      // it needs neither a browser nor a free port, unlike the storybook project.
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
        resolve: {
          alias: {
            // Both aliases come free inside the storybook project (via
            // @storybook/nextjs-vite) but must be declared here.
            '@': path.join(dirname, 'src'),
            // `server-only` isn't a real dependency — Next aliases it at build time to
            // its own copy, whose `react-server` export is an empty module. Point at
            // that stub so importing a server-only module doesn't throw under vitest.
            'server-only': path.join(
              dirname,
              'node_modules/next/dist/compiled/server-only/empty.js',
            ),
          },
        },
      },
    ],
  },
});
