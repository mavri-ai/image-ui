import { useEffect, useState, type ComponentType } from 'react'
import { Dialog } from 'radix-ui'
import { Check, Code2, Copy, Terminal, X, ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { catalog } from './catalog'
import { loadComponentSource } from './source'
import { publicPath } from './paths'
import { installCommand } from './routes'
import { CopyButton } from './components/arc/copy-button'
import { IconButton } from './components/image-ui/primitives'
export function ComponentSection({
  item,
  index,
  origin,
  documentation = false,
  Demo,
}: {
  item: (typeof catalog)[number]
  index: number
  origin: string
  documentation?: boolean
  Demo: ComponentType
}) {
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
  const command = installCommand(item.id, origin)
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
        <h2 id={`${item.id}-title`}>{documentation ? 'Interactive preview' : item.title}</h2>
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
      {!documentation ? (
        <div className="component-doc-link">
          <a href={publicPath(`/components/${item.id}`)}>
            Documentation <ArrowUpRight size={12} />
          </a>
          <span>Usage, API &amp; examples</span>
        </div>
      ) : null}
      {copyError ? (
        <p role="alert" className="copy-error">
          Clipboard unavailable. Select and copy the code directly.
        </p>
      ) : null}
    </section>
  )
}
