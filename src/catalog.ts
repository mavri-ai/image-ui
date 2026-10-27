export const catalog = [
  {
    id: 'generation-card',
    title: 'Generation card',
    description: 'Progress, results, and recoverable errors.',
    group: 'Create',
  },
  {
    id: 'reference-input',
    title: 'Reference input',
    description: 'Attach, preview, and manage source images.',
    group: 'Create',
  },
  {
    id: 'prompt-composer',
    title: 'Prompt composer',
    description: 'References, model selection, and image settings.',
    group: 'Create',
  },
  {
    id: 'model-picker',
    title: 'Model picker',
    description: 'Search and switch between image models.',
    group: 'Create',
  },
  {
    id: 'generation-settings',
    title: 'Generation settings',
    description: 'Aspect ratio, quality, and output count.',
    group: 'Create',
  },
  {
    id: 'output-gallery',
    title: 'Output gallery',
    description: 'Select outputs and retry individual failures.',
    group: 'Explore',
  },
  {
    id: 'version-history',
    title: 'Version history',
    description: 'Browse results with their prompts and settings.',
    group: 'Explore',
  },
  {
    id: 'generative-canvas',
    title: 'Generative canvas',
    description: 'Connect references, prompts, and generations.',
    group: 'Compose',
  },
] as const

export type ComponentId = (typeof catalog)[number]['id']
const sourceLoaders = import.meta.glob<string>('./components/image-ui/*.tsx', {
  query: '?raw',
  import: 'default',
})

export function loadComponentSource(id: ComponentId) {
  return sourceLoaders[`./components/image-ui/${id}.tsx`]()
}
