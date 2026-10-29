import { StrictMode, useEffect, type ReactNode, type ComponentType } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { MotionConfig } from 'motion/react'
import { catalog, type ComponentId } from './catalog'
import { siteOrigin } from './site'

const components = import.meta.glob<{ default: ComponentType }>('./demo/previews/*.tsx')
const examples = import.meta.glob<{ default: ComponentType }>('./examples/*.tsx')
function IslandReady({ children, onReady }: { children: ReactNode; onReady: () => void }) {
  useEffect(onReady, [onReady])
  return children
}

export async function mountIsland(element: HTMLElement) {
  const id = element.dataset.componentIsland as ComponentId | undefined
  const example = element.dataset.exampleIsland
  const loader = id
    ? components[`./demo/previews/${id}.tsx`]
    : examples[`./examples/${example}.tsx`]
  if (!loader) throw new Error('Unknown preview')
  const { default: Preview } = await loader()
  const ComponentSection = id ? (await import('./component-section')).ComponentSection : undefined
  const item = id ? catalog.find((item) => item.id === id) : undefined
  const content = (
    <StrictMode>
      <MotionConfig reducedMotion="user">
        {item && ComponentSection ? (
          <ComponentSection
            item={item}
            index={Number(element.dataset.index ?? 0)}
            origin={siteOrigin || window.location.origin}
            documentation={element.dataset.documentation === 'true'}
            Demo={Preview}
          />
        ) : (
          <Preview />
        )}
      </MotionConfig>
    </StrictMode>
  )
  const staticRoot = element.querySelector<HTMLElement>('[data-static-root]')
  if (staticRoot) {
    const wrapper = staticRoot.parentElement!
    wrapper.removeAttribute('role')
    wrapper.removeAttribute('aria-label')
    // Keep controls inert until React has attached handlers, so early input cannot be reset.
    wrapper.setAttribute('inert', '')
    staticRoot.querySelector('[inert]')?.removeAttribute('inert')
    await new Promise<void>((resolve) => {
      hydrateRoot(staticRoot, <IslandReady onReady={resolve}>{content}</IslandReady>, {
        identifierPrefix: element.dataset.prefix,
      })
    })
    wrapper.removeAttribute('inert')
    const button = element.querySelector<HTMLButtonElement>('[data-live-activate]')
    if (button && element.dataset.documentation === 'true') {
      button.textContent = 'Live preview'
      button.disabled = true
      button.removeAttribute('data-live-activate')
    } else button?.remove()
    const caption = element.querySelector('.preview-caption')
    if (caption) caption.textContent = 'Live preview. Generation is simulated locally.'
  } else {
    element.style.minHeight = `${element.getBoundingClientRect().height}px`
    const root = createRoot(element)
    flushSync(() => root.render(content))
  }
}
