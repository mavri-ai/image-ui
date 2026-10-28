import { defineConfig } from '@playwright/test'

const production = process.env.IMAGE_UI_TEST_PRODUCTION === '1'
const port = production ? 5178 : 5179
const base = process.env.IMAGE_UI_BASE_PATH ?? '/'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}${base}`,
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: production
      ? `npm run preview -- --port ${port} --strictPort`
      : `npm run dev -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}${base}`,
    reuseExistingServer: false,
  },
})
