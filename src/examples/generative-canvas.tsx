import { useNodesState, useEdgesState, addEdge, type Edge } from '@xyflow/react'
import { GenerativeCanvas, type CanvasNode } from '../components/image-ui/generative-canvas'

const initialNodes: CanvasNode[] = [
  {
    id: 'reference',
    type: 'imageUi',
    position: { x: 0, y: 0 },
    data: {
      kind: 'reference',
      title: 'Reference',
      src: `${import.meta.env.BASE_URL}images/dunes.jpg`,
    },
  },
  {
    id: 'generation',
    type: 'imageUi',
    position: { x: 320, y: 0 },
    data: { kind: 'generation', title: 'Generation', prompt: 'A quiet desert', status: 'idle' },
  },
]

export default function Example() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  return (
    <GenerativeCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={(connection) => setEdges((all) => addEdge(connection, all))}
      onPromptChange={(id, prompt) =>
        setNodes((all) =>
          all.map((node) => (node.id === id ? { ...node, data: { ...node.data, prompt } } : node)),
        )
      }
    />
  )
}
