import { useState } from 'react'
import { addEdge, useNodesState, useEdgesState, type Edge, type Connection } from '@xyflow/react'
import { GenerativeCanvas, type CanvasNode } from '../components/image-ui/generative-canvas'
import { validateConnection } from './canvas-rules'

const initial: CanvasNode[] = [
  {
    id: 'reference',
    type: 'imageUi',
    position: { x: 0, y: 0 },
    data: {
      kind: 'reference',
      title: 'Reference',
      src: `${import.meta.env.BASE_URL}images/optimized/dunes-480.webp`,
    },
  },
  {
    id: 'generation',
    type: 'imageUi',
    position: { x: 310, y: 0 },
    data: { kind: 'generation', title: 'Generation', prompt: 'Warm desert light', status: 'idle' },
  },
  {
    id: 'output',
    type: 'imageUi',
    position: { x: 620, y: 80 },
    data: { kind: 'output', title: 'Output' },
  },
]
export default function CanvasConnections() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initial)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [message, setMessage] = useState(
    'Connect a reference to generation, then generation to output.',
  )
  function connect(connection: Connection) {
    const error = validateConnection(connection, nodes, edges)
    if (error) {
      setMessage(error)
      return
    }
    setEdges((all) => addEdge(connection, all))
    setMessage(`Connected ${connection.source} to ${connection.target}.`)
  }
  return (
    <div className="workflow-demo">
      <GenerativeCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        isValidConnection={(connection) => !validateConnection(connection, nodes, edges)}
        onConnect={connect}
        onPromptChange={(id, prompt) =>
          setNodes((all) =>
            all.map((node) =>
              node.id === id ? { ...node, data: { ...node.data, prompt } } : node,
            ),
          )
        }
      />
      <div className="example-actions">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            connect({
              source: 'reference',
              target: 'generation',
              sourceHandle: null,
              targetHandle: null,
            })
          }
        >
          Connect reference
        </button>
        <button
          type="button"
          className="doc-button"
          onClick={() => {
            setEdges([])
            setMessage('Connections cleared.')
          }}
        >
          Reset connections
        </button>
      </div>
      <p role="status">{message}</p>
    </div>
  )
}
