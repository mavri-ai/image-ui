import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'

export default function sitePlugin(): Plugin {
  return {
    name: 'image-ui-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !['GET', 'HEAD'].includes(req.method ?? 'GET')) return next()
        const fullPath = new URL(req.url, 'http://localhost').pathname
        const prefix = server.config.base.replace(/\/$/, '')
        const pathname =
          prefix && fullPath.startsWith(prefix + '/') ? fullPath.slice(prefix.length) : fullPath
        if (pathname.endsWith('/index.html')) {
          res.statusCode = 308
          res.setHeader(
            'Location',
            server.config.base.replace(/\/$/, '') +
              (pathname.slice(0, -11) || '/') +
              new URL(req.url, 'http://localhost').search,
          )
          res.end()
          return
        }
        if (
          pathname.startsWith('/src/') ||
          pathname.startsWith('/@') ||
          pathname.startsWith('/node_modules/')
        )
          return next()
        const textRequest =
          pathname.endsWith('.md') ||
          pathname.startsWith('/examples/') ||
          pathname === '/api/components.json' ||
          [
            '/llms.txt',
            '/llms-full.txt',
            '/robots.txt',
            '/sitemap.xml',
            '/examples/use-demo-generation.ts',
            '/examples/image-workflow.tsx',
          ].includes(pathname)
        if (!textRequest && path.extname(pathname) && pathname !== '/index.html') return next()
        try {
          const module = await server.ssrLoadModule('/src/entry-server.tsx')
          if (textRequest) {
            const body = module.exports[pathname]
            res.statusCode = body === undefined ? 404 : 200
            res.setHeader(
              'Content-Type',
              pathname.endsWith('.xml')
                ? 'application/xml; charset=utf-8'
                : pathname.endsWith('.json')
                  ? 'application/json; charset=utf-8'
                  : pathname.endsWith('.md')
                    ? 'text/markdown; charset=utf-8'
                    : 'text/plain; charset=utf-8',
            )
            res.end(req.method === 'HEAD' ? '' : (body ?? 'Not found'))
          } else {
            const template = await server.transformIndexHtml(
              req.url,
              await readFile(path.join(server.config.root, 'index.html'), 'utf8'),
            )
            const result = module.render(pathname === '/index.html' ? '/' : req.url, template)
            res.statusCode = result.status
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(req.method === 'HEAD' ? '' : result.html)
          }
        } catch (error) {
          next(error)
        }
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !['GET', 'HEAD'].includes(req.method ?? 'GET')) return next()
        let pathname: string
        try {
          const fullPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
          const prefix = server.config.base.replace(/\/$/, '')
          pathname =
            prefix && fullPath.startsWith(prefix + '/') ? fullPath.slice(prefix.length) : fullPath
        } catch {
          res.statusCode = 400
          res.end('Bad request')
          return
        }
        if (pathname.endsWith('/index.html')) {
          res.statusCode = 308
          res.setHeader(
            'Location',
            server.config.base.replace(/\/$/, '') +
              (pathname.slice(0, -11) || '/') +
              new URL(req.url, 'http://localhost').search,
          )
          res.end()
          return
        }
        const root = path.resolve(server.config.root, server.config.build.outDir)
        const requested = path.resolve(root, '.' + pathname)
        if (!requested.startsWith(root + path.sep) && requested !== root) {
          res.statusCode = 404
          res.end('Not found')
          return
        }
        // Serve actual prerendered pages, never fall back to a 200-status SPA shell.
        if (!path.extname(pathname) || pathname.endsWith('.html')) {
          try {
            const body = await readFile(
              path.extname(pathname) ? requested : path.join(requested, 'index.html'),
            )
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(req.method === 'HEAD' ? '' : body)
          } catch {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(req.method === 'HEAD' ? '' : await readFile(path.join(root, '404.html')))
          }
          return
        }
        try {
          await readFile(requested)
          next()
        } catch {
          res.statusCode = 404
          res.end('Not found')
        }
      })
    },
  }
}
