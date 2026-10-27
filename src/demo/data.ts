import type {
  GenerationOptions,
  ImageModel,
  ImageVersion,
  ReferenceImage,
} from '../components/image-ui/types'

export const models: ImageModel[] = [
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    provider: 'OpenAI',
    description: 'OpenAI',
    mark: 'O',
    logo: `${import.meta.env.BASE_URL}logos/openai.svg`,
    monochromeLogo: true,
    color: '#597966',
  },
  {
    id: 'flux-2-pro',
    name: 'FLUX.2 Pro',
    provider: 'Black Forest Labs',
    description: 'Black Forest Labs',
    mark: 'F',
    logo: `${import.meta.env.BASE_URL}logos/bfl.svg`,
    monochromeLogo: true,
    color: '#9a7754',
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    provider: 'Google',
    description: 'Google',
    mark: 'G',
    logo: `${import.meta.env.BASE_URL}logos/google.png`,
    color: '#6882af',
  },
  {
    id: 'ideogram-4.0',
    name: 'Ideogram 4.0',
    provider: 'Ideogram',
    description: 'Ideogram',
    mark: 'i',
    logo: `${import.meta.env.BASE_URL}logos/ideogram.svg`,
    monochromeLogo: true,
    color: '#8970a9',
  },
]

export const defaultSettings: GenerationOptions = { aspectRatio: '4:3', quality: 'high', count: 1 }
export const referenceImages: ReferenceImage[] = [
  {
    id: 'climber',
    src: `${import.meta.env.BASE_URL}images/climbing-portrait.jpg`,
    name: 'climbing-portrait.jpg',
  },
  {
    id: 'gear',
    src: `${import.meta.env.BASE_URL}images/climbing-gear.jpg`,
    name: 'climbing-gear.jpg',
  },
  { id: 'boot', src: `${import.meta.env.BASE_URL}images/trail-boot.jpg`, name: 'trail-boot.jpg' },
]

export const versions: ImageVersion[] = [
  {
    id: 'v1',
    src: `${import.meta.env.BASE_URL}images/light-grid.jpg`,
    prompt:
      'Geometric table lights arranged on a burgundy surface. Afternoon sun and long architectural shadows.',
    model: 'GPT Image 2',
    settings: { ...defaultSettings, aspectRatio: '16:9' },
    label: 'Version 01',
    createdAt: '2:40 PM',
  },
  {
    id: 'v2',
    src: `${import.meta.env.BASE_URL}images/handheld-lights.jpg`,
    prompt:
      'Hands arranging translucent amber lamps on a dark green surface. Warm glowing light, deep shadows, playful product styling.',
    model: 'GPT Image 2',
    settings: defaultSettings,
    label: 'Version 02',
    createdAt: '2:43 PM',
  },
  {
    id: 'v3',
    src: `${import.meta.env.BASE_URL}images/light-detail.jpg`,
    prompt:
      'A close view of geometric cream lights on a burgundy tabletop. Sculptural forms, warm illumination, and crisp directional shadows.',
    model: 'FLUX.2 Pro',
    settings: { ...defaultSettings, aspectRatio: '4:3' },
    label: 'Version 03',
    createdAt: '2:46 PM',
  },
]

export const composerPrompt =
  'A technical hiking boot on a warm neutral backdrop. Soft studio light, crisp material detail, subtle grounding shadow.'
export const composerReferences = referenceImages.filter((image) => image.id === 'boot')
