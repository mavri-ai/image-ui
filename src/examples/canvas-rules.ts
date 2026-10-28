import type { CanvasNode } from '../components/image-ui/generative-canvas'

export interface GraphConnection {
  source: string
  target: string
}
export function validateConnection(
  connection: GraphConnection,
  nodes: Pick<CanvasNode, 'id' | 'data'>[],
  edges: GraphConnection[],
): string | undefined {
  const source = nodes.find((node) => node.id === connection.source)
  const target = nodes.find((node) => node.id === connection.target)
  if (!source || !target) return 'Both nodes must exist.'
  if (source.id === target.id) return 'A node cannot connect to itself.'
  if (edges.some((edge) => edge.source === source.id && edge.target === target.id))
    return 'That connection already exists.'
  const adjacency = new Map<string, string[]>()
  for (const edge of edges)
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target])
  const pending = [target.id]
  const visited = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (id === source.id) return 'This connection would create a cycle.'
    if (visited.has(id)) continue
    visited.add(id)
    pending.push(...(adjacency.get(id) ?? []))
  }
  const allowed: Record<CanvasNode['data']['kind'], CanvasNode['data']['kind'][]> = {
    reference: ['generation'],
    generation: ['output'],
    output: ['generation'],
    note: [],
  }
  if (!allowed[source.data.kind].includes(target.data.kind))
    return 'These node types cannot be connected.'
  return undefined
}
