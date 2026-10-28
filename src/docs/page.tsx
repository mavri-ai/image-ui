import { basePath } from '../paths'
import { ArrowRight, Copy, Download } from 'lucide-react'
import { catalog } from '../catalog'
import { exampleSource, installCommand, simulationSource, type DocPage } from './content'

import type { ComponentType } from 'react'
import { StaticCanvas } from '../demo/static-preview'
import { canvasRulesSource } from './content'
const examples = import.meta.glob<{ default: ComponentType }>('../examples/*.tsx', { eager: true })
export function CopyButton({ label = 'Copy', url }: { label?: string; url?: string }) {
  return (
    <span className="copy-control">
      <button type="button" className="doc-button" data-copy data-copy-url={url} aria-label={label}>
        <Copy size={13} />
        {label}
      </button>
      <span className="copy-feedback" role="status" />
    </span>
  )
}

export function CodeBlock({
  code,
  language = 'tsx',
  label = 'Copy code',
}: {
  code: string
  language?: string
  label?: string
}) {
  return (
    <div className="doc-code">
      <div className="doc-code-header">
        <span>{language}</span>
        <CopyButton label={label} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
function ResourceLinks() {
  return (
    <p className="doc-note">
      Examples use local sample image paths. Supply your own assets. Timer-based examples also need
      the{' '}
      <a href="/examples/use-demo-generation.ts" download>
        simulation hook
      </a>
      . Examples include <code>&apos;use client&apos;</code> for React Server Components apps.
    </p>
  )
}
export function DocumentationPage({
  page,
  origin,
  preview,
}: {
  page: DocPage
  origin: string
  preview?: React.ReactNode
}) {
  const workflow = page.path === '/guides/image-generation-workflow'
  const example = page.example ?? (workflow ? 'image-workflow' : undefined)
  const Example = example ? examples[`../examples/${example}.tsx`].default : undefined
  return (
    <article className="documentation">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Image UI</a>
        <span aria-hidden="true">/</span>
        {page.category === 'Components' ? (
          <a href="/components">Components</a>
        ) : (
          <span>{page.category}</span>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{page.title}</span>
      </nav>
      <header className="doc-heading">
        <span className="doc-eyebrow">{page.category}</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <div className="doc-actions">
          <CopyButton url={`${page.path}.md`} label="Copy documentation" />
          <a className="doc-button" href={`${page.path}.md`} download>
            <Download size={13} />
            Markdown
          </a>
        </div>
      </header>
      {preview}
      {page.component ? (
        <>
          <section className="doc-section" id="installation">
            <h2>Installation</h2>
            <CodeBlock
              code={installCommand(page.component, origin)}
              language="sh"
              label="Copy install command"
            />
            <p className="doc-note">
              Includes styles, types, helpers, and local component dependencies.{' '}
              <a href="/docs/installation">
                Installation guide <ArrowRight size={12} />
              </a>
            </p>
          </section>
          <section className="doc-section" id="usage">
            <h2>Usage</h2>
            <CodeBlock code={exampleSource(page.component)} />
            <ResourceLinks />
          </section>
        </>
      ) : null}
      {Example ? (
        <section className="doc-section">
          <h2>{workflow ? 'Try the complete workflow' : 'Try the example'}</h2>
          <div className="workflow-preview">
            <div data-example-island={example} data-mode="manual">
              <button type="button" className="doc-button" data-live-activate hidden>
                {workflow ? 'Try live workflow' : 'Try live example'}
              </button>
              <div
                role="img"
                aria-label={`${page.title} preview. Activate the example to interact.`}
              >
                <div inert>{example === 'canvas-connections' ? <StaticCanvas /> : <Example />}</div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {page.sections.map((section, index) => (
        <section className="doc-section" key={section.title} id={`section-${index + 1}`}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {section.code ? (
            <CodeBlock
              code={section.code.replaceAll(
                'SITE_ORIGIN',
                origin ? origin + basePath.replace(/\/$/, '') : 'SITE_ORIGIN',
              )}
              language={section.language}
            />
          ) : null}
        </section>
      ))}
      {page.props ? (
        <section className="doc-section" id="api-reference">
          <h2>API reference</h2>
          <div
            className="props-table-wrap"
            tabIndex={0}
            role="region"
            aria-label={`${page.title} API reference`}
          >
            <table className="props-table">
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type / default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {page.props.map((prop) => (
                  <tr key={prop.name}>
                    <th scope="row">
                      <code>{prop.name}</code>
                    </th>
                    <td>
                      <code>{prop.type}</code>
                      <small>{prop.required ? 'Required' : 'Optional'}</small>
                      {prop.default !== undefined ? (
                        <small>Default: {prop.default || '(empty string)'}</small>
                      ) : null}
                    </td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {workflow ? (
        <>
          <section className="doc-section">
            <h2>Complete example</h2>
            <CodeBlock code={exampleSource('image-workflow')} />
            <a className="doc-button" href="/examples/image-workflow.tsx" download>
              <Download size={13} />
              Download example
            </a>
            <ResourceLinks />
          </section>
          <section className="doc-section">
            <h2>Simulation hook</h2>
            <CodeBlock code={simulationSource} language="ts" />
          </section>
        </>
      ) : null}
      {page.example ? (
        <section className="doc-section">
          <h2>Complete example</h2>
          <CodeBlock code={exampleSource(page.example)} />
          <a className="doc-button" href={`/examples/${page.example}.tsx`} download>
            <Download size={13} />
            Download example
          </a>
          <ResourceLinks />
          {page.example === 'canvas-connections' ? (
            <>
              <h2>Connection validator</h2>
              <CodeBlock code={canvasRulesSource} language="ts" />
              <a className="doc-button" href="/examples/canvas-rules.ts" download>
                Download validator
              </a>
            </>
          ) : null}
        </section>
      ) : null}
      {page.path === '/docs/agents' ? (
        <section className="doc-section">
          <h2>Documentation files</h2>
          <div className="doc-resource-links">
            <a href="/llms.txt">
              llms.txt <ArrowRight size={13} />
            </a>
            <a href="/llms-full.txt">
              Full documentation <ArrowRight size={13} />
            </a>
            <a href="/api/components.json">
              Generated API <ArrowRight size={13} />
            </a>
            <a href="/registry.json">
              Component registry <ArrowRight size={13} />
            </a>
            <a href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">
              shadcn MCP setup <ArrowRight size={13} />
            </a>
          </div>
        </section>
      ) : null}
      {page.related ? (
        <section className="doc-section">
          <h2>Related components</h2>
          <div className="related-components">
            {page.related.map((id) => (
              <a key={id} href={`/components/${id}`}>
                {catalog.find((item) => item.id === id)!.title}
                <ArrowRight size={13} />
              </a>
            ))}
          </div>
        </section>
      ) : null}
      <footer className="doc-footer">
        <span>MIT licensed · Made by Mavri</span>
        <a href="https://github.com/mavri-ai/image-ui" target="_blank" rel="noreferrer">
          Source code <ArrowRight size={12} />
        </a>
      </footer>
    </article>
  )
}
export function ComponentIndex() {
  return (
    <article className="documentation">
      <header className="doc-heading">
        <span className="doc-eyebrow">The library</span>
        <h1>React components for image generation</h1>
        <p>
          Build the workflow from prompt to result. Nine controlled components, installed
          individually, connected to your own generation backend.
        </p>
        <a className="doc-button" href="/docs/installation">
          Get started <ArrowRight size={13} />
        </a>
      </header>
      <div className="component-index">
        {catalog.map((item, index) => (
          <a key={item.id} href={`/components/${item.id}`}>
            <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
            <ArrowRight size={15} />
          </a>
        ))}
      </div>
      <p className="doc-note">
        Code is MIT licensed. Components are provider-independent. Showcase generation is simulated
        locally.
      </p>
    </article>
  )
}
