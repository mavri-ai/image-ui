import { catalog, type ComponentId } from '../catalog'
import generatedApi from './generated-api.json'
export { homeDescription, installCommand, normalizePath } from '../routes'
import rawSimulation from '../demo/use-demo-generation.ts?raw'
import rawCanvasRules from '../examples/canvas-rules.ts?raw'
export const canvasRulesSource = rawCanvasRules.replaceAll(
  "'../components/image-ui/",
  "'@/components/image-ui/",
)

export const simulationSource = rawSimulation.replaceAll(
  "'../components/image-ui/",
  "'@/components/image-ui/",
)

export interface PropDoc {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}
export interface Section {
  title: string
  paragraphs?: string[]
  code?: string
  language?: string
}
export interface DocPage {
  path: string
  title: string
  description: string
  category: 'Components' | 'Documentation' | 'Guides'
  component?: ComponentId
  example?: string
  sections: Section[]
  props?: PropDoc[]
  related?: ComponentId[]
}
const exampleSources = import.meta.glob<string>('../examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
})
export function exampleSource(id: string) {
  return (
    "'use client'\n\n" +
    exampleSources[`../examples/${id}.tsx`]
      .replaceAll("'../components/image-ui/", "'@/components/image-ui/")
      .replaceAll("'../demo/use-demo-generation'", "'./use-demo-generation'")
      .replaceAll('${import.meta.env.BASE_URL}', '/')
  )
}
const prop = (name: string, description: string) => ({ name, description })
const detail: Record<
  ComponentId,
  Omit<DocPage, 'path' | 'category' | 'component' | 'props'> & {
    props: { name: string; description: string }[]
  }
