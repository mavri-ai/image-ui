import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { Check, Code2, Copy, Menu, Moon, Sun, Terminal, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { catalog, loadComponentSource, type ComponentId } from './catalog'
import {
  CanvasSectionDemo,
  GalleryDemo,
  GenerationDemo,
  HistoryDemo,
  ModelDemo,
  PromptDemo,
  ReferenceDemo,
  SettingsDemo,
} from './demo/component-demos'
import { CopyButton } from './components/arc/copy-button'
import { IconButton } from './components/image-ui/primitives'

const demos: Record<ComponentId, () => ReactNode> = {
  'generation-card': GenerationDemo,
  'reference-input': ReferenceDemo,
  'prompt-composer': PromptDemo,
  'model-picker': ModelDemo,
  'generation-settings': SettingsDemo,
  'output-gallery': GalleryDemo,
  'version-history': HistoryDemo,
  'generative-canvas': CanvasSectionDemo,
}

function Github({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.8a3.3 3.3 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.9a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7S17.5.8 15 2.6a13 13 0 0 0-7 0C5.5.8 4.3 1.2 4.3 1.2a5 5 0 0 0-.1 3.7 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.2 6.9a3.3 3.3 0 0 0-.9 2.6V22" />
    </svg>
  )
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <a className={`brand ${small ? 'brand--small' : ''}`} href="#" aria-label="Image UI home">
      <span className="brand-mark" aria-hidden="true">
        <img
          className="brand-mark-light"
          src={`${import.meta.env.BASE_URL}brand/mavri-star-light.svg`}
          alt=""
          width="56"
          height="44"
        />
        <img
          className="brand-mark-dark"
          src={`${import.meta.env.BASE_URL}brand/mavri-star-dark.svg`}
          alt=""
          width="56"
          height="44"
        />
      </span>
      <span>Image UI</span>
    </a>
  )
}

