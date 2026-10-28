import { basePath, routePath } from '../paths'
const origin = window.location.origin
const themeButtons = document.querySelectorAll<HTMLButtonElement>('.theme-control button')
function syncTheme(theme: string) {
  document.documentElement.dataset.theme = theme
  themeButtons.forEach((button) =>
    button.setAttribute(
      'aria-pressed',
      String(button.getAttribute('aria-label') === `Switch to ${theme} theme`),
    ),
  )
}
syncTheme(document.documentElement.dataset.theme ?? 'dark')
for (const button of themeButtons)
  button.addEventListener('click', () => {
    const theme = button.getAttribute('aria-label')?.includes('light') ? 'light' : 'dark'
    syncTheme(theme)
    try {
      localStorage.setItem('image-ui-theme-v2', theme)
    } catch {
      /* Theme works without storage. */
    }
  })
// Resolve explicit local-install placeholders without downloading the documentation catalogue.
for (const code of document.querySelectorAll('pre code'))
  if (code.textContent?.includes('SITE_ORIGIN'))
    code.textContent = code.textContent.replaceAll(
      'SITE_ORIGIN',
      origin + basePath.replace(/\/$/, ''),
    )
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]'))
  button.addEventListener('click', async () => {
    const feedback = button.parentElement!.querySelector<HTMLElement>('.copy-feedback')!
    button.disabled = true
    button.textContent = 'Copying…'
    try {
      let text: string
      if (button.dataset.copyUrl) {
        const response = await fetch(button.dataset.copyUrl)
        if (!response.ok) throw new Error('Documentation unavailable')
        text = (await response.text()).replaceAll(
          'SITE_ORIGIN',
          origin + basePath.replace(/\/$/, ''),
        )
      } else text = button.closest('.doc-code')?.querySelector('pre code')?.textContent ?? ''
      await navigator.clipboard.writeText(text)
      button.textContent = 'Copied'
      feedback.textContent = 'Copied to clipboard.'
    } catch {
      button.textContent = button.getAttribute('aria-label')
      feedback.textContent = 'Clipboard unavailable. Select the text or download Markdown.'
    } finally {
      button.disabled = false
    }
  })
const menuTrigger = document.querySelector<HTMLButtonElement>(
  '.mobile-header button[aria-label="Open component navigation"]',
)
menuTrigger?.addEventListener('click', () => {
  const dialog = document.createElement('dialog')
  dialog.className = 'doc-mobile-dialog'
  dialog.setAttribute('aria-label', 'Image UI navigation')
  const heading = document.createElement('div')
  heading.className = 'mobile-nav-heading'
  const title = document.createElement('h2')
  title.textContent = 'Image UI'
  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'doc-button'
  close.textContent = 'Close'
  close.setAttribute('aria-label', 'Close navigation')
  heading.append(title, close)
  const navigation = document.querySelector('.sidebar .component-nav')!.cloneNode(true)
  navigation.addEventListener('click', () => dialog.close())
  dialog.append(heading, navigation)
  document.body.append(dialog)
  close.addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close()
    }
  })
  dialog.addEventListener(
    'close',
    () => {
      dialog.remove()
      menuTrigger.setAttribute('aria-expanded', 'false')
      menuTrigger.focus()
    },
    { once: true },
  )
  menuTrigger.setAttribute('aria-expanded', 'true')
  dialog.showModal()
})
const pending = new WeakSet<HTMLElement>()
async function activate(element: HTMLElement) {
  if (pending.has(element) || element.dataset.activated) return
  pending.add(element)
  element.setAttribute('aria-busy', 'true')
  const button = element.querySelector<HTMLButtonElement>('[data-live-activate]')
  const focusPreview = button === document.activeElement
  if (button) {
    button.disabled = true
    button.textContent = 'Loading preview…'
  }
  try {
    const { mountIsland } = await import('../islands')
    await mountIsland(element)
    element.dispatchEvent(new Event('image-ui-preview-ready', { bubbles: true }))
    if (focusPreview)
      (
        element.querySelector<HTMLElement>('textarea, input:not([type=hidden])') ??
        element.querySelector<HTMLElement>(
          '.demo-stage button:not([disabled]), .react-flow button:not([disabled])',
        )
      )?.focus()
    element.removeAttribute('aria-busy')
    element.dataset.activated = 'true'
  } catch {
    pending.delete(element)
    element.removeAttribute('aria-busy')
    if (button) {
      button.hidden = false
      button.disabled = false
      button.textContent = 'Retry live preview'
    }
  }
}
for (const element of document.querySelectorAll<HTMLElement>(
  '[data-component-island], [data-example-island]',
)) {
  const button = element.querySelector<HTMLButtonElement>('[data-live-activate]')
  if (button) {
    button.hidden = false
    button.addEventListener('click', () => void activate(element))
    if (button.classList.contains('activate-preview')) {
      const preview = element.querySelector<HTMLElement>('.component-preview')!
      const place = () => {
        button.style.top = `${preview.offsetTop + 11}px`
        button.style.right = `${element.clientWidth - preview.offsetLeft - preview.offsetWidth + 11}px`
      }
      place()
      new ResizeObserver(place).observe(element)
    }
  }
}
if (routePath(window.location.pathname) === '/') {
  const navigation = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          document
            .querySelectorAll<HTMLAnchorElement>('.component-nav a[href^="#"]')
            .forEach((link) => {
              const active = link.hash === `#${entry.target.id}`
              link.classList.toggle('is-active', active)
              if (active) link.setAttribute('aria-current', 'location')
              else link.removeAttribute('aria-current')
            })
        }
    },
    { rootMargin: '-12% 0px -65% 0px' },
  )
  document.querySelectorAll('.component-section').forEach((section) => navigation.observe(section))
  document.addEventListener('image-ui-preview-ready', (event) => {
    const section = (event.target as HTMLElement).querySelector('.component-section')
    if (section) navigation.observe(section)
  })
}
