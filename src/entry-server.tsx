import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { MotionConfig } from 'motion/react'
import App from './app'
import { basePath, publicPath } from './paths'
import { ComponentIndex, DocumentationPage } from './docs/page'
import { StaticComponentSection } from './demo/static-preview'
import { catalog } from './catalog'
import { findPage, homeDescription, normalizePath, pages } from './docs/content'
import { textFiles } from './docs/exports'
import { siteOrigin, sourceUrl } from './site'

export const routes = ['/', '/components', ...pages.map((page) => page.path)]
export const exports = textFiles(siteOrigin)
export const manifest = {
  origin: siteOrigin,
  basePath,
  routes: routes.map((path) => ({ path, ...pageInfo(path), documentation: !!findPage(path) })),
  exports: Object.keys(exports),
  components: catalog.map((item) => item.id),
}
export const socialCards = [...routes, '/404'].map((path) => ({ path, ...pageInfo(path) }))
function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )
}
export function socialPath(path: string) {
  return `/social/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.png`
}
export function pageInfo(path: string) {
  const page = findPage(path)
  const title =
    path === '/'
      ? 'Image UI — React components for image generation'
      : path === '/components'
        ? 'React image-generation components | Image UI'
        : page
          ? `${page.component ? 'React ' : ''}${page.title} | Image UI`
          : 'Page not found | Image UI'
  const description =
    path === '/' || path === '/components'
      ? homeDescription
      : (page?.description ?? 'Explore Image UI React components and documentation.')
  return { title, description }
}
export function render(url: string, template: string) {
  const path = normalizePath(new URL(url, 'http://local').pathname)
  const known = routes.includes(path)
  const { title, description } = pageInfo(path)
  const page = findPage(path)
  const image = siteOrigin + publicPath(socialPath(known ? path : '/404'))
  const canonical = siteOrigin && known ? siteOrigin + publicPath(path) : ''
  const breadcrumbs = page
    ? [
        { '@type': 'ListItem', position: 1, name: 'Image UI', item: siteOrigin + publicPath('/') },
        ...(page.component
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Components',
                item: siteOrigin + publicPath('/components'),
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: page.component ? 3 : 2,
          name: page.title,
          item: siteOrigin + publicPath(path),
        },
      ]
    : undefined
  const graph: object[] = [
    {
      '@type': 'WebSite',
      name: 'Image UI',
      description: homeDescription,
      ...(siteOrigin ? { url: siteOrigin } : {}),
      publisher: { '@type': 'Organization', name: 'Mavri', url: 'https://github.com/mavri-ai' },
    },
  ]
  if (breadcrumbs) graph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumbs })
  if (page?.component)
    graph.push({
      '@type': 'SoftwareSourceCode',
      name: page.title,
      description,
      codeRepository: sourceUrl,
      programmingLanguage: ['TypeScript', 'CSS'],
      runtimePlatform: 'React',
      license: 'https://opensource.org/license/mit',
      ...(canonical ? { url: canonical } : {}),
    })
  const head = [
    path === '/' || path === '/components/generation-card'
      ? '<link rel="preload" as="image" href="/images/optimized/dunes-480.webp" fetchpriority="high" />'
      : '',
    `<title>${escape(title)}</title>`,
    `<meta name="image-ui-page" content="${escape(path)}" />`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta name="robots" content="${known ? 'index,follow,max-image-preview:large' : 'noindex,follow'}" />`,
    canonical ? `<link rel="canonical" href="${escape(canonical)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Image UI" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(title)}" />`,
    canonical ? `<meta property="og:url" content="${escape(canonical)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    `<meta name="twitter:image" content="${escape(image)}" />`,
    page
      ? `<link rel="alternate" type="text/markdown" href="${page.path}.md" title="${escape(page.title)} Markdown" />`
      : '',
    '<link rel="alternate" type="text/plain" href="/llms.txt" title="Documentation index for language models" />',
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`,
  ].join('\n    ')
  const html = renderToString(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <App
          path={path}
          content={
            path === '/components' ? (
              <ComponentIndex />
            ) : page ? (
              <DocumentationPage
                page={page}
                origin={siteOrigin}
                preview={
                  page.component ? (
                    <StaticComponentSection id={page.component} documentation />
                  ) : undefined
                }
              />
            ) : undefined
          }
        />
      </MotionConfig>
    </StrictMode>,
  )
  return {
    status: known ? 200 : 404,
    html: template
      .replace('<!--page-head-->', () => head)
      .replace('<!--app-html-->', () => html)
      .replace(
        /(href|src|data-copy-url)="(\/[^"]*)"/g,
        (_match, attribute, value) => `${attribute}="${publicPath(value)}"`,
      ),
  }
}
