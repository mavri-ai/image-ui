import type { ReactNode } from 'react'
import { ArrowUpRight, Menu, Moon, Sun } from 'lucide-react'
import { catalog, showcaseCatalog } from './catalog'
import { findPage, supportPages } from './routes'
import { StaticComponentSection } from './demo/static-preview'
import { IconButton } from './components/image-ui/primitives'

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
    <a className={`brand ${small ? 'brand--small' : ''}`} href="/" aria-label="Image UI home">
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

export default function App({ path = '/', content }: { path?: string; content?: ReactNode }) {
  const page = findPage(path)
  const home = path === '/'
  const indexPage = path === '/components'
  const active = 'generation-card'

  const navigation = (
    <nav className="component-nav" aria-label="Components">
      <div className="nav-group-label">Components</div>
      {!home ? <a href="/">Showcase</a> : null}
      {!home ? (
        <a href="/components" aria-current={indexPage ? 'page' : undefined}>
          All components
        </a>
      ) : null}
      {(home ? showcaseCatalog : catalog).map((item) => (
        <a
          key={item.id}
          href={home ? `#${item.id}` : `/components/${item.id}`}
          className={(home ? active === item.id : page?.component === item.id) ? 'is-active' : ''}
          aria-current={
            (home ? active === item.id : page?.component === item.id)
              ? home
                ? 'location'
                : 'page'
              : undefined
          }
        >
          {item.title}
        </a>
      ))}
      <div className="nav-group-label nav-doc-label" hidden={home}>
        Documentation
      </div>
      {!home &&
        supportPages.map((doc) => (
          <a
            key={doc.path}
            href={doc.path}
            aria-current={path === doc.path ? 'page' : undefined}
            className={path === doc.path ? 'is-active' : ''}
          >
            {doc.path === '/guides/image-generation-workflow' ? 'Complete workflow' : doc.title}
          </a>
        ))}
    </nav>
  )
  const themeControl = (
    <div className="theme-control" role="group" aria-label="Color theme">
      <span className="theme-control-selection" aria-hidden="true" />
      <IconButton label="Switch to light theme" aria-pressed={false}>
        <Sun size={13} />
      </IconButton>
      <IconButton label="Switch to dark theme" aria-pressed={true}>
        <Moon size={13} />
      </IconButton>
    </div>
  )
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className={`site-frame ${home ? '' : 'site-frame--docs'}`}>
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-brand-row">
              <Logo />
              {themeControl}
            </div>
            {home ? (
              <h1>
                Components for
                <br />
                image generation.
              </h1>
            ) : (
              <p className="sidebar-tagline">
                Components for
                <br />
                image generation.
              </p>
            )}
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
              <a href="/LICENSE" target="_blank" rel="noreferrer">
                MIT License
              </a>
            </div>
          </div>
        </aside>
        <header className="mobile-header">
          <Logo small />
          {themeControl}
          <IconButton
            label="Open component navigation"
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            <Menu size={18} />
          </IconButton>
        </header>
        <main id="main">
          {home ? (
            <>
              {showcaseCatalog.map((item, index) => (
                <StaticComponentSection key={item.id} id={item.id} index={index} />
              ))}
            </>
          ) : (
            (content ?? (
              <article className="documentation">
                <header className="doc-heading">
                  <span className="doc-eyebrow">404</span>
                  <h1>Page not found</h1>
                  <p>Find a component or return to the showcase.</p>
                  <a className="doc-button" href="/components">
                    Browse components <ArrowUpRight size={13} />
                  </a>
                </header>
              </article>
            ))
          )}
          {!home ? (
            <footer className="page-footer">
              <span>Image UI · Mavri</span>
              <a href="/llms.txt">llms.txt</a>
              <a href="/llms-full.txt">Full documentation</a>
              <a href="https://github.com/mavri-ai/image-ui" target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRight size={12} />
              </a>
              <p>
                Interactive demos. Generation is simulated. Photography from{' '}
                <a href="https://unsplash.com" target="_blank" rel="noreferrer">
                  Unsplash
                </a>
                .
              </p>
            </footer>
          ) : null}
        </main>
      </div>
    </>
  )
}
