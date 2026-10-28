import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseHTML } from 'linkedom'
import sharp from 'sharp'

export async function verifySite(output = path.resolve('dist')) {
  const errors = []
  const manifest = JSON.parse(await readFile(path.join(output, 'site-manifest.json'), 'utf8'))
  const origin = manifest.origin || 'https://image-ui.invalid'
  const prefix = (manifest.basePath || '/').replace(/\/$/, '')
  const withBase = (path) => prefix + path
  const withoutBase = (path) =>
    prefix && path.startsWith(prefix + '/') ? path.slice(prefix.length) : path
  const documents = new Map()
  const titles = new Set()
  const fail = (route, message) => errors.push(`${route}: ${message}`)
  async function resolveFile(url) {
    const filename = path.resolve(output, '.' + decodeURIComponent(withoutBase(url.pathname)))
    if (filename !== output && !filename.startsWith(output + path.sep))
      throw new Error('URL escapes output directory')
    const info = await stat(filename).catch(() => undefined)
    if (info?.isFile()) return filename
    if (info?.isDirectory()) {
      const index = path.join(filename, 'index.html')
      if ((await stat(index).catch(() => undefined))?.isFile()) return index
    }
    throw new Error(`missing ${url.pathname}`)
  }
  for (const route of manifest.routes) {
    const filename =
      route.path === '/' ? 'index.html' : path.join(route.path.slice(1), 'index.html')
    const html = await readFile(path.join(output, filename), 'utf8')
    const document = parseHTML(html).document
    documents.set(route.path, document)
    if (html.includes('<!--app-html-->') || html.includes('<!--page-head-->'))
      fail(route.path, 'unrendered template placeholder')
    const title = document.querySelector('title')?.textContent
    if (!title || title !== route.title) fail(route.path, 'missing or incorrect title')
    if (titles.has(title)) fail(route.path, 'duplicate page title')
    titles.add(title)
    if (document.querySelectorAll('h1').length !== 1) fail(route.path, 'expected exactly one h1')
    if (
      document.querySelector('meta[name="description"]')?.getAttribute('content') !==
      route.description
    )
      fail(route.path, 'incorrect description')
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    if (
      manifest.origin
        ? canonical !== manifest.origin + withBase(route.path)
        : canonical !== undefined
    )
      fail(route.path, 'incorrect canonical URL')
    for (const property of ['og:title', 'og:description', 'og:image'])
      if (!document.querySelector(`meta[property="${property}"]`)?.getAttribute('content'))
        fail(route.path, `missing ${property}`)
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const schema = JSON.parse(script.textContent)
        if (schema['@context'] !== 'https://schema.org' || !schema['@graph']?.length)
          throw new Error('missing schema graph')
        for (const entry of schema['@graph'])
          if (entry['@type'] === 'BreadcrumbList') {
            if (
              entry.itemListElement.some(
                (item, index) => item.position !== index + 1 || !item.name || !item.item,
              )
            )
              throw new Error('invalid breadcrumbs')
          }
      } catch (error) {
        fail(route.path, `invalid structured data: ${error.message}`)
      }
    }
    if (!document.querySelector('script[type="application/ld+json"]'))
      fail(route.path, 'missing structured data')
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)
    if (new Set(ids).size !== ids.length) fail(route.path, 'duplicate HTML ids')
    if (route.documentation) {
      const md = await readFile(path.join(output, route.path + '.md'), 'utf8')
      if (!md.startsWith('# ') || !md.includes(route.description))
        fail(route.path, 'Markdown differs from page content')
    }
  }
  for (const [route, document] of documents) {
    const base = new URL(withBase(route), origin)
    const resources = [...document.querySelectorAll('a[href],link[href],img[src],script[src]')]
    for (const element of resources) {
      const value = element.getAttribute('href') ?? element.getAttribute('src')
      if (!value || /^(mailto:|tel:|data:|blob:)/.test(value)) continue
      try {
        const url = new URL(value, base)
        if (url.origin !== origin || (prefix && !url.pathname.startsWith(prefix + '/'))) continue
        const filename = await resolveFile(url)
        if (url.hash && filename.endsWith('.html')) {
          const target =
            documents.get(withoutBase(url.pathname).replace(/\/$/, '') || '/') ??
            parseHTML(await readFile(filename, 'utf8')).document
          if (!target.getElementById(decodeURIComponent(url.hash.slice(1))))
            fail(route, `broken fragment ${value}`)
        }
      } catch (error) {
        fail(route, `broken internal resource ${value}: ${error.message}`)
      }
    }
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    if (image)
      try {
        const filename = await resolveFile(new URL(image, base))
        const metadata = await sharp(filename).metadata()
        if (metadata.width !== 1200 || metadata.height !== 630)
          fail(route, 'social image must be 1200 by 630')
      } catch (error) {
        fail(route, `invalid social image: ${error.message}`)
      }
  }
  const index = await readFile(path.join(output, 'llms.txt'), 'utf8')
  const full = await readFile(path.join(output, 'llms-full.txt'), 'utf8')
  for (const route of manifest.routes.filter((route) => route.documentation)) {
    const md = await readFile(path.join(output, route.path + '.md'), 'utf8')
    if (!index.includes(route.path + '.md') || !full.includes(md.trim()))
      fail(route.path, 'documentation missing from llms exports')
  }
  for (const file of manifest.exports)
    await resolveFile(new URL(withBase(file), origin)).catch((error) => fail(file, error.message))
  const registry = JSON.parse(await readFile(path.join(output, 'registry.json'), 'utf8'))
  if (registry.items.length !== manifest.components.length)
    fail('/registry.json', 'component count mismatch')
  for (const id of manifest.components) {
    const item = JSON.parse(await readFile(path.join(output, 'r', id + '.json'), 'utf8'))
    if (
      item.name !== id ||
      !item.description ||
      !item.docs ||
      !item.files.some((file) => file.path.endsWith('image-ui.css'))
    )
      fail(`/r/${id}.json`, 'incomplete registry item')
  }
  if (manifest.origin) {
    const sitemap = parseHTML(await readFile(path.join(output, 'sitemap.xml'), 'utf8')).document
    const locations = [...sitemap.querySelectorAll('loc')].map((loc) => loc.textContent)
    const expected = manifest.routes.map((route) => manifest.origin + withBase(route.path))
    if (
      new Set(locations).size !== expected.length ||
      expected.some((url) => !locations.includes(url))
    )
      fail('/sitemap.xml', 'canonical route coverage differs')
  }
  const notFound = parseHTML(await readFile(path.join(output, '404.html'), 'utf8')).document
  if (!notFound.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex'))
    fail('/404.html', '404 page must be noindex')
  return { routes: manifest.routes.length, errors }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await verifySite()
  if (result.errors.length) {
    console.error(result.errors.join('\n'))
    process.exitCode = 1
  } else
    console.log(
      `Validated ${result.routes} pages: internal links, fragments, assets, metadata, JSON-LD, documentation exports, registry, and social images.`,
    )
}
