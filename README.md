# image/ui

React components for image generation interfaces. An interactive showcase with dedicated component documentation, runnable guides, source code, and installable components.

## Run locally

Requires Node.js 22.18+ and npm.

```sh
npm install
npm run registry:build
npm run dev
```

Open the local address printed by Vite in Chrome.

```sh
npm run build  # Typecheck, build the component registry, and build the site
npm test       # Browser checks using installed Google Chrome
```

## Components

- Generation card: idle, queued, generating, complete, failed, and cancelled states
- Reference input: real image uploads, drag and drop, validation, previews, and removal
- Prompt composer: references, a model picker, settings, and generate/cancel actions
- Model picker: searchable, app-supplied models
- Generation settings: aspect ratio, quality, and output count
- Output gallery: selection, mixed completion states, and retries
- Version history: previous images with prompts, models, and settings
- Image actions: full-screen preview, downloads, variations, and reference actions
- Generative canvas: draggable nodes, connections, editable prompts, and canvas controls

## Use a component

Use **Install component** in a live preview, or copy the command from its documentation page. Install a component from the public registry:

```sh
npx shadcn@latest add https://mavri.ai/image-ui/r/generation-card.json
```

Each registry item includes its shared types, helpers, styles, and required packages. Alternatively, copy the required files from `src/components/image-ui/` and import `image-ui.css` once. Fonts inherit from the host application and fall back to system fonts; the showcase uses Inter.

```tsx
import { GenerationCard } from './components/image-ui/generation-card'

;<GenerationCard
  title="A new direction"
  status={generation.status}
  src={generation.imageUrl}
  error={generation.error}
  onGenerate={generate}
  onRetry={generate}
  onCancel={cancel}
/>
```

Components are controlled: your application supplies state and connects actions to its own generation provider. An omitted `progress` value shows indeterminate progress. Image models, prices, limits, and provider credentials are not embedded in the library.

`GenerativeCanvas` accepts React Flow node/edge state and callbacks. Its `CanvasNode` type covers reference, generation, output, and note nodes. The showcase adds cycle and duplicate-connection checks; applications can supply their own connection rules.

## The demos

All generation is simulated locally. No API keys, provider calls, or paid generations are involved. The sample model list illustrates the picker, rather than promising a provider's current capabilities. Uploads stay in your browser and are not sent to a server. Demo timers and sample assets live in `src/demo/`, separate from the reusable components.

The page defaults to dark mode and supports light/dark themes, keyboard interaction, a mobile component menu, and reduced motion. Styles use `--iu-*` tokens; override them to fit your application. To enable the included dark palette, set `data-theme="dark"` on an ancestor or the document element.

## Images and license

Code is MIT licensed. Demo images are illustrative sample content, separate from the code license and component registry. Supply your own appropriately licensed images when reusing examples. See [image credits](public/images/CREDITS.md) for source links.

## Documentation and AI tools

The showcase stays at `/`; all nine components have dedicated `/components/{name}` pages. `/components` lists the library. Installation, theming, and coding-agent setup live under `/docs/`. The complete working local simulation is at `/guides/image-generation-workflow`.

Pages are prerendered into HTML at build time using Vite's server rendering support. The dev server renders the same page content. Live previews load on request throughout the site. The canvas remains a separate chunk. Documentation and navigation work without JavaScript.

The documentation is the shared source for:

- Each page's `.md` version and **Copy documentation** action.
- `/llms.txt`, the documentation index for language-model tools.
- `/llms-full.txt`, the complete documentation in one text file.
- Downloadable workflow source and the local simulation hook under `/examples/`.

The [public registry](https://mavri.ai/image-ui/registry.json) lists installable components. Merge this into an existing `components.json`:

```json
{
  "registries": {
    "@image-ui": "https://mavri.ai/image-ui/r/{name}.json"
  }
}
```

Use the [official shadcn MCP server](https://ui.shadcn.com/docs/mcp) to browse and install configured registry items from a coding tool. No custom MCP server is needed. `llms.txt` is a documentation convenience, not a promise of search visibility.

## Build and hosting

```sh
npm run build
npm run preview
npm run test:production  # Build and run the full Chrome suite against static output
```

`npm run build` also generates WebP demo assets and 1200 × 630 PNG social cards. Original photos are preserved. Example source in `src/examples/` is typechecked with the app; replace its sample images with your own assets when copying it.

For a custom host, configure `VITE_SITE_URL` and `IMAGE_UI_BASE_PATH` (see `.env.example`). One value generates absolute canonical URLs, social URLs, installation commands, Markdown links, and `/sitemap.xml`. Without it, the build uses relative documentation links, resolves interactive installation commands to the current browser origin, and omits canonical tags and the sitemap rather than inventing a production domain. Text downloads use `SITE_ORIGIN` as an explicit placeholder in installation commands until configured.

Deploy `dist/` with directory-index support and extensionless page URLs. Serve unknown paths with the generated `404.html` and an HTTP 404 status; do not add a wildcard 200-status SPA fallback. `npm run preview` implements that behavior locally. Serve `.md`, `.txt`, and registry `.json` files directly. Redirect `/index.html` to `/` on the production host.

## Static pages and live previews

Documentation pages use a small browser entry for theme switching, mobile navigation, copying, and live-preview activation. They do not download React, Motion, the documentation catalogue, or unrelated demos on initial load. **Try live preview** loads the selected component; **Try live example** loads the selected guide. The showcase follows the same explicit activation pattern, avoiding background hydration and image repaints.

Initial component previews are actual server-rendered demo markup, with a static graph for the canvas. Individual preview roots use stable React id prefixes and hydrate their existing HTML, preserving images and dimensions. Their controls remain inert until activated. Failed downloads leave the static preview available and show a retry action. The canvas and guide examples mount on demand.

Four additional guides cover partial failures, explicit version restoration, reference reuse with duplicate prevention, and validated canvas connections. Their source downloads are included in Markdown and the full text export. The canvas guide also provides its connection validator.

## Generated API and build validation

`npm run api:build` extracts prop types, required/optional status, declared destructuring defaults, and shared types from the source. Human-written descriptions are merged into that generated data; a new undocumented prop fails the documentation build. Canvas documentation covers its own callbacks and selected inherited React Flow props. Conditional display fallbacks are described in prose rather than treated as declared defaults.

Do not edit `src/docs/generated-api.json` directly. The `typescript-api` development dependency supplies the compiler API used for extraction alongside the app's TypeScript compiler. `/api/components.json` exposes the generated information to tools.

Every build ends with `npm run site:check`. It checks all generated pages for titles, descriptions, canonical policy, headings, valid JSON-LD and breadcrumbs, internal links and fragments, assets, matching Markdown and llms exports, registry items, 1200 × 630 social images, and sitemap coverage when a domain is configured. `npm run test:validation` deliberately introduces a broken link and malformed JSON-LD in a temporary build copy to check that validation catches both.

## Local performance reports

```sh
npm run perf -- current
```

Run a production preview at `http://127.0.0.1:5180` first, or set `PERF_ORIGIN` to its address. The script explicitly uses installed Google Chrome and Lighthouse's default simulated mobile throttling. It saves JSON reports, viewable HTML reports, and a summary under `artifacts/performance/current/`. Each invocation measures the homepage, Prompt Composer docs, and installation docs once. Stop other browser tests before comparing timing results; scores vary with the local environment and are not field Core Web Vitals.
