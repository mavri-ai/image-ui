import type { ComponentId } from './catalog'

const sources = import.meta.glob<string>('./components/image-ui/*.tsx', {
  query: '?raw',
  import: 'default',
})

export function loadComponentSource(id: ComponentId) {
  return sources[`./components/image-ui/${id}.tsx`]()
}
