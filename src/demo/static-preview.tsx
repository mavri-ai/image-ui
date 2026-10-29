import { StrictMode, type ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { MotionConfig } from 'motion/react'
import { catalog, type ComponentId } from '../catalog'
import { ComponentSection } from '../component-section'
import { publicPath } from '../paths'
import { siteOrigin } from '../site'

// Render each preview as an independent root so it can hydrate without replacing its images.
const snapshots = import.meta.glob<{ default: ComponentType }>('./previews/*.tsx', { eager: true })
export function StaticComponentSection({
  id,
  index = 0,
  documentation = false,
}: {
  id: ComponentId
  index?: number
  documentation?: boolean
}) {
  const item = catalog.find((entry) => entry.id === id)!
  const Snapshot = snapshots[`./previews/${id}.tsx`].default
  const prefix = `preview-${id}-`
  const html =
    id === 'generative-canvas'
      ? undefined
      : renderToString(
          <StrictMode>
            <MotionConfig reducedMotion="user">
              <ComponentSection
                item={item}
                index={index}
                origin={siteOrigin}
                documentation={documentation}
                Demo={Snapshot}
              />
            </MotionConfig>
          </StrictMode>,
          { identifierPrefix: prefix },
        )
  return (
    <div
      data-component-island={id}
      data-mode="auto"
      data-index={index}
      data-documentation={documentation}
      data-prefix={prefix}
    >
      {html ? (
        <div data-hydrate-root>
          <div
            data-static-root
            dangerouslySetInnerHTML={{
              __html: html.replace(
                '<div class="component-preview',
                '<div inert class="component-preview',
              ),
            }}
          />
        </div>
      ) : (
        <div data-static-canvas>
          <section id={id} className="component-section" aria-labelledby={`${id}-title`}>
            <div className="component-heading">
              <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
              <h2 id={`${id}-title`}>{documentation ? 'Interactive preview' : item.title}</h2>
              <p>{item.description}</p>
            </div>
            <div className="component-preview component-preview--canvas">
              <StaticCanvas />
            </div>
          </section>
        </div>
      )}
      {documentation ? (
        <p className="preview-caption">Live preview. Generation is simulated locally.</p>
      ) : null}
    </div>
  )
}
export function StaticCanvas() {
  return (
    <div className="static-canvas">
      <div className="static-canvas-node">
        <span>Reference</span>
        <img
          src={publicPath('/images/optimized/dunes-480.webp')}
          alt="Golden dunes"
          width="480"
          height="320"
          loading="lazy"
        />
      </div>
      <span aria-hidden="true">→</span>
      <div className="static-canvas-node">
        <span>Generation</span>
        <p>Desert dunes in soft afternoon light.</p>
        <small>Prompt + connected reference</small>
      </div>
      <span aria-hidden="true">→</span>
      <div className="static-canvas-node">
        <span>Output</span>
        <img
          src={publicPath('/images/optimized/desert-480.webp')}
          alt="Desert output"
          width="480"
          height="320"
          loading="lazy"
        />
      </div>
    </div>
  )
}
