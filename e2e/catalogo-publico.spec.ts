import { expect, test, type Page } from '@playwright/test'

// PNG de 1x1 pixel, para as capas simuladas.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const revista = (n: number) => ({
  id: `id-${n}`,
  title: `Edição ${n}`,
  issue: String(n),
  year: 1990 + n,
  month: 3,
  condition: null,
  cover_model: null,
  cover_image_url: `https://teste.supabase.co/storage/v1/object/public/magazine-covers/u/${n}.png`,
  acquired: true,
  is_public: true,
  created_at: `2026-01-0${n}T00:00:00Z`,
})

async function simularSupabase(page: Page, total = 3) {
  const externos: string[] = []
  await page.route('**/rest/v1/public_magazines*', (route) =>
    route.fulfill({ json: Array.from({ length: total }, (_, i) => revista(i + 1)) }),
  )
  await page.route('**/storage/v1/object/public/**', (route) =>
    route.fulfill({ body: PIXEL, contentType: 'image/png' }),
  )
  page.on('request', (r) => {
    const { hostname } = new URL(r.url())
    if (hostname !== 'localhost' && hostname !== 'teste.supabase.co') externos.push(r.url())
  })
  return externos
}

test('visitante confirma os 18 anos, abre o mosaico e navega pelas capas no lightbox', async ({ page }) => {
  const externos = await simularSupabase(page)
  await page.goto('/public')

  // Aviso 18+ aparece e bloqueia a página até confirmar
  const aviso = page.getByRole('dialog', { name: /18 anos/i })
  await expect(aviso).toBeVisible()
  await page.getByRole('button', { name: /tenho 18 anos/i }).click()
  await expect(aviso).toBeHidden()

  await expect(page.getByText('3 de 3 revistas públicas')).toBeVisible()
  await expect(page).toHaveTitle(/Catálogo público · Vault Keeper/)

  // Mosaico: clicar na capa abre a foto inteira
  await page.getByRole('button', { name: 'Mosaico' }).click()
  await page.getByRole('button', { name: /Ver a capa inteira de Edição 1\b/ }).click()
  const lightbox = page.getByRole('dialog', { name: 'Capa de Edição 1' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox.getByText('1 / 3')).toBeVisible()

  // Setas do teclado andam entre as capas
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('dialog', { name: 'Capa de Edição 2' })).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('dialog', { name: 'Capa de Edição 1' })).toBeVisible()

  // Esc fecha
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Privacidade: nenhuma requisição saiu para domínios de terceiros
  expect(externos).toEqual([])
})

test('"Mostrar mais" revela o restante', async ({ page }) => {
  await simularSupabase(page, 30)
  await page.addInitScript(() => localStorage.setItem('idade-confirmada', 'sim'))
  await page.goto('/public')

  await expect(page.getByText('30 de 30 revistas públicas')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(24)
  await page.getByRole('button', { name: /Mostrar mais \(6 restantes\)/ }).click()
  await expect(page.locator('article.card')).toHaveCount(30)
  await expect(page.getByRole('button', { name: /Mostrar mais/ })).toHaveCount(0)
})

test('páginas legais abrem pelo rodapé e a rota desconhecida mostra 404', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('idade-confirmada', 'sim'))
  await page.goto('/')
  await page.getByRole('link', { name: 'Privacidade e cookies' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/privacidade/i)
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
