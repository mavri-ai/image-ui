import { catalog } from '../catalog'
import { basePath } from '../paths'
import generatedApi from './generated-api.json'
import {
  exampleSource,
  installCommand,
  pages,
  simulationSource,
  canvasRulesSource,
  type DocPage,
} from './content'

export function markdown(page: DocPage, origin = '') {
  const rootUrl = origin + basePath.replace(/\/$/, '')
  const chunks = [`# ${page.title}`, page.description]
  if (page.component)
    chunks.push(
      '## Installation',
      '```sh\n' + installCommand(page.component, origin) + '\n```',
      `Requires a React app with a working @/components alias. See [installation](${rootUrl}/docs/installation.md).`,
      '## Usage',
      '```tsx\n' + exampleSource(page.component) + '\n```',
      `Example image paths are placeholders for your own assets. If this example imports useDemoGeneration, copy [the simulation hook](${rootUrl}/examples/use-demo-generation.ts) alongside it. In a React Server Components app, put this example in a client component.`,
    )
  for (const section of page.sections) {
    chunks.push(`## ${section.title}`, ...(section.paragraphs ?? []))
    if (section.code)
      chunks.push(
        '```' +
          (section.language ?? 'text') +
          '\n' +
          section.code.replaceAll('SITE_ORIGIN', origin ? rootUrl : 'SITE_ORIGIN') +
          '\n```',
      )
  }
  if (page.props) {
    chunks.push('## API reference')
    for (const prop of page.props)
      chunks.push(
        `### ${prop.name}\n\nType: ${prop.type}\n${prop.required ? 'Required' : 'Optional'}${prop.default !== undefined ? `\nDefault: ${prop.default || '(empty string)'}` : ''}\n\n${prop.description}`,
      )
  }
  if (page.path.includes('image-generation-workflow'))
    chunks.push(
      '## Complete example',
      '```tsx\n' + exampleSource('image-workflow') + '\n```',
      '## Simulation hook',
      '```ts\n' + simulationSource + '\n```',
    )
  if (page.example) {
    chunks.push('## Complete example', '```tsx\n' + exampleSource(page.example) + '\n```')
    if (page.example === 'canvas-connections')
      chunks.push('## Connection validator', '```ts\n' + canvasRulesSource + '\n```')
  }
  if (page.related)
    chunks.push(
      '## Related components',
      ...page.related.map(
        (id) =>
          `- [${catalog.find((item) => item.id === id)!.title}](${rootUrl}/components/${id}.md)`,
      ),
    )
  chunks.push(
    '## Source and license',
    'MIT licensed. Maintained by [Mavri](https://github.com/mavri-ai). [Source repository](https://github.com/mavri-ai/image-ui). Components are provider-independent; demos simulate generation locally.',
  )
  return chunks.join('\n\n') + '\n'
}

export function textFiles(origin = '') {
  const rootUrl = origin + basePath.replace(/\/$/, '')
  const files: Record<string, string> = {}
  files['/api/components.json'] = JSON.stringify(generatedApi, null, 2) + '\n'
  for (const page of pages) files[`${page.path}.md`] = markdown(page, origin)
  files['/llms.txt'] =
    [
      '# Image UI',
      '> Open-source, MIT-licensed React components for image-generation interfaces. Maintained by Mavri. Install source through a shadcn-compatible registry; connect your own generation backend.',
      '## Important context',
      '- Components are controlled UI, not an image-generation service. No provider keys or calls are bundled.',
      '- Demos use local simulation and sample photographs. Example asset paths need your own files.',
      '- Registry items contain source, local dependencies, types, helpers, and CSS.',
      '- SITE_ORIGIN in local exports means the origin serving this site. Configure VITE_SITE_URL for absolute production URLs.',
      ...['Documentation', 'Components', 'Guides'].flatMap((category) => [
        `## ${category}`,
        ...pages
          .filter((page) => page.category === category)
          .map((page) => `- [${page.title}](${rootUrl}${page.path}.md): ${page.description}`),
      ]),
      '## Optional',
      `- [Full documentation](${rootUrl}/llms-full.txt): All pages in a single text file.`,
      `- [Generated API](${rootUrl}/api/components.json): Prop types, declared defaults, optionality, and shared types extracted from TypeScript.`,
      `- [Registry](${rootUrl}/registry.json): Machine-readable installable component catalogue.`,
      `- [Simulation hook](${rootUrl}/examples/use-demo-generation.ts): Local demo support, not a production provider adapter.`,
      '- [Source](https://github.com/mavri-ai/image-ui): MIT-licensed component source.',
    ].join('\n\n') + '\n'
  files['/llms-full.txt'] =
    '# Image UI — full documentation\n\n' +
    pages.map((page) => markdown(page, origin)).join('\n---\n\n')
  files['/examples/use-demo-generation.ts'] = simulationSource
  files['/examples/image-workflow.tsx'] = exampleSource('image-workflow')
  files['/examples/canvas-rules.ts'] = canvasRulesSource
  for (const page of pages)
    if (page.example) files[`/examples/${page.example}.tsx`] = exampleSource(page.example)
  files['/robots.txt'] =
    `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${rootUrl}/sitemap.xml\n` : ''}`
  if (origin)
    files['/sitemap.xml'] =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      ['/', '/components', ...pages.map((page) => page.path)]
        .map((path) => `  <url><loc>${rootUrl}${path}</loc></url>`)
        .join('\n') +
      '\n</urlset>\n'
  return files
}
