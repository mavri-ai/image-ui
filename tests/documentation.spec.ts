import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { catalog } from '../src/catalog'

// HTTP assertions prove the docs are in the response, independently of hydration.
test('all component pages ship complete HTML, unique metadata, and matching Markdown', async ({
  request,
}) => {
  const titles = new Set<string>()
  for (const item of catalog) {
    const response = await request.get(`./components/${item.id}`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain('API reference')
    expect(html).toContain('Copy documentation')
    expect(html).toContain(`<h1>${item.title}</h1>`)
    expect(html).toContain('/r/' + item.id + '.json')
    expect(html).not.toContain('<!--app-html-->')
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    expect(title).toBeTruthy()
    titles.add(title!)
    const md = await request.get(`./components/${item.id}.md`)
    expect(md.status()).toBe(200)
    expect(await md.text()).toContain(`# ${item.title}`)
    expect(await md.text()).toContain('## API reference')
    expect(html).toContain('application/ld+json')
  }
  expect(titles.size).toBe(catalog.length)
})

test('documentation and navigation remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('./components')
  await page.getByRole('link', { name: /Prompt composer References/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Prompt composer', exact: true, level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'API reference' })).toBeVisible()
  await page.getByRole('link', { name: 'Installation guide' }).click()
  await expect(
    page.getByRole('heading', { name: 'Installation', exact: true, level: 1 }),
  ).toBeVisible()
  await context.close()
})

test('exports the complete documentation index, text bundle, and useful registry descriptions', async ({
  request,
}) => {
  const index = await request.get('./llms.txt')
  expect(index.ok()).toBeTruthy()
  const text = await index.text()
  for (const item of catalog) expect(text).toContain(`/components/${item.id}.md`)
  expect(text).toContain('/guides/image-generation-workflow.md')
  const full = await request.get('./llms-full.txt')
  expect(full.ok()).toBeTruthy()
  const body = await full.text()
  expect(body).toContain('## Simulation hook')
  expect(body).toContain('## API reference')
  const registry = await (await request.get('./registry.json')).json()
  expect(registry.items).toHaveLength(9)
  expect(
    registry.items.every(
      (item: { description: string; docs: string }) =>
        item.description.includes('Controlled React UI') && item.docs.includes('.md'),
    ),
  ).toBeTruthy()
  const api = await (await request.get('./api/components.json')).json()
  expect(api.components['generation-card']).toEqual(
    expect.arrayContaining([
      { name: 'loading', type: '\"eager\" | \"lazy\"', required: false, default: 'lazy' },
    ]),
  )
  expect(api.sharedTypes).toContain('export interface GenerationOptions')
  expect((await request.get('./robots.txt')).status()).toBe(200)
  for (const [url, target] of [
    ['/index.html', '/'],
    ['/components/prompt-composer/index.html?from=docs', '/components/prompt-composer?from=docs'],
  ]) {
    const redirect = await request.get('.' + url, { maxRedirects: 0 })
    expect(redirect.status()).toBe(308)
    expect(redirect.headers().location).toBe(
      `${process.env.IMAGE_UI_BASE_PATH ?? '/'}${target.slice(1)}`,
    )
  }
  expect((await request.get('./missing-component')).status()).toBe(404)
  expect((await request.get('./components/not-real')).status()).toBe(404)
  expect((await request.get('./components/not-real.md')).status()).toBe(404)
  expect(await (await request.get('./missing-component')).text()).toContain('noindex,follow')
})

test('copies complete docs and handles unavailable clipboard access', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('./components/reference-input')
  await page.getByRole('button', { name: 'Copy documentation', exact: true }).click()
  await expect(page.getByText('Copied to clipboard.', { exact: true })).toBeVisible()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('# Reference input')
  expect(copied).toContain('## API reference')
  expect(copied).toContain('maxSizeMB')
  expect(copied).toContain('npx shadcn@latest add https://mavri.ai/image-ui/')
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    }),
  )
  await page.getByRole('button', { name: 'Copy documentation', exact: true }).click()
  await expect(
    page.getByText('Clipboard unavailable. Select the text or download Markdown.'),
  ).toBeVisible()
})

test('workflow supports cancellation, failures, retry and output selection', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./guides/image-generation-workflow')
  await page.getByRole('button', { name: 'Try live workflow' }).click()
  await expect(page.locator('[data-example-island]')).toHaveAttribute('data-activated', 'true')
  const workflow = page.locator('.workflow-preview')
  const input = workflow.getByRole('textbox', { name: 'Image prompt' })
  await expect(input).toBeFocused()
  await input.fill('A calm green room')
  await workflow.getByRole('button', { name: 'Generate image', exact: true }).click()
  await workflow.getByRole('button', { name: 'Cancel generation', exact: true }).click()
  await expect(input).toHaveValue('A calm green room')
  await expect(
    workflow.getByText('Cancelled. Your prompt and references are preserved.'),
  ).toBeVisible()
  await workflow.getByRole('button', { name: 'Generate image', exact: true }).click()
  await workflow.getByRole('button', { name: 'Simulate failure' }).click()
  await expect(workflow.getByText('Generation failed')).toBeVisible()
  await workflow
    .locator('.iu-generation-placeholder')
    .filter({ hasText: 'Generation failed' })
    .getByRole('button', { name: 'Try again' })
    .click()
  await expect(workflow.getByRole('button', { name: 'Select A calm green room' })).toBeVisible({
    timeout: 6000,
  })
  await workflow.getByRole('button', { name: 'Select A calm green room' }).click()
  await expect(workflow.locator('.iu-field-heading')).toContainText('1 selected')
  expect(errors).toEqual([])
})

