import { expect, test } from '@playwright/test'
import { validateConnection } from '../src/examples/canvas-rules'
import type { CanvasNode } from '../src/components/image-ui/generative-canvas'

const nodes: Pick<CanvasNode, 'id' | 'data'>[] = [
  { id: 'ref', data: { kind: 'reference', title: 'Reference' } },
  { id: 'gen', data: { kind: 'generation', title: 'Generation' } },
  { id: 'out', data: { kind: 'output', title: 'Output' } },
  { id: 'note', data: { kind: 'note', title: 'Note' } },
]
test('connection rules reject invalid topology while allowing a generation pipeline', () => {
  expect(validateConnection({ source: 'ref', target: 'gen' }, nodes, [])).toBeUndefined()
  expect(validateConnection({ source: 'gen', target: 'out' }, nodes, [])).toBeUndefined()
  expect(validateConnection({ source: 'missing', target: 'gen' }, nodes, [])).toContain('exist')
  expect(validateConnection({ source: 'gen', target: 'gen' }, nodes, [])).toContain('itself')
  expect(
    validateConnection({ source: 'ref', target: 'gen' }, nodes, [{ source: 'ref', target: 'gen' }]),
  ).toContain('already')
  expect(
    validateConnection({ source: 'out', target: 'gen' }, nodes, [{ source: 'gen', target: 'out' }]),
  ).toContain('cycle')
  expect(validateConnection({ source: 'note', target: 'gen' }, nodes, [])).toContain('cannot')
})