> = {
  'generation-card': {
    title: 'Generation card',
    description:
      'A controlled React component for image-generation progress, queued jobs, completed images, cancellation, and recoverable errors.',
    props: [
      prop('status', 'idle, queued, generating, complete, failed, or cancelled.'),
      prop('src', 'Image URL for a completed generation.'),
      prop('alt', 'Describe the completed image.'),
      prop('title', 'Label in the card header.'),
      prop('model', 'Model label in the footer.'),
      prop('error', 'Message shown in the failed state.'),
      prop(
        'progress',
        'Percentage from 0 to 100, clamped to that range. Omit for indeterminate progress.',
      ),
      prop('onGenerate / onRetry', 'Optional actions for idle and failed/cancelled states.'),
      prop('onCancel', 'Optional cancel action for queued or generating jobs.'),
      prop('onOpen', 'Shows an expand button on completed images.'),
      prop(
        'loading',
        'Native image loading strategy. Use eager for a visible primary result; lazy is appropriate for offscreen cards.',
      ),
      prop(
        'fetchPriority',
        'Native image request priority hint. Use high sparingly for the page’s primary image.',
      ),
      prop('className', 'Additional class names on the card.'),
    ],
    sections: [
      {
        title: 'When to use it',
        paragraphs: [
          'Use a generation card for a single asynchronous image job. It keeps the job state in one place while your application handles requests, persistence, and cancellation. For multiple outputs with independent outcomes, pair it with Output Gallery.',
        ],
      },
      {
        title: 'States and progress',
        paragraphs: [
          'Pass the actual job status from your application. A completed result needs both status="complete" and a valid src. The card does not start a request, measure progress, preserve inputs, or retry automatically.',
          'When the provider has no trustworthy progress signal, omit progress. The indeterminate progressbar avoids implying a precise percentage. Error and cancellation copy should match what your application actually preserves.',
        ],
      },
      {
        title: 'Accessibility and integration',
        paragraphs: [
          'The footer exposes status text, and generating jobs expose a labelled progressbar. Provide meaningful alternative text and connect onCancel to your application’s cancellation mechanism. Discard late responses after cancellation so an old result cannot overwrite a newer job.',
        ],
      },
    ],
    related: ['prompt-composer', 'output-gallery', 'image-actions'],
  },
  'reference-input': {
    title: 'Reference input',
    description:
      'A React reference-image upload component with drag and drop, local previews, file validation, limits, and removal.',
    props: [
      prop('value', 'Controlled images with id, src, and name.'),
      prop('onChange', 'Receives the next complete image list.'),
      prop('maxFiles', 'Maximum total number of references.'),
      prop('maxSizeMB', 'Maximum size of each file, measured in 1024 × 1024 bytes.'),
    ],
    sections: [
      {
        title: 'Local uploads and previews',
        paragraphs: [
          'Choose files with the upload button or drop them into the field. PNG, JPEG, WebP, and AVIF MIME types are accepted. Files are read into data URLs in the browser; the component does not upload them or call a provider.',
          'The component validates the total count, declared MIME type, and per-file size before reading a batch. Invalid batches show an error instead of partially adding files. Removing a reference emits a new list.',
        ],
      },
      {
        title: 'Application responsibilities',
        paragraphs: [
          'Store the controlled list and supply limits appropriate to your product. Validate file contents, dimensions, and size again on your server before storing or forwarding user files. Browser MIME checks are a convenience, not a security boundary.',
          'Data URLs can consume substantial memory. Avoid persisting large data URLs in localStorage; upload through your own backend when durable storage is required. Existing references can also use ordinary image URLs.',
        ],
      },
      {
        title: 'Keyboard and errors',
        paragraphs: [
          'The upload and removal buttons are keyboard accessible. Validation failures use an alert. Include this component in a form with clear context, and preserve references when a generation job fails.',
        ],
      },
    ],
    related: ['prompt-composer', 'generative-canvas', 'image-actions'],
  },
  'prompt-composer': {
    title: 'Prompt composer',
    description:
      'A controlled React image prompt input combining reference uploads, model selection, image settings, and generate or cancel actions.',
    props: [
      prop('value', 'Current prompt text.'),
      prop('onChange', 'Receives edited prompt text.'),
      prop('onGenerate', 'Start a job using your current application state.'),
      prop('onCancel', 'Cancel callback. Supply whenever busy can be true.'),
      prop('busy', 'Replaces the generate action with cancel.'),
      prop('models', 'Application-supplied model catalogue.'),
      prop('model / onModelChange', 'Controlled model id and change callback.'),
      prop('settings / onSettingsChange', 'Controlled aspect ratio, quality, and count.'),
      prop('references / onReferencesChange', 'Controlled reference image list.'),
    ],
    sections: [
      {
        title: 'One input for the generation workflow',
        paragraphs: [
          'Use Prompt Composer when a prompt needs references, a model picker, and image settings together. All values live in your application. The component provides the controls; it does not select a provider or submit network requests.',
        ],
      },
      {
        title: 'Submitting and cancelling',
        paragraphs: [
          'The generate action is disabled for whitespace-only prompts. Cmd+Enter on macOS or Ctrl+Enter submits a nonempty prompt when the composer is not busy. When busy is true, supply onCancel so the visible cancel control can stop the job.',
          'Snapshot prompt, model, references, and settings when starting a request. The controls remain editable during generation, so a finished result should be associated with its submitted values. Cancelling does not clear the controlled values.',
        ],
      },
      {
        title: 'Models and settings',
        paragraphs: [
          'Supply the model list your backend actually supports. Names in the showcase are illustrative, not a compatibility promise. Map aspect ratio, quality, and output count to the selected provider on your server, rejecting unsupported combinations. The embedded reference input uses its default four-file and 10 MB limits.',
        ],
      },
    ],
    related: ['generation-card', 'reference-input', 'model-picker', 'generation-settings'],
  },
  'model-picker': {
    title: 'Model picker',
    description:
      'A searchable React AI model selector with controlled selection, inline and popover layouts, and an application-supplied model list.',
    props: [
      prop('models', 'Each model has id, name, provider, description, mark, and color.'),
      prop('value', 'Selected model id.'),
      prop('onChange', 'Receives the selected id.'),
      prop('inline', 'Render the searchable panel directly instead of a popover.'),
    ],
    sections: [
      {
        title: 'Search and selection',
        paragraphs: [
          'Search matches model names and providers without case sensitivity. Selection emits an id, clears search, and closes the popover. No matches produces an explicit empty state. A value absent from models displays “Choose model”.',
        ],
      },
      {
        title: 'Bring your own catalogue',
        paragraphs: [
          'ImageModel describes UI labels only. It does not register a provider, embed credentials, or validate capabilities. The color field remains part of the shared type, while the current model mark uses neutral styling.',
          'Keep availability, pricing, and permissions in your application. If an active model becomes unavailable, reconcile the selected id before submitting.',
        ],
      },
      {
        title: 'Keyboard behavior',
        paragraphs: [
          'The popover supports Escape dismissal and focus return through Radix. Model options are ordinary focusable buttons with aria-pressed selection; use Tab to move between them. This is not an ARIA combobox with arrow-key option navigation.',
        ],
      },
    ],
    related: ['prompt-composer', 'generation-settings'],
  },
  'generation-settings': {
    title: 'Generation settings',
    description:
      'Controlled React image-generation settings for aspect ratio, quality, and output count, with radio controls and a bounded stepper.',
    props: [
      prop('value', 'aspectRatio, quality, and count. Supply a valid initial value.'),
      prop('onChange', 'Receives a new options object after each change.'),
    ],
    sections: [
      {
        title: 'Available controls',
        paragraphs: [
          'Aspect ratios are 1:1, 4:3, 3:4, and 16:9. Quality is standard or high. The count stepper disables decrement at one and increment at four. The component does not normalize an invalid initial count, so validate application state before passing it in.',
        ],
      },
      {
        title: 'Provider mapping',
        paragraphs: [
          'These values are interface choices, not universal provider parameters. Map them to the selected provider’s supported sizes, quality levels, and batch behavior on your server. Enforce provider limits and authorization there as well.',
        ],
      },
      {
        title: 'Keyboard and customization',
        paragraphs: [
          'Aspect ratios use a labelled native radio group. The count uses labelled buttons and a live output. Quality uses pressed-state buttons. Override the --iu-* CSS tokens to match your app, and preserve visible focus styles.',
        ],
      },
    ],
    related: ['prompt-composer', 'model-picker'],
  },
  'output-gallery': {
    title: 'Output gallery',
    description:
      'A React AI image gallery with controlled multi-selection, generating placeholders, individual failures, and per-output retry actions.',
    props: [
      prop('items', 'Items with id, status, alt, and optional src/error.'),
      prop('selected', 'Selected output ids.'),
      prop('onSelectionChange', 'Receives the next selection.'),
      prop('onRetry', 'Shows a retry action for failed outputs.'),
    ],
    sections: [
      {
        title: 'Partial results',
        paragraphs: [
          'Each output is complete, generating, or failed. Successful items need a src and display a selectable image. Generating items show a spinner, while failed items show their error and an optional retry button. Keep item ids stable while updating their state.',
        ],
      },
      {
        title: 'Selection and retry',
        paragraphs: [
          'Selection is controlled and can contain multiple ids. The component emits the updated list when a completed image is clicked. Reconcile selected ids when replacing or removing outputs.',
          'Retry callbacks receive only the output id. Your application must find the original request, update that output’s status, and perform the retry. Failed items should stay visible beside successful results instead of forcing the whole batch to restart.',
        ],
      },
      {
        title: 'Accessible output descriptions',
        paragraphs: [
          'Give every output descriptive alt text; it is also used in the selection button label. Selection uses aria-pressed. Announce asynchronous batch completion from the surrounding application when needed.',
        ],
      },
    ],
    related: ['generation-card', 'image-actions', 'version-history'],
  },
  'version-history': {
    title: 'Version history',
    description:
      'A React image version history component showing previous outputs together with their prompts, model labels, and generation settings.',
    props: [
      prop(
        'versions',
        'Image versions with id, src, prompt, model, settings, label, and createdAt.',
      ),
      prop('value', 'Selected version id.'),
      prop('onChange', 'Receives the selected version id.'),
    ],
    sections: [
      {
        title: 'Browse previous results',
        paragraphs: [
          'Version History displays the selected result, a thumbnail strip, and the prompt, model, aspect ratio, quality, and display timestamp. An empty list or an unmatched selected id shows “No versions yet.”',
          'createdAt is displayed as supplied. Format it for your audience before passing it in. GenerationOptions.count is stored in the type but is not displayed in the current details row.',
        ],
      },
      {
        title: 'Persistence and restoration',
        paragraphs: [
          'Store snapshots when jobs complete, including the submitted prompt and settings. The component does not persist versions, regenerate images, or restore composer values automatically. Use onChange to implement those behaviors deliberately.',
        ],
      },
      {
        title: 'Keyboard and image descriptions',
        paragraphs: [
          'Thumbnail buttons expose their selected state. The large image uses the version prompt as its alternative text; use accurate, concise prompts or adapt the component when a separate image description is needed.',
        ],
      },
    ],
    related: ['output-gallery', 'prompt-composer', 'image-actions'],
  },
  'image-actions': {
    title: 'Image actions',
    description:
      'React image actions for full-screen preview, file downloads, creating variations, and reusing an image as a reference.',
    props: [
      prop('src', 'Image URL used for preview and fetch-based download.'),
      prop('alt', 'Image description and preview dialog title.'),
      prop('onRetry', 'Optional callback for “Create a variation”.'),
      prop('onUseReference', 'Optional callback for adding the image to your references.'),
      prop('fileName', 'Suggested download filename; match the actual file format.'),
    ],
    sections: [
      {
        title: 'Preview and download',
        paragraphs: [
          'Image Actions includes a modal image preview and a download button. Downloads fetch the URL, create a temporary object URL, and release it after starting the download. A failed request displays an error.',
          'Remote image hosts must allow the browser to fetch the image using CORS. For private or restricted assets, supply a same-origin authorized download endpoint. A filename extension does not convert the image’s format.',
        ],
      },
      {
        title: 'Variations and references',
        paragraphs: [
          'The variation and reference buttons appear only when callbacks are supplied. onRetry represents a variation action here; your application decides whether it reuses a prompt, opens an editor, or starts a new request. No provider request or reference mutation happens automatically.',
        ],
      },
      {
        title: 'Controlled image preview',
        paragraphs: [
          'ImagePreview is also exported for custom launchers. It accepts src, alt, open, and onOpenChange. The Radix dialog supports Escape, contains keyboard focus, and returns focus to the element active when the preview opened.',
        ],
      },
    ],
    related: ['output-gallery', 'reference-input', 'version-history'],
  },
  'generative-canvas': {
    title: 'Generative canvas',
    description:
      'A React Flow canvas for node-based image-generation interfaces, connecting references, prompts, generation results, and notes.',
    props: [
      prop('nodes / edges', 'Controlled graph state, using the imageUi node type.'),
      prop(
        'onNodesChange / onEdgesChange',
        'Apply moves, selections, and deletions to controlled state.',
      ),
      prop('onConnect', 'Validate and add a new edge in your application.'),
      prop('onGenerate', 'Optional generate/retry action on generation nodes.'),
      prop('onPromptChange', 'Update editable prompts and note text.'),
      prop('onAddNode', 'Shows generation and note creation controls.'),
      prop(
        'Other React Flow props',
        'Passed through except nodeTypes and children. The component provides its own provider, controls, and node renderer.',
      ),
    ],
    sections: [
      {
        title: 'Graph structure',
        paragraphs: [
          'CanvasNode.data.kind is reference, generation, output, or note. Every node needs a unique id, type="imageUi", position, kind, and title. Generation nodes can also carry prompt, status, model, and src.',
          'The canvas includes pan, zoom, fit-to-nodes, draggable nodes, handles, and generation/note creation controls when callbacks are present. Its stylesheet provides a canvas height; the parent must provide usable width.',
        ],
      },
      {
        title: 'Execution belongs to your application',
        paragraphs: [
          'An edge represents a connection, not an automatic request pipeline. Resolve connected references, snapshot inputs, call your backend, and update node status and output yourself.',
          'The minimal example allows connections through addEdge. Production applications should reject cycles, duplicate or invalid connections, and unsupported node combinations. The showcase implements additional connection checks in its demo controller.',
        ],
      },
      {
        title: 'Keyboard and customization',
        paragraphs: [
          'React Flow provides keyboard navigation and node interactions. Backspace or Delete removes selected elements when your controlled change callbacks apply the changes. Prompt fields use nodrag and nowheel classes so editing does not pan the canvas.',
          'React Flow styles are imported by the component. Keep those styles and image-ui.css available in the host application, and provide an alternative linear workflow when a graph is unsuitable for a user’s device or task.',
        ],
      },
    ],
    related: ['reference-input', 'prompt-composer', 'generation-card'],
  },
}