test('documentation is accessible in both themes and mobile navigation works', async ({ page }) => {
  await page.goto('./components/prompt-composer')
  for (const theme of ['light', 'dark']) {
    await page.getByRole('button', { name: `Switch to ${theme} theme` }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      )
    })
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations, theme).toEqual([])
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open component navigation' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Complete workflow' }).click()
  await expect(
    page.getByRole('heading', { name: 'Build an image-generation workflow', level: 1 }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations, 'mobile workflow').toEqual([])
})

test('component previews work immediately without an activation gate', async ({ page }) => {
  await page.goto('./components/prompt-composer')
  await expect(page.getByRole('button', { name: 'Try live preview' })).toHaveCount(0)
  const input = page.getByRole('textbox', { name: 'Image prompt' })
  await input.click()
  await expect(input).toBeFocused()
  await input.fill('A quiet room in morning light')
  await expect(input).toHaveValue('A quiet room in morning light')
  await expect(page.locator('[data-component-island]')).toHaveAttribute('data-activated', 'true')
})

test('retries only failed outputs and preserves selection', async ({ page }) => {
  await page.goto('./guides/partial-failures')
  await page.getByRole('button', { name: 'Try live example' }).click()
  await expect(page.locator('[data-example-island]')).toHaveAttribute('data-activated', 'true')
  const demo = page.locator('.workflow-preview')
  await demo.getByRole('button', { name: 'Select Golden dunes' }).click()
  await demo.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(demo.getByRole('button', { name: 'Select Quiet coast' })).toBeVisible()
  await expect(demo.locator('.iu-field-heading')).toContainText('1 selected')
  await expect(demo.getByRole('button', { name: 'Select Desert variation' })).toBeVisible()
})

test('restores a version only on explicit action', async ({ page }) => {
  await page.goto('./guides/version-restoration')
  await page.getByRole('button', { name: 'Try live example' }).click()
  await expect(page.locator('[data-example-island]')).toHaveAttribute('data-activated', 'true')
  const demo = page.locator('.workflow-preview')
  await demo.getByRole('button', { name: 'View Version 02' }).click()
  await expect(demo.getByRole('textbox', { name: 'Current prompt' })).toHaveValue(
    'My current prompt',
  )
  await demo.getByRole('button', { name: 'Restore selected version' }).click()
  await expect(demo.getByRole('textbox', { name: 'Current prompt' })).toHaveValue(
    'A quiet coast at sunset',
  )
  await expect(demo.getByText('16:9 · standard · 2 image(s)')).toBeVisible()
})

test('reuses outputs without duplicating references', async ({ page }) => {
  await page.goto('./guides/reference-reuse')
  await page.getByRole('button', { name: 'Try live example' }).click()
  await expect(page.locator('[data-example-island]')).toHaveAttribute('data-activated', 'true')
  const demo = page.locator('.workflow-preview')
  await demo.getByRole('button', { name: 'Use as reference' }).click()
  await expect(demo.getByRole('button', { name: 'Remove Desert result' })).toBeVisible()
  await demo.getByRole('button', { name: 'Use as reference' }).click()
  await expect(demo.getByText('This output is already a reference.')).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Remove Desert result' })).toHaveCount(1)
})

test('canvas connection example rejects duplicates and resets controlled edges', async ({
  page,
}) => {
  await page.goto('./guides/canvas-connections')
  await page.getByRole('button', { name: 'Try live example' }).click()
  await expect(page.locator('[data-example-island]')).toHaveAttribute('data-activated', 'true')
  const demo = page.locator('.workflow-preview')
  await demo.getByRole('button', { name: 'Connect reference', exact: true }).click()
  await expect(demo.locator('.workflow-demo > p[role="status"]')).toContainText(
    'Connected reference to generation.',
  )
  await demo.getByRole('button', { name: 'Connect reference', exact: true }).click()
  await expect(demo.locator('.workflow-demo > p[role="status"]')).toContainText(
    'That connection already exists.',
  )
  await demo.getByRole('button', { name: 'Reset connections' }).click()
  await expect(demo.locator('.workflow-demo > p[role="status"]')).toContainText(
    'Connections cleared.',
  )
})
