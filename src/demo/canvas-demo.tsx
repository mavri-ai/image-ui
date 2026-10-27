import { useEffect, useRef } from 'react'
import {
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
} from '@xyflow/react'
import { GenerativeCanvas, type CanvasNode } from '../components/image-ui/generative-canvas'

const initialNodes: CanvasNode[] = [
  {
    id: 'reference',
    type: 'imageUi',
    position: { x: 0, y: 80 },
    data: {
      kind: 'reference',
      title: 'Reference',
      src: `${import.meta.env.BASE_URL}images/blue-light-study.jpg`,
      prompt: 'Cobalt blue spotlights surrounding a warm pool of light',
    },
  },
  {
    id: 'generation',
    type: 'imageUi',
    position: { x: 310, y: 0 },
    data: {
      kind: 'generation',
      title: 'Stage lighting',
      prompt:
        'A solitary performer framed by a semicircle of warm spotlights. Deep blue stage, reflective floor, dramatic cinematic atmosphere.',
      status: 'idle',
      model: 'GPT Image 2',
    },
  },
]
const initialEdges: Edge[] = [{ id: 'ref-gen', source: 'reference', target: 'generation' }]

export default function CanvasDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const latest = useRef({ nodes, edges })
  useEffect(() => {
    latest.current = { nodes, edges }
  }, [nodes, edges])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const reconnected = useRef(false)
  function validConnection(connection: Connection | Edge) {
    const sourceNode = nodes.find((node) => node.id === connection.source)
    const targetNode = nodes.find((node) => node.id === connection.target)
    if (!sourceNode || targetNode?.data.kind !== 'generation') return false
    if (!['reference', 'output', 'note'].includes(sourceNode.data.kind)) return false
    if (connection.source === connection.target) return false
    if (
      edges.some(
        (edge) =>
          edge.id !== ('id' in connection ? connection.id : '') &&
          edge.source === connection.source &&
          edge.target === connection.target,
      )
    )
      return false
    const visited = new Set<string>()
    function reachesSource(id: string): boolean {
      if (id === connection.source) return true
      if (visited.has(id)) return false
      visited.add(id)
      return edges.filter((edge) => edge.source === id).some((edge) => reachesSource(edge.target))
    }
    return !reachesSource(connection.target)
  }

  function generate(id: string) {
    const snapshot = latest.current
    const node = snapshot.nodes.find((item) => item.id === id)
    if (!node || node.data.status === 'generating') return
    const inputs = snapshot.edges
      .filter((edge) => edge.target === id)
      .map((edge) => snapshot.nodes.find((item) => item.id === edge.source))
      .filter((item): item is CanvasNode => Boolean(item))
    const prompt = [
      node.data.prompt,
      ...inputs.filter((item) => item.data.kind === 'note').map((item) => item.data.prompt),
    ]
      .filter(Boolean)
      .join('\n\n')
    if (!prompt.trim()) return
    const outputId = `output-${id}`
    setNodes((current) => {
      const existing = current.find((item) => item.id === outputId)
      const position = existing?.position ?? { x: node.position.x + 330, y: node.position.y + 40 }
      if (!existing) {
        while (
          current.some(
            (item) =>
              Math.abs(item.position.x - position.x) < 280 &&
              Math.abs(item.position.y - position.y) < 240,
          )
        )
          position.y += 280
      }
      return [
        ...current
          .filter((item) => item.id !== outputId)
          .map((item) =>
            item.id === id
              ? { ...item, data: { ...item.data, status: 'generating' as const } }
              : item,
          ),
        {
          id: outputId,
          type: 'imageUi',
          position,
          data: { kind: 'output', title: 'Output', status: 'generating', prompt },
        },
      ]
    })
    setEdges((current) =>
      current.some((edge) => edge.source === id && edge.target === outputId)
        ? current
        : [...current, { id: `${id}-result`, source: id, target: outputId }],
    )
    timers.current.push(
      setTimeout(() => {
        setNodes((current) =>
          current.map((item) => {
            if (item.id === id) return { ...item, data: { ...item.data, status: 'complete' } }
            if (item.id === outputId)
              return {
                ...item,
                data: {
                  ...item.data,
                  status: 'complete',
                  src: `${import.meta.env.BASE_URL}images/stage-lighting.jpg`,
                },
              }
            return item
          }),
        )
      }, 2400),
    )
  }

  return (
    <GenerativeCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={(connection) => setEdges((current) => addEdge(connection, current))}
      onReconnectStart={() => {
        reconnected.current = false
      }}
      onReconnect={(edge, connection) => {
        reconnected.current = true
        setEdges((current) => reconnectEdge(edge, connection, current))
      }}
      onReconnectEnd={(_, edge) => {
        if (!reconnected.current)
          setEdges((current) => current.filter((item) => item.id !== edge.id))
      }}
      isValidConnection={validConnection}
      onGenerate={generate}
      onPromptChange={(id, prompt) =>
        setNodes((current) =>
          current.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, prompt } } : node,
          ),
        )
      }
      onAddNode={(kind, position, src) =>
        setNodes((current) => [
          ...current.map((node) => ({ ...node, selected: false })),
          {
            id: crypto.randomUUID(),
            type: 'imageUi',
            selected: true,
            position: position ?? { x: 0, y: 400 },
            data: {
              kind,
              title: kind === 'note' ? 'Note' : kind === 'reference' ? 'Reference' : 'Generation',
              src,
              prompt: kind === 'note' ? 'Adjust lighting and composition.' : '',
              status: 'idle',
              model: 'GPT Image 2',
            },
          },
        ])
      }
    />
  )
}
