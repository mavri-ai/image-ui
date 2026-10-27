import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const componentDirectory = path.join(root, 'src/components/image-ui')
const names = [
  'generation-card',
  'reference-input',
  'prompt-composer',
  'model-picker',
  'generation-settings',
  'output-gallery',
  'version-history',
  'generative-canvas',
]
const output = path.join(root, 'public/r')
await mkdir(output, { recursive: true })

async function findFile(name) {
  for (const extension of ['.tsx', '.ts', '.css']) {
    const filename = name + extension
    try {
      return { filename, content: await readFile(path.join(componentDirectory, filename), 'utf8') }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  throw new Error(`Missing component dependency: ${name}`)
}

const items = []
for (const name of names) {
  const files = new Map()
  const dependencies = new Set()
  async function collect(localName) {
    const { filename, content } = await findFile(localName)
    if (files.has(filename)) return
    files.set(filename, content)
    for (const match of content.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
      const specifier = match[1]
      if (specifier.startsWith('./')) await collect(specifier.slice(2))
      else if (!specifier.startsWith('react'))
        dependencies.add(
          specifier.startsWith('@')
            ? specifier.split('/').slice(0, 2).join('/')
            : specifier.split('/')[0],
        )
    }
  }
  await collect(name)
  files.set('image-ui.css', await readFile(path.join(componentDirectory, 'image-ui.css'), 'utf8'))
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
    type: 'registry:ui',
    title: name.replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase()),
    description: `Composable ${name.replaceAll('-', ' ')} for visual generation interfaces.`,
    dependencies: [...dependencies].sort(),
    files: [...files].map(([filename, originalContent]) => ({
      path: `src/components/image-ui/${filename}`,
      type: 'registry:file',
      target: `@components/image-ui/${filename}`,
      content:
        filename === `${name}.tsx`
          ? originalContent.replace("'use client'", "'use client'\n\nimport './image-ui.css'")
          : originalContent,
    })),
  }
  await writeFile(path.join(output, `${name}.json`), JSON.stringify(item, null, 2) + '\n')
  items.push(item)
}
await writeFile(
  path.join(root, 'public/registry.json'),
  JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: 'image-ui',
      homepage: 'https://github.com/mavri-ai/image-ui',
      items,
    },
    null,
    2,
  ) + '\n',
)
console.log(`Built ${items.length} registry items with their styles and local dependencies.`)
await writeFile(
  path.join(root, 'public/LICENSE'),
  await readFile(path.join(root, 'LICENSE'), 'utf8'),
)