function ComponentSection({ item, index }: { item: (typeof catalog)[number]; index: number }) {
  const [codeOpen, setCodeOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [copyError, setCopyError] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [source, setSource] = useState('')
  const [sourceError, setSourceError] = useState(false)
  useEffect(() => {
    if (source) return
    let current = true
    const load = () =>
      loadComponentSource(item.id).then(
        (text) => {
          if (current) setSource(text)
        },
        () => {
          if (current) setSourceError(true)
        },
      )
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          void load()
        }
      },
      { rootMargin: '300px' },
    )
    const section = document.getElementById(item.id)
    if (codeOpen) void load()
    else if (section) observer.observe(section)
    return () => {
      current = false
      observer.disconnect()
    }
  }, [codeOpen, item.id, source])
  const Demo = demos[item.id]
  const command = `npx shadcn@latest add ${window.location.origin}${import.meta.env.BASE_URL}r/${item.id}.json`
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setCopyError(false)
    } catch {
      setCopyError(true)
    }
  }
  return (
    <section id={item.id} className="component-section" aria-labelledby={`${item.id}-title`}>
      <div className="component-heading">
        <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
        <h2 id={`${item.id}-title`}>{item.title}</h2>
        <p>{item.description}</p>
      </div>
      <div
        className={`component-preview ${item.id === 'generative-canvas' ? 'component-preview--canvas' : ''}`}
      >
        <div className="component-tools" role="group" aria-label={`${item.title} view`}>
          <CopyButton
            value={source}
            label={`Copy ${item.title} source`}
            iconOnly
            disabled={!source}
          />
          <Dialog.Root open={codeOpen} onOpenChange={setCodeOpen}>
            <Dialog.Trigger asChild>
              <IconButton label="Code">
                <Code2 size={15} />
              </IconButton>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="code-dialog-overlay" />
              <Dialog.Content className="code-dialog" aria-describedby={undefined}>
                <div className="code-dialog-heading">
                  <Dialog.Title>{item.title}</Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton label="Close code">
                      <X size={16} />
                    </IconButton>
                  </Dialog.Close>
                </div>
                <div className="code-panel">
                  <div className="code-toolbar">
                    <span>{item.id}.tsx</span>
                    <CopyButton value={source} label="Copy source" disabled={!source} />
                  </div>
                  <pre tabIndex={0} aria-label={`${item.title} source code`}>
                    <code>
                      {source ||
                        (sourceError
                          ? 'Could not load source. Reopen to try again.'
                          : 'Loading source…')}
                    </code>
                  </pre>
                  <div className="code-dependency-note">
                    Install includes the component, styles, types, and dependencies.
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <IconButton
            label="Install component"
            aria-expanded={showInstall}
            onClick={() => setShowInstall(!showInstall)}
          >
            <Terminal size={14} />
          </IconButton>
        </div>
        <Demo />
        <AnimatePresence initial={false}>
          {showInstall ? (
            <motion.div
              className="install-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div>
                <code>{command}</code>
                <IconButton
                  label={`Copy ${item.title} install command`}
                  onClick={() => void copy(command, 'install')}
                >
                  {copied === 'install' ? <Check size={14} /> : <Copy size={14} />}
                </IconButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {copyError ? (
        <p role="alert" className="copy-error">
          Clipboard unavailable. Select and copy the code directly.
        </p>
      ) : null}
    </section>
  )
}

export default function App() {
  const [active, setActive] = useState<string>('generation-card')
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'dark')
  const [mobileOpen, setMobileOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('image-ui-theme-v2', theme)
    } catch {
      /* Theme still works without storage. */
    }
  }, [theme])
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.component-section'))
    let frame = 0
    function updateActive() {
      frame = 0
      const marker = window.innerHeight * 0.25
      let current: HTMLElement | undefined = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section
        else break
      }
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom) current = sections.at(-1)
      if (current) setActive(current.id)
    }
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActive)
    }
    updateActive()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  const navigation = (
    <nav className="component-nav" aria-label="Components">
      <div className="nav-group-label">Components</div>
      {catalog.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={active === item.id ? 'is-active' : ''}
          aria-current={active === item.id ? 'location' : undefined}
          onClick={() => {
            setActive(item.id)
            setMobileOpen(false)
          }}
        >
          {item.title}
        </a>
      ))}
    </nav>
  )
  const themeControl = (
    <div className="theme-control" role="group" aria-label="Color theme">
      <motion.span
        className="theme-control-selection"
        aria-hidden="true"
        initial={false}
        animate={{ x: theme === 'dark' ? 27 : 0 }}
        transition={
          reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
        }
      />
      <IconButton
        label="Switch to light theme"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        <Sun size={13} />
      </IconButton>
      <IconButton
        label="Switch to dark theme"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        <Moon size={13} />
      </IconButton>
    </div>
  )
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to components
      </a>
      <div className="site-frame">
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-brand-row">
              <Logo />
              {themeControl}
            </div>
            <h1>
              Components for
              <br />
              image generation.
            </h1>
            {navigation}
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-footer-links">
              <a
                className="sidebar-byline"
                href="https://mavri.ai"
                target="_blank"
                rel="noreferrer"
              >
                Made by <strong>Mavri</strong>
              </a>
              <a
                className="source-link"
                href="https://github.com/mavri-ai/image-ui"
                target="_blank"
                rel="noreferrer"
                aria-label="View source code on GitHub"
              >
                <Github size={13} />
                Source
              </a>
            </div>
            <div className="sidebar-meta">
              <span>v0.1</span>
              <a href={`${import.meta.env.BASE_URL}LICENSE`} target="_blank" rel="noreferrer">
                MIT License
              </a>
            </div>
          </div>
        </aside>
        <header className="mobile-header">
          <Logo small />
          {themeControl}
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <IconButton label="Open component navigation">
                <Menu size={18} />
              </IconButton>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="mobile-nav-overlay" />
              <Dialog.Content className="mobile-nav" aria-describedby={undefined}>
                <div className="mobile-nav-heading">
                  <Dialog.Title>Image UI</Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton label="Close navigation">
                      <X size={18} />
                    </IconButton>
                  </Dialog.Close>
                </div>
                {navigation}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>
        <main id="main">
          {catalog.map((item, index) => (
            <ComponentSection key={item.id} item={item} index={index} />
          ))}
        </main>
      </div>
    </>
  )
}