export const componentPages: DocPage[] = catalog.map((item) => {
  const manual = detail[item.id]
  const descriptions = new Map(
    manual.props!.flatMap((prop) =>
      prop.name.split(' / ').map((name) => [name, prop.description] as const),
    ),
  )
  const props = generatedApi.components[item.id].map((prop) => {
    const description = descriptions.get(prop.name)
    if (!description) throw new Error(`Document the public prop ${item.id}.${prop.name}`)
    return { ...prop, description }
  })
  return {
    ...manual,
    props,
    path: `/components/${item.id}`,
    category: 'Components',
    component: item.id,
    sections: [
      ...manual.sections,
      {
        title: 'Shared types',
        paragraphs: [
          'Types below are generated from the component source. Prop types, optionality, and declared defaults in the API reference are generated as well.',
        ],
        code:
          generatedApi.sharedTypes +
          (item.id === 'generative-canvas' ? '\n' + generatedApi.canvasNode : ''),
        language: 'ts',
      },
    ],
  }
})
export const supportPages: DocPage[] = [
  {
    path: '/docs/installation',
    title: 'Installation',
    category: 'Documentation',
    description:
      'Install Image UI React components through the shadcn registry or copy the source, styles, and dependencies into your application.',
    sections: [
      {
        title: 'Install a component',
        paragraphs: [
          'Use a React application with TypeScript and a working @/components alias. The registry uses shadcn’s CLI for source distribution; the components use CSS tokens and do not require Tailwind. Start with a shadcn-initialized application, or copy the files manually into any React app.',
          'Every registry item includes its local component dependencies, shared types, helpers, and stylesheet. The primary component imports image-ui.css. Install one component at a time or use multiple registry URLs in the same add command.',
        ],
        code: 'npx shadcn@latest add SITE_ORIGIN/r/prompt-composer.json',
        language: 'sh',
      },
      {
        title: 'Manual installation',
        paragraphs: [
          'Copy the required files from src/components/image-ui in the source repository. Preserve relative imports, install the packages those files import, and import image-ui.css once. React and React DOM belong to the host application. Most components use lucide-react and motion; popovers and dialogs use radix-ui; Generative Canvas additionally uses @xyflow/react.',
        ],
        code: "import './components/image-ui/image-ui.css'\nimport { GenerationCard } from './components/image-ui/generation-card'",
        language: 'tsx',
      },
      {
        title: 'Client rendering and examples',
        paragraphs: [
          'Components use React hooks and include a use client directive for environments with React Server Components. Put controlled state in a client component. Keep provider credentials and generation requests on your server.',
          'Documentation examples use your own model catalogue and local sample image paths. Supply your own image assets. Examples that import useDemoGeneration also need the downloadable simulation hook linked below; it is demonstration code and is not shipped in component registry items.',
        ],
      },
      {
        title: 'Registry namespace for coding agents',
        paragraphs: [
          'Merge this registry entry into your existing components.json. With the shadcn MCP server configured in your coding tool, the registry can be browsed and installed through that server. No separate Image UI MCP server is required.',
        ],
        code: JSON.stringify({ registries: { '@image-ui': 'SITE_ORIGIN/r/{name}.json' } }, null, 2),
        language: 'json',
      },
      {
        title: 'Source and license',
        paragraphs: [
          'Image UI code is MIT licensed and maintained by Mavri. Demo photographs have separate Unsplash licensing and are not included in the component registry. The components are controlled UI: no bundled provider client, API key, image-generation service, or automatic backend integration.',
        ],
      },
    ],
  },
  {
    path: '/docs/theming',
    title: 'Theming',
    category: 'Documentation',
    description:
      'Customize Image UI using CSS custom properties, inherited fonts, light and dark themes, and reduced-motion preferences.',
    sections: [
      {
        title: 'Light and dark',
        paragraphs: [
          'The base tokens define a light palette. Add data-theme="dark" to the document or a containing element for the included dark palette. The showcase remembers its theme locally; reusable components do not manage your theme.',
        ],
        code: '<div data-theme="dark">\n  {/* Your Image UI components */}\n</div>',
        language: 'tsx',
      },
      {
        title: 'Override tokens',
        paragraphs: [
          'Load overrides after image-ui.css. Scope them to an application container when multiple themes share a page. Fonts inherit from your host application and fall back to system fonts; the showcase uses Inter and Geist Mono.',
        ],
        code: '.my-image-tool {\n  --iu-font: system-ui, sans-serif;\n  --iu-mono: ui-monospace, monospace;\n  --iu-brand: #5276ee;\n  --iu-focus: #5681ee;\n  --iu-background: #fafafa;\n  --iu-surface: #ffffff;\n  --iu-text: #242528;\n}',
        language: 'css',
      },
      {
        title: 'Motion and accessibility',
        paragraphs: [
          'Wrap your application in MotionConfig reducedMotion="user" from motion/react to respect the system preference for Motion animations. The stylesheet also reduces CSS animations when prefers-reduced-motion is enabled.',
          'Check contrast after overriding text, surface, border, and focus colors. Preserve accessible names and visible focus indicators. Test keyboard flows and mobile layouts in the application where you install the components.',
        ],
        code: 'import { MotionConfig } from \'motion/react\'\n\n<MotionConfig reducedMotion="user">\n  {/* Your application */}\n</MotionConfig>',
        language: 'tsx',
      },
    ],
  },
  {
    path: '/docs/agents',
    title: 'Use with coding agents',
    category: 'Documentation',
    description:
      'Give coding agents accurate Image UI documentation, component source, registry installation commands, and examples without a custom integration.',
    sections: [
      {
        title: 'Choose a documentation format',
        paragraphs: [
          'Use Copy documentation on a component page for its explanation, installation command, example, props, and limitations. Every documentation page is also available at its path plus .md. The llms.txt index links to these pages; llms-full.txt contains the full documentation set.',
          'These exports come from the same content as the website. They are conveniences for tools that read text, not a guarantee of search ranking or citation.',
        ],
      },
      {
        title: 'Configure the registry',
        paragraphs: [
          'Merge this entry into components.json, then configure the official shadcn MCP server in your coding tool using the shadcn documentation. Component installation is also available directly through the shadcn CLI.',
        ],
        code: JSON.stringify({ registries: { '@image-ui': 'SITE_ORIGIN/r/{name}.json' } }, null, 2),
        language: 'json',
      },
      {
        title: 'A useful instruction',
        code: 'Use Image UI’s Prompt Composer, Generation Card, and Output Gallery.\nRead SITE_ORIGIN/guides/image-generation-workflow.md first.\nInstall the components from SITE_ORIGIN/r/{name}.json.\nKeep state in my application and keep provider credentials on the server.\nImplement queued, generating, complete, failed, and cancelled states.\nUse the simulation hook only for the demo; do not present it as a real provider integration.',
        language: 'text',
      },
      {
        title: 'Check the result',
        paragraphs: [
          'Review the generated imports, CSS inclusion, callback behavior, and dependency versions. Run your application’s typecheck and exercise generation, cancellation, and retry. A successful copy or downloaded registry item is not proof that an integration works.',
        ],
      },
    ],
  },
  {
    path: '/guides/image-generation-workflow',
    title: 'Build an image-generation workflow',
    category: 'Guides',
    description:
      'Connect a React prompt composer, generation progress card, and output gallery with working local simulation, cancellation, failures, and retries.',
    sections: [
      {
        title: '1. Install the three components',
        paragraphs: [
          'This example combines controlled inputs, one asynchronous job, and output selection. It runs locally with a timer and a sample photograph. No provider requests occur, and uploads stay in the browser.',
          'The local simulation returns one fixed image. Model choice, references, quality, and count demonstrate controlled inputs but do not change that image. A real backend must implement these settings.',
        ],
        code: 'npx shadcn@latest add SITE_ORIGIN/r/prompt-composer.json SITE_ORIGIN/r/generation-card.json SITE_ORIGIN/r/output-gallery.json',
        language: 'sh',
      },
      {
        title: '2. Keep inputs and job state separate',
        paragraphs: [
          'Prompt Composer owns no application state. Store its prompt, model id, references, and settings with useState. Snapshot the submitted prompt before starting the simulated job so edits during generation do not relabel the completed output.',
          'The busy flag comes from queued or generating status. Clearing old outputs and selection when starting a new job keeps results associated with the current run.',
        ],
      },
      {
        title: '3. Connect cancellation and retry',
        paragraphs: [
          'useDemoGeneration tracks timers and clears them on cancellation, retry, and unmount. Cancelling preserves the controlled input state. Simulate failure while the job runs, then use Try again to restart it.',
          'The hook is included below for copying into your project. It is demo support code, not a provider adapter or part of the component registry.',
        ],
      },
      {
        title: '4. Connect your own backend',
        paragraphs: [
          'Replace the timer hook with a job controller that posts the submitted inputs to your server. Validate supported settings and uploaded files there, keep provider credentials there, and return a job id or authorized result URL.',
          'Use provider progress only when available; otherwise omit progress for an indeterminate indicator. Cancelling the browser request alone may not cancel provider work. Track job identities, reject stale responses, and expose the backend’s actual cancellation behavior.',
          'For multiple outputs, store a stable id and status for each item. Preserve successful outputs when another item fails, and retry only failed jobs when the provider supports it. Persist submitted inputs and results when implementing version history.',
        ],
      },
    ],
    related: ['prompt-composer', 'generation-card', 'output-gallery'],
  },
]
const advancedGuides: DocPage[] = [
  {
    path: '/guides/partial-failures',
    title: 'Handle partial failures',
    description:
      'Retry one failed image-generation output while preserving successful results and controlled selection.',
    category: 'Guides',
    example: 'partial-failures',
    related: ['output-gallery', 'generation-card'],
    sections: [
      {
        title: 'Keep each result independent',
        paragraphs: [
          'Store a stable id and status for every output. Retry updates the failed item to generating, then replaces only that result when it completes. Existing completed images and selection remain available.',
          'This example uses a local timer, cancels timers on unmount, and prevents duplicate retries for the same item. It does not make provider requests.',
        ],
      },
      {
        title: 'Connect the retry to a backend',
        paragraphs: [
          'Associate each id with its submitted request. Enforce retry limits and permissions on the server, preserve successful results, and ignore responses from superseded attempts. Use provider job ids rather than array indices for persistence.',
        ],
      },
    ],
  },
  {
    path: '/guides/version-restoration',
    title: 'Restore previous versions',
    description:
      'Preview an image version, then explicitly restore its prompt and generation settings without starting a new job.',
    category: 'Guides',
    example: 'version-restoration',
    related: ['version-history', 'prompt-composer'],
    sections: [
      {
        title: 'Preview and restoration are separate actions',
        paragraphs: [
          'Selecting a thumbnail updates only the selected version. Restore selected version copies the saved prompt and settings into the current form. It does not mutate the saved snapshot or automatically start generation.',
          'This example uses one illustrative model. A multi-model application must also reconcile the saved model id with the models currently available to the user.',
        ],
      },
      {
        title: 'Persist snapshots deliberately',
        paragraphs: [
          'Capture the submitted inputs when the job starts and associate them with the completed result. Restore a new settings object, validate that its options are still supported, and ask for confirmation if restoration would discard substantial unsaved edits.',
        ],
      },
    ],
  },
  {
    path: '/guides/reference-reuse',
    title: 'Reuse output as a reference',
    description:
      'Add a completed image to a controlled reference list, prevent duplicates, and enforce the same limit as the upload component.',
    category: 'Guides',
    example: 'reference-reuse',
    related: ['image-actions', 'reference-input'],
    sections: [
      {
        title: 'Reuse the output identity',
        paragraphs: [
          'Image Actions invokes onUseReference; the application adds the output to ReferenceInput’s controlled value. Stable ids prevent duplicates. The same four-file limit applies whether an image came from an upload or a completed output.',
          'Removing a reference makes room for another. This local example does not upload the image or start another generation.',
        ],
      },
      {
        title: 'Use durable authorized URLs',
        paragraphs: [
          'For a real application, resolve expiring image URLs before reuse, preserve authorization, and validate access on your server. Passing an image URL to the UI does not prove the generation provider can retrieve it.',
        ],
      },
    ],
  },
  {
    path: '/guides/canvas-connections',
    title: 'Validate canvas connections',
    description:
      'Build a controlled React Flow graph with connection rules that reject missing nodes, self-links, duplicates, cycles, and incompatible node kinds.',
    category: 'Guides',
    example: 'canvas-connections',
    related: ['generative-canvas', 'reference-input'],
    sections: [
      {
        title: 'Validate before adding edges',
        paragraphs: [
          'This example permits reference → generation, generation → output, and output → generation. Notes cannot be connected. A depth-first traversal rejects any edge that would create a cycle.',
          'The canvas uses the same validator for handle interactions and the accessible Connect reference button. Try the button twice to see duplicate rejection, then reset the connections.',
        ],
      },
      {
        title: 'Execution is a separate concern',
        paragraphs: [
          'Edges describe dependencies; they do not run image jobs. Your application must resolve upstream references, snapshot inputs, execute jobs, and update output nodes. If graphs are saved or shared, validate them again on the server.',
        ],
      },
    ],
  },
]
export const pages = [...componentPages, ...supportPages, ...advancedGuides]
export function findPage(path: string) {
  return pages.find((page) => page.path === (path.replace(/\/+$/, '') || '/'))
}
