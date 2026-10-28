import { catalog, type ComponentId } from './catalog'
import { basePath, routePath } from './paths'
import { siteOrigin } from './site'

export const supportPages = [
  { path: '/docs/installation', title: 'Installation', category: 'Documentation' },
  { path: '/docs/theming', title: 'Theming', category: 'Documentation' },
  { path: '/docs/agents', title: 'Use with coding agents', category: 'Documentation' },
  {
    path: '/guides/image-generation-workflow',
    title: 'Build an image-generation workflow',
    category: 'Guides',
  },
  { path: '/guides/partial-failures', title: 'Handle partial failures', category: 'Guides' },
  { path: '/guides/version-restoration', title: 'Restore previous versions', category: 'Guides' },
  { path: '/guides/reference-reuse', title: 'Reuse output as a reference', category: 'Guides' },
  { path: '/guides/canvas-connections', title: 'Validate canvas connections', category: 'Guides' },
] as const
export const normalizePath = routePath
export function findPage(path: string) {
  const normalized = normalizePath(path)
  return catalog
    .map((item) => ({ path: `/components/${item.id}`, component: item.id, title: item.title }))
    .find((item) => item.path === normalized)
}
export function installCommand(id: ComponentId, origin = '') {
  return `npx shadcn@latest add ${origin || siteOrigin || 'https://mavri.ai'}${basePath === '/' && !origin && !siteOrigin ? '/image-ui/' : basePath}r/${id}.json`
}
export const homeDescription =
  'Open-source React components for image-generation interfaces. Install prompt inputs, reference uploads, progress cards, galleries, and a node-based canvas with the shadcn CLI.'
