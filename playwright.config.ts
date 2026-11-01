import { defineConfig } from '@playwright/test'

// Testes de ponta a ponta: abrem o site de verdade num navegador.
// O Supabase é SIMULADO dentro dos testes (page.route), então não precisam de internet nem de chave real.
// Localmente, aponte para um Chromium já instalado (ex.: Brave) com PW_CHROME_PATH.
// No GitHub Actions o navegador é instalado por "npx playwright install chromium".
const PORT = 5391

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: process.env.PW_CHROME_PATH ? { executablePath: process.env.PW_CHROME_PATH } : {},
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_SUPABASE_URL: 'https://teste.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'chave-publica-de-teste',
    },
  },
})
