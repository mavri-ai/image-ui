'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  type XYPosition,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useNodes,
  useNodesInitialized,
  useEdges,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowProps,
} from '@xyflow/react'
import {
  ArrowUp,
  GripVertical,
  Image,
  ImagePlus,
  Link2Off,
  Maximize,
  Plus,
  StickyNote,
  Trash2,
  X,
  WandSparkles,
} from 'lucide-react'
import { GenerationCard } from './generation-card'
import { Button, IconButton, RollingValue } from './primitives'
import type { GenerationStatus } from './types'
import '@xyflow/react/dist/style.css'

export type CanvasNode = Node<
  {
    kind: 'reference' | 'generation' | 'output' | 'note'
    title: string
    src?: string
    prompt?: string
    status?: GenerationStatus
    model?: string
  },
  'imageUi'
>

interface CanvasActions {
  onGenerate?: (nodeId: string) => void
  onPromptChange?: (nodeId: string, prompt: string) => void
}

const CanvasActionContext = createContext<CanvasActions>({})

function ImageUiNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const actions = useContext(CanvasActionContext)
  const flow = useReactFlow()
  const isGeneration = data.kind === 'generation'
  const nodes = useNodes<CanvasNode>()
  const edges = useEdges()
  const sources = edges
    .filter((edge) => edge.target === id)
    .map((edge) => nodes.find((node) => node.id === edge.source))
    .filter((node) => node?.data.src || node?.data.kind === 'note')
  const noteCount = sources.filter((node) => node?.data.kind === 'note').length
  const imageCount = sources.length - noteCount
  const sourceSummary = [
    imageCount ? `${imageCount} ${imageCount === 1 ? 'reference' : 'references'}` : '',
    noteCount ? `${noteCount} ${noteCount === 1 ? 'note' : 'notes'}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
  const connected = edges.filter((edge) => edge.source === id || edge.target === id)
  const heading = (
    <div className="iu-canvas-node-heading" title="Drag to move">
      <GripVertical size={13} />
      {data.kind === 'note' ? <StickyNote size={13} /> : <Image size={13} />}
      {data.title}
      <div className="iu-canvas-node-tools nodrag">
        {connected.length ? (
          <IconButton
            label={`Detach ${data.title}`}
            onClick={() =>
              void flow.deleteElements({ edges: connected.map((edge) => ({ id: edge.id })) })
            }
          >
            <Link2Off size={12} />
          </IconButton>
        ) : null}
        <IconButton
          label={`Delete ${data.title}`}
          onClick={() => void flow.deleteElements({ nodes: [{ id }] })}
        >
          <Trash2 size={12} />
        </IconButton>
      </div>
    </div>
  )
  const busy = data.status === 'generating' || data.status === 'queued'
  return (
    <div
      data-kind={data.kind}
      className={`iu-canvas-node ${selected ? 'is-selected' : ''}`}
      onDragStart={(event) => event.preventDefault()}
    >
      {data.kind !== 'reference' && data.kind !== 'note' ? (
        <Handle
          isConnectableEnd={isGeneration}
          type="target"
          position={Position.Left}
          role="img"
          aria-label={`Input connection for ${data.title}`}
        />
      ) : null}
      {isGeneration ? (
        <>
          {heading}
          {sources.length ? (
            <div className="iu-canvas-sources">
              {sources.map((node) =>
                node ? (
                  <div key={node.id} title={node.data.title}>
                    {node.data.kind === 'note' ? (
                      <StickyNote size={14} />
                    ) : (
                      <img src={node.data.src} alt={node.data.title} draggable={false} />
                    )}
                    <span>
                      {node.data.kind === 'note'
                        ? node.data.prompt || 'Empty note'
                        : node.data.title}
                    </span>
                    <IconButton
                      className="nodrag"
                      label={`Disconnect ${node.data.title}`}
                      onClick={() =>
                        void flow.deleteElements({
                          edges: edges
                            .filter((edge) => edge.source === node.id && edge.target === id)
                            .map((edge) => ({ id: edge.id })),
                        })
                      }
                    >
                      <X size={11} />
                    </IconButton>
                  </div>
                ) : null,
              )}
              <span>
                <RollingValue value={`${sourceSummary} connected`} />
              </span>
            </div>
          ) : null}
          <textarea
            aria-label={`${data.title} prompt`}
            className="nodrag nowheel"
            value={data.prompt ?? ''}
            onChange={(event) => actions.onPromptChange?.(id, event.target.value)}
            placeholder="Describe an image…"
          />
          <div className="iu-canvas-run-row">
            <span>{data.model ?? 'Image model'}</span>
            {actions.onGenerate ? (
              <IconButton
                label="Generate image"
                className="iu-submit nodrag"
                disabled={
                  busy ||
                  !(
                    data.prompt?.trim() ||
                    sources.some((node) => node?.data.kind === 'note' && node.data.prompt?.trim())
                  )
                }
                onClick={() => actions.onGenerate?.(id)}
              >
                <ArrowUp size={16} />
              </IconButton>
            ) : null}
          </div>
        </>
      ) : data.kind === 'note' ? (
        <>
          {heading}
          <textarea
            aria-label={`${data.title} text`}
            className="nodrag nowheel iu-canvas-note"
            value={data.prompt ?? ''}
            onChange={(event) => actions.onPromptChange?.(id, event.target.value)}
          />
        </>
      ) : (
        <>
          {heading}
          {data.kind === 'output' ? (
            <div className="iu-canvas-result">
              <GenerationCard
                status={data.status ?? 'generating'}
                title={data.title}
                src={data.src}
                alt={data.prompt}
              />
            </div>
          ) : data.src ? (
            <img
              className="iu-canvas-node-image"
              src={data.src}
              alt={data.prompt ?? data.title}
              draggable={false}
            />
          ) : (
            <div className="iu-canvas-awaiting">
              <WandSparkles size={23} />
              <span>No output yet</span>
              <small>Run the connected generation</small>
            </div>
          )}
          <div className="iu-canvas-node-caption">
            {data.kind === 'reference'
              ? 'Reference image'
              : busy
                ? 'Your result will appear here.'
                : 'Connect to use this output as a reference.'}
          </div>
        </>
      )}
      {
        <Handle
          isConnectableStart={!isGeneration && !busy}
          type="source"
          position={Position.Right}
          role="img"
          aria-label={`Output connection for ${data.title}`}
        />
      }
    </div>
  )
}

function KeepNodesVisible() {
  const nodes = useNodes()
  const initialized = useNodesInitialized()
  const count = useRef(nodes.length)
  const flow = useReactFlow()
  useEffect(() => {
    if (initialized && nodes.length > count.current)
      void flow.fitView({ padding: 0.22, duration: 300, maxZoom: 1.1 })
    if (initialized) count.current = nodes.length
  }, [initialized, nodes.length, flow])
  return null
}
const nodeTypes = { imageUi: ImageUiNode }
function RemovableEdge(props: EdgeProps) {
  const [path, x, y] = getBezierPath(props)
  const flow = useReactFlow()
  const [hovered, setHovered] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(leaveTimer.current), [])
  function showRemove() {
    clearTimeout(leaveTimer.current)
    setHovered(true)
  }
  function hideRemove() {
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setHovered(false), 120)
  }
  return (
    <>
      <g onPointerEnter={showRemove} onPointerLeave={hideRemove}>
        <BaseEdge id={props.id} path={path} style={props.style} interactionWidth={28} />
      </g>
      {props.selected || hovered ? (
        <EdgeLabelRenderer>
          <button
            className="iu-edge-remove nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
            aria-label="Disconnect nodes"
            onPointerEnter={showRemove}
            onPointerLeave={hideRemove}
            onFocus={showRemove}
            onBlur={hideRemove}
            onClick={() => void flow.deleteElements({ edges: [{ id: props.id }] })}
          >
            <X size={12} />
          </button>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
const edgeTypes = { removable: RemovableEdge }
type AddCanvasNode = (kind: CanvasNode['data']['kind'], position?: XYPosition, src?: string) => void

function CanvasToolbar({
  onAddNode,
  children,
}: {
  onAddNode?: AddCanvasNode
  children?: ReactNode
}) {
  const flow = useReactFlow()
  const toolbar = useRef<HTMLDivElement>(null)
  const upload = useRef<HTMLInputElement>(null)
  function centerPosition() {
    const bounds = toolbar.current!.closest('.iu-generative-canvas')!.getBoundingClientRect()
    const position = flow.screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    })
    position.x -= 130
    position.y -= 80
    while (
      flow
        .getNodes()
        .some(
          (node) =>
            Math.abs(node.position.x - position.x) < 280 &&
            Math.abs(node.position.y - position.y) < 240,
        )
    ) {
      position.x += 36
      position.y += 36
    }
    return position
  }
  return (
    <>
      <Panel position="top-left">
        <span className="iu-canvas-label">
          <span />
          Drag nodes to move · Connect dots to link
        </span>
      </Panel>
      <Panel position="bottom-center">
        <div ref={toolbar} className="iu-canvas-toolbar">
          {onAddNode ? (
            <>
              <Button variant="ghost" onClick={() => onAddNode('generation', centerPosition())}>
                <Plus size={14} />
                Generation
              </Button>
              <input
                ref={upload}
                className="iu-visually-hidden"
                type="file"
                accept="image/*"
                aria-label="Upload canvas reference"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file || !file.type.startsWith('image/')) return
                  const position = centerPosition()
                  const reader = new FileReader()
                  reader.onload = () => onAddNode('reference', position, String(reader.result))
                  reader.readAsDataURL(file)
                  event.target.value = ''
                }}
              />
              <IconButton label="Add reference image" onClick={() => upload.current?.click()}>
                <ImagePlus size={15} />
              </IconButton>
              <span className="iu-toolbar-divider" />
              <IconButton label="Add note node" onClick={() => onAddNode('note', centerPosition())}>
                <StickyNote size={15} />
              </IconButton>
            </>
          ) : null}
          <IconButton
            label="Fit canvas to nodes"
            onClick={() => void flow.fitView({ padding: 0.2, duration: 300 })}
          >
            <Maximize size={15} />
          </IconButton>
          {children}
        </div>
      </Panel>
    </>
  )
}

export interface GenerativeCanvasProps
  extends Omit<ReactFlowProps<CanvasNode, Edge>, 'nodeTypes' | 'children'>, CanvasActions {
  onAddNode?: AddCanvasNode
}

export function GenerativeCanvas({
  onGenerate,
  onPromptChange,
  onAddNode,
  ...props
}: GenerativeCanvasProps) {
  return (
    <div className="iu-generative-canvas">
      <ReactFlowProvider>
        <CanvasActionContext.Provider value={{ onGenerate, onPromptChange }}>
          <ReactFlow<CanvasNode, Edge>
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeDragThreshold={4}
            connectionRadius={24}
            autoPanOnNodeDrag
            snapToGrid
            snapGrid={[16, 16]}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.25}
            maxZoom={1.6}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{
              type: 'removable',
              style: { stroke: 'var(--iu-connection)', strokeWidth: 1.5 },
            }}
            {...props}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--iu-dot)" />
            <Controls position="bottom-left" showInteractive={false} />
            <CanvasToolbar onAddNode={onAddNode} />
            <KeepNodesVisible />
          </ReactFlow>
        </CanvasActionContext.Provider>
      </ReactFlowProvider>
    </div>
  )
}
