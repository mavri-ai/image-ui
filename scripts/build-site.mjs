import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const output = path.join(root, 'dist')
const template = await readFile(path.join(output, 'index.html'), 'utf8')
const server = await createServer({
  mode: 'production',
  server: { middlewareMode: true },
  appType: 'custom',
})
try {
  const site = await server.ssrLoadModule('/src/entry-server.tsx')
  for (const route of site.routes) {
    const destination =
      route === '/' ? path.join(output, 'index.html') : path.join(output, route, 'index.html')
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, site.render(route, template).html)
  }
  await writeFile(
    path.join(output, 'site-manifest.json'),
    JSON.stringify(site.manifest, null, 2) + '\n',
  )
  await writeFile(path.join(output, '404.html'), site.render('/404', template).html)
  for (const [url, body] of Object.entries(site.exports)) {
    const destination = path.join(output, url)
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, body)
  }
  await mkdir(path.join(output, 'social'), { recursive: true })
  const escape = (text) =>
    text.replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char],
    )
  for (const card of site.socialCards) {
    const title = card.title.replace(' | Image UI', '').replace('Image UI — ', '')
    const words = title.split(' ')
    const lines = ['']
    for (const word of words) {
      if ((lines.at(-1) + word).length > 31) lines.push('')
      lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#17181a"/><rect x="32" y="32" width="1136" height="566" rx="18" fill="none" stroke="#333438"/><circle cx="94" cy="98" r="20" fill="none" stroke="#6b8aff" stroke-width="3"/><text x="135" y="108" font-family="sans-serif" font-size="30" fill="#eeeeef">image ui</text><path d="M72 155H1128" stroke="#333438" stroke-dasharray="5 6"/>${lines.map((line, index) => `<text x="72" y="${255 + index * 68}" font-family="sans-serif" font-size="56" font-weight="600" fill="#eeeeef">${escape(line)}</text>`).join('')}<text x="72" y="510" font-family="sans-serif" font-size="22" fill="#b1b2b8">Open-source React components for image generation.</text><text x="72" y="555" font-family="sans-serif" font-size="18" fill="#999aa2">MIT licensed · Made by Mavri</text></svg>`
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(output, site.socialPath(card.path)))
  }
  console.log(
    `Prerendered ${site.routes.length} pages, a 404 page, ${Object.keys(site.exports).length} text exports, and ${site.socialCards.length} social cards.`,
  )
  if (!site.exports['/sitemap.xml'])
    console.log(
      'VITE_SITE_URL is unset: canonical URLs and sitemap are deferred until a production origin is configured.',
    )
} finally {
  await server.close()
}
