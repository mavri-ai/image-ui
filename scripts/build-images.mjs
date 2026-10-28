import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const source = path.resolve(import.meta.dirname, '../public/images')
const output = path.join(source, 'optimized')
await mkdir(output, { recursive: true })
for (const file of await readdir(source)) {
  if (!file.endsWith('.jpg')) continue
  for (const width of [480, 960]) {
    await sharp(path.join(source, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(output, `${file.slice(0, -4)}-${width}.webp`))
  }
}
console.log('Built responsive WebP demo assets; originals are preserved.')
