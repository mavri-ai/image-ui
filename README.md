# image/ui

React components for image generation interfaces. A single-page collection of interactive previews, source code, and installable components.

## Run locally

Requires Node.js 22.12+ and npm.

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

## Build for hosting

```sh
npm run build
```

The static output is `dist/`. To host the showcase at a subpath, build with
`IMAGE_UI_BASE_PATH` set to that path and serve the generated files at the same
location. Keep the component registry, images, fonts, and theme initializer
available alongside the page.

## Components

- Generation card: idle, queued, generating, complete, failed, and cancelled states
- Reference input: real image uploads, drag and drop, validation, previews, and removal
- Prompt composer: references, a model picker, settings, and generate/cancel actions
- Model picker: searchable, app-supplied models
- Generation settings: aspect ratio, quality, and output count
- Output gallery: selection, mixed completion states, and retries
- Version history: previous images with prompts, models, and settings
- Generative canvas: draggable nodes, connections, editable prompts, and canvas controls

## Use a component

Use **Install component** underneath a preview for its shadcn command. A running local instance can serve the registry, too:

```sh
npx shadcn@latest add http://localhost:5173/r/generation-card.json
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

Component code is MIT licensed. Demo images are illustrative sample content,
are not included in the component registry, and are not covered by the code's
MIT license. Replace them with your own appropriately licensed assets when
reusing the examples. See [image notes](public/images/CREDITS.md).
