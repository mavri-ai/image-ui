import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('renders all demos without errors and supports generation cancellation and retry', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await expect(page.locator('.component-section')).toHaveCount(8)
  const section = page.locator('#generation-card')
  await expect(section.getByRole('progressbar')).toBeVisible()
  await expect(section.locator('.iu-generation-card').getByRole('status')).toHaveText('Complete', {
    timeout: 6000,
  })
  await section.getByRole('button', { name: 'Failed', exact: true }).click()
  await expect(section.getByText('Generation failed')).toBeVisible()
  await section.getByRole('button', { name: 'Try again' }).click()
  await expect(section.locator('.iu-generation-card').getByRole('status')).toHaveText('Queued')
  await section.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(section.locator('.iu-generation-card').getByRole('status')).toHaveText('Cancelled')
  await section.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(section.locator('.iu-generation-card').getByRole('status')).toHaveText('Complete', {
    timeout: 6000,
  })
  await page.locator('#generative-canvas').scrollIntoViewIfNeeded()
  await expect(page.locator('.react-flow__node')).toHaveCount(2)
  expect(errors).toEqual([])
})

test('uploads real references, validates files, and removes them', async ({ page }) => {
  await page.goto('./#reference-input')
  const section = page.locator('#reference-input')
  await section.getByRole('button', { name: 'Try empty state' }).click()
  await expect(section.getByText('Drop reference images')).toBeVisible()
  const input = section.locator('input[type=file]')
  await input.setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  })
  await expect(section.getByRole('alert')).toContainText('Choose a PNG')
  await input.setInputFiles('public/images/lamp-chess.jpg')
  await expect(section.getByRole('img', { name: 'lamp-chess.jpg' })).toBeVisible()
  await section.getByRole('button', { name: 'Remove lamp-chess.jpg' }).click()
  await expect(section.getByText('Drop reference images')).toBeVisible()
})

test('searches models, selects one and returns focus after dismissing', async ({ page }) => {
  await page.goto('./#model-picker')
  const section = page.locator('#model-picker')
  await section.getByRole('button', { name: 'Popover', exact: true }).click()
  const trigger = section.getByRole('button', { name: 'Select model, GPT Image 2' })
  await trigger.click()
  const search = page.getByRole('textbox', { name: 'Search models' })
  await search.fill('no-such-model')
  await expect(page.getByText('No models found.')).toBeVisible()
  await search.fill('flux')
  await page.getByRole('button', { name: /FLUX\.2 Pro Black Forest Labs/ }).click()
  await expect(section.getByRole('button', { name: 'Select model, FLUX.2 Pro' })).toBeVisible()
  await section.getByRole('button', { name: 'Select model, FLUX.2 Pro' }).click()
  await page.keyboard.press('Escape')
  await expect(section.getByRole('button', { name: 'Select model, FLUX.2 Pro' })).toBeFocused()
})

