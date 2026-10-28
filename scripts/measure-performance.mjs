import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const label = process.argv[2] || 'current'
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Use a simple report label.')
const origin = process.env.PERF_ORIGIN || 'http://127.0.0.1:5180'
const output = path.resolve('artifacts/performance', label)
await mkdir(output, { recursive: true })
const chrome = await chromeLauncher.launch({
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  chromeFlags: ['--headless=new', '--no-sandbox'],
})
const summary = {
  label,
  measuredAt: new Date().toISOString(),
  origin,
  environment:
    'Local Google Chrome, Lighthouse default simulated mobile throttling, one run per route. Lab results; not field Core Web Vitals.',
  pages: [],
}
try {
  for (const [name, route] of [
    ['home', '/'],
    ['prompt-composer', '/components/prompt-composer'],
    ['installation', '/docs/installation'],
  ]) {
    const result = await lighthouse(origin + route, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    })
    if (!result || result.lhr.runtimeError)
      throw new Error(JSON.stringify(result?.lhr.runtimeError ?? 'Lighthouse produced no report'))
    await writeFile(path.join(output, name + '.json'), result.report[0])
    await writeFile(path.join(output, name + '.html'), result.report[1])
    const audits = result.lhr.audits
    const row = {
      route,
      lighthouseVersion: result.lhr.lighthouseVersion,
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
      fcpMs: Math.round(audits['first-contentful-paint'].numericValue),
      lcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
      tbtMs: Math.round(audits['total-blocking-time'].numericValue),
      cls: audits['cumulative-layout-shift'].numericValue,
      javascriptBytes:
        audits['resource-summary'].details.items.find((item) => item.resourceType === 'script')
          ?.transferSize ?? 0,
    }
    summary.pages.push(row)
    console.log(JSON.stringify(row))
    await writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')
  }
} finally {
  await chrome.kill()
}
