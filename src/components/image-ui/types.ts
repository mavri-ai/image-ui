export type GenerationStatus =
  'idle' | 'queued' | 'generating' | 'complete' | 'failed' | 'cancelled'

export interface ReferenceImage {
  id: string
  src: string
  name: string
}

export interface ImageModel {
  id: string
  name: string
  provider: string
  description: string
  logo?: string
  monochromeLogo?: boolean
  mark: string
  color: string
}

export interface GenerationOptions {
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9'
  quality: 'standard' | 'high'
  count: number
}

export interface GenerationOutput {
  id: string
  status: 'complete' | 'generating' | 'failed'
  src?: string
  alt: string
  error?: string
}

export interface ImageVersion {
  id: string
  src: string
  prompt: string
  model: string
  settings: GenerationOptions
  label: string
  createdAt: string
}