test('edits settings and runs a prompt without losing input when cancelled', async ({ page }) => {
  await page.goto('./#generation-settings')
  const settings = page.locator('#generation-settings')
  await settings.getByRole('radio', { name: '16:9' }).check()
  await expect(settings.getByRole('radio', { name: '16:9' })).toBeChecked()
  await expect(settings.getByRole('radio', { name: '4:3' })).not.toBeChecked()
  for (let i = 0; i < 3; i++) await settings.getByRole('button', { name: 'More images' }).click()
  await expect(settings.getByRole('button', { name: 'More images' })).toBeDisabled()
  const composer = page.locator('#prompt-composer')
  await composer.getByRole('button', { name: 'Generation settings', exact: true }).click()
  const popover = page.getByRole('dialog', { name: 'Generation settings', exact: true })
  await expect(popover).toBeFocused()
  await expect(popover.getByRole('radio', { name: '4:3' })).toBeChecked()
  await page.keyboard.press('Tab')
  await expect(popover.getByRole('radio', { name: '4:3' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(popover.getByRole('radio', { name: '3:4' })).toBeChecked()
  await page.keyboard.press('Escape')
  await expect(
    composer.getByRole('button', { name: 'Generation settings', exact: true }),
  ).toBeFocused()
  await composer.getByRole('textbox', { name: 'Image prompt' }).fill('A quiet green room')
  await composer.getByRole('button', { name: 'Generate image' }).click()
  await composer.getByRole('button', { name: 'Cancel generation' }).click()
  await expect(composer.getByRole('textbox', { name: 'Image prompt' })).toHaveValue(
    'A quiet green room',
  )
  await expect(composer.locator('.demo-prompt-status')).toContainText('Cancelled')
})

test('selects outputs, handles partial failure, and changes versions', async ({ page }) => {
  await page.goto('./#output-gallery')
  const gallery = page.locator('#output-gallery')
  await gallery.getByRole('button', { name: 'Select Fragrance in motion' }).click()
  await expect(gallery.locator('.iu-field-heading')).toContainText('2 selected')
  await gallery.getByRole('button', { name: 'Mixed results' }).click()
  await expect(gallery.getByText('Generating…')).toBeVisible()
  await gallery.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(gallery.getByRole('button', { name: 'Select Pistachio study' })).toBeVisible()
  const history = page.locator('#version-history')
  await history.getByRole('button', { name: 'View Version 03' }).click()
  await expect(history.locator('.iu-history-image img')).toHaveCount(1)
  await expect(history.locator('.iu-history-image img')).toHaveAttribute(
    'src',
    `${process.env.IMAGE_UI_BASE_PATH ?? '/'}images/light-detail.jpg`,
  )
  await expect(history.locator('.iu-history-details')).toContainText('FLUX')
})

test('opens the generation preview and returns focus on dismissal', async ({ page }) => {
  await page.goto('./#generation-card')
  const section = page.locator('#generation-card')
  await section.getByRole('button', { name: 'Complete', exact: true }).click()
  await section.getByRole('button', { name: 'Expand image' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(section.getByRole('button', { name: 'Expand image' })).toBeFocused()
})

test('runs a connected canvas with notes, detachable links, and movable nodes', async ({
  page,
}) => {
  await page.goto('./#generative-canvas')
  const canvas = page.locator('#generative-canvas')
  await expect(canvas.locator('.react-flow__node')).toHaveCount(2)
  await expect(canvas.getByText('No output yet')).toHaveCount(0)
  const generation = canvas.locator('.react-flow__node[data-id="generation"]')
  await canvas.getByRole('button', { name: 'Add note node' }).click()
  const note = canvas
    .locator('.react-flow__node')
    .filter({ has: page.getByRole('textbox', { name: 'Note text' }) })
  await note
    .getByRole('textbox', { name: 'Note text' })
    .fill('Use warm shadows and a low camera angle.')
  await note.locator('.react-flow__handle.source').click()
  await generation.locator('.react-flow__handle.target').click()
  await expect(
    generation.getByText('Use warm shadows and a low camera angle.', { exact: true }),
  ).toBeVisible()
  const promptHeight = await generation.evaluate((element) => element.clientHeight)
  await generation.getByRole('button', { name: 'Generate image' }).click()
  const output = canvas.locator('.react-flow__node[data-id="output-generation"]')
  await expect(output.getByRole('progressbar')).toBeVisible()
  expect(await generation.evaluate((element) => element.clientHeight)).toBe(promptHeight)
  await expect(output.locator('img')).toBeVisible({ timeout: 6000 })
  await expect(output.locator('img')).toHaveAttribute(
    'alt',
    /Use warm shadows and a low camera angle/,
  )
  const reference = canvas.locator('.react-flow__node[data-id="reference"]')
  expect(await output.locator('img').getAttribute('src')).not.toBe(
    await reference.locator('img').getAttribute('src'),
  )
  await generation.getByRole('button', { name: 'Disconnect Note', exact: true }).click()
  await expect(
    generation.getByText('Use warm shadows and a low camera angle.', { exact: true }),
  ).toHaveCount(0)
  await reference.hover()
  await reference.getByRole('button', { name: 'Detach Reference' }).click()
  await expect(generation.locator('.iu-canvas-sources')).toHaveCount(0)
  const before = await reference.getAttribute('style')
  const image = reference.locator('.iu-canvas-node-image')
  const rect = await image.boundingBox()
  if (!rect) throw new Error('Reference image missing')
  await page.mouse.move(rect.x + 45, rect.y + 10)
  await page.mouse.down()
  await page.mouse.move(rect.x + 85, rect.y + 50, { steps: 8 })
  await page.mouse.up()
  await expect(reference).not.toHaveAttribute('style', before!)
  await note.hover()
  await note.getByRole('button', { name: 'Delete Note' }).click()
  await expect(note).toHaveCount(0)
  await canvas.getByLabel('Upload canvas reference').setInputFiles('public/images/light-detail.jpg')
  await expect(canvas.locator('.iu-canvas-node[data-kind="reference"]')).toHaveCount(2)
  await canvas.getByRole('button', { name: 'Generation', exact: true }).click()
  await expect(canvas.locator('.iu-canvas-node[data-kind="generation"]')).toHaveCount(2)
})

test('copies source and serves a complete component registry item', async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('./')
  const section = page.locator('#generation-card')
  await section.getByRole('button', { name: 'Copy Generation card source', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'export function GenerationCard',
  )
  await section.getByRole('button', { name: 'Failed', exact: true }).click()
  await section.getByRole('button', { name: 'Code', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Generation card', exact: true })
  await expect(dialog).toBeVisible()
  await expect(section.locator('.iu-generation-card')).toHaveAttribute('data-status', 'failed')
  await dialog.getByRole('button', { name: 'Copy source', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'export function GenerationCard',
  )
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(section.getByRole('button', { name: 'Code', exact: true })).toBeFocused()
  await expect(section.locator('.iu-generation-card')).toHaveAttribute('data-status', 'failed')
  await section.getByRole('button', { name: 'Install component' }).click()
  await expect(section.locator('.install-panel')).toContainText(
    `${process.env.IMAGE_UI_BASE_PATH ?? '/'}r/generation-card.json`,
  )
  const response = await request.get('./r/prompt-composer.json')
  expect(response.ok()).toBeTruthy()
  const item = await response.json()
  expect(
    item.files.some((file: { target: string }) => file.target.endsWith('/image-ui.css')),
  ).toBeTruthy()
  expect(
    item.files.some((file: { target: string }) => file.target.endsWith('/types.ts')),
  ).toBeTruthy()
  expect(item.dependencies).toEqual(expect.arrayContaining(['radix-ui', 'motion', 'lucide-react']))
})

test('supports mobile navigation, dark theme, reduced motion and no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.getByRole('button', { name: 'Open component navigation' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Output gallery' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page).toHaveURL(/#output-gallery/)
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.locator('#generative-canvas').scrollIntoViewIfNeeded()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})

test('has no automated WCAG A/AA violations in light, dark and mobile layouts', async ({
  page,
}) => {
  await page.goto('./')
  await page.locator('#generative-canvas').scrollIntoViewIfNeeded()
  await expect(page.locator('.react-flow__node')).toHaveCount(2)
  await expect(page.locator('#generation-card .iu-generation-card')).toHaveAttribute(
    'data-status',
    'complete',
    { timeout: 10000 },
  )
  for (const theme of ['light', 'dark']) {
    await page.evaluate(async (theme) => {
      document.documentElement.dataset.theme = theme
      await new Promise(requestAnimationFrame)
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      )
    }, theme)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations, `${theme} layout`).toEqual([])
  }
  await page.setViewportSize({ width: 390, height: 844 })
  const mobile = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(mobile.violations, 'mobile dark layout').toEqual([])
})
