import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { verifySite } from '../scripts/verify-site.mjs'

test('build validation detects broken links and malformed structured data', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'image-ui-validation-'))
  try {
    await cp(path.resolve('dist'), output, { recursive: true })
    const filename = path.join(output, 'components/prompt-composer/index.html')
    const html = await readFile(filename, 'utf8')
    const manifest = JSON.parse(await readFile(path.join(output, 'site-manifest.json'), 'utf8'))
    const brokenPath = (manifest.basePath ?? '/').replace(/\/$/, '') + '/missing-guide'
    await writeFile(
      filename,
      html
        .replace('</main>', `<a href="${brokenPath}">Broken guide</a></main>`)
        .replace(
          '<script type="application/ld+json">',
          '<script type="application/ld+json">invalid-json',
        ),
    )
    const result = await verifySite(output)
    assert.ok(
      result.errors.some((error) => error.includes(`broken internal resource ${brokenPath}`)),
    )
    assert.ok(result.errors.some((error) => error.includes('invalid structured data')))
  } finally {
    await rm(output, { recursive: true, force: true })
  }
})

test('configured production origin produces a valid canonical sitemap and matching exports', async () => {
  const { createServer } = await import('vite')
  const origin = 'https://image-ui.example'
  const output = await mkdtemp(path.join(tmpdir(), 'image-ui-origin-'))
  const server = await createServer({
    mode: 'production',
    server: { middlewareMode: true },
    appType: 'custom',
    define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(origin) },
  })
  try {
    await cp(path.resolve('dist'), output, { recursive: true })
    const site = await server.ssrLoadModule('/src/entry-server.tsx')
    const template =
      '<!doctype html><html><head><!--page-head--></head><body><div id="root"><!--app-html--></div></body></html>'
    for (const route of site.routes)
      await writeFile(
        path.join(output, route === '/' ? 'index.html' : `${route}/index.html`),
        site.render(route, template).html,
      )
    for (const [url, body] of Object.entries(site.exports))
      await writeFile(path.join(output, url), body)
    await writeFile(path.join(output, 'site-manifest.json'), JSON.stringify(site.manifest))
    const result = await verifySite(output)
    assert.deepEqual(result.errors, [])
    assert.ok(site.exports['/robots.txt'].includes(`Sitemap: ${origin}/sitemap.xml`))
    assert.ok(site.exports['/llms.txt'].includes(`${origin}/components/prompt-composer.md`))
    const sitemap = site.exports['/sitemap.xml']
    assert.equal((sitemap.match(/<url>/g) ?? []).length, site.routes.length)
  } finally {
    await server.close()
    await rm(output, { recursive: true, force: true })
  }
})
