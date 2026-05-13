import React, { useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  Panel,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  getBezierPath,
  useInternalNode,
  EdgeLabelRenderer
} from '@xyflow/react';
import type { Node, Edge, EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force';

const nodeWidth = 200;
const nodeHeight = 50;

const categoryColors: Record<string, { bg: string, text: string }> = {
    trigger: { bg: "#2c3e50", text: "white" }, // Dark Slate for trigger paths
    skill: { bg: "#e67e22", text: "white" },   // Orange for skills
    context: { bg: "#2980b9", text: "white" }, // Blue for docs context
    docs: { bg: "#3498db", text: "white" },    // Fallback
};

const CustomNode = ({ data }: { data: any }) => {
    const cat = data.category || 'docs';
    const colors = categoryColors[cat] || categoryColors.docs;
    
    return (
        <div style={{
            background: colors.bg,
            color: colors.text,
            padding: '10px',
            borderRadius: '5px',
            border: data.isHighlighted ? '2px solid #f1c40f' : '1px solid #333',
            width: `${nodeWidth}px`,
            textAlign: 'center',
            fontSize: '12px',
            wordWrap: 'break-word',
            boxShadow: data.isHighlighted ? '0 0 20px 5px rgba(241, 196, 15, 0.8)' : '0 4px 6px rgba(0,0,0,0.1)',
            filter: data.isHighlighted ? 'brightness(1.2)' : 'brightness(1)',
            transition: 'all 0.3s ease-in-out',
            transform: data.isHighlighted ? 'scale(1.05)' : 'scale(1)',
            zIndex: data.isHighlighted ? 1000 : 1
        }}>
            <Handle type="target" position={Position.Top} id="t-top" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Bottom} id="t-bot" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Left} id="t-left" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Right} id="t-right" style={{ visibility: 'hidden' }} />
            
            <Handle type="source" position={Position.Top} id="s-top" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} id="s-bot" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Left} id="s-left" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Right} id="s-right" style={{ visibility: 'hidden' }} />
            {data.label}
        </div>
    );
};

const SmartEdge = (props: EdgeProps) => {
  const sourceNode = useInternalNode(props.source);
  const targetNode = useInternalNode(props.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const w1 = sourceNode.measured?.width ?? 200;
  const h1 = sourceNode.measured?.height ?? 50;
  const w2 = targetNode.measured?.width ?? 200;
  const h2 = targetNode.measured?.height ?? 50;

  const sxCenter = (sourceNode.internals?.positionAbsolute?.x ?? sourceNode.position.x) + w1 / 2;
  const syCenter = (sourceNode.internals?.positionAbsolute?.y ?? sourceNode.position.y) + h1 / 2;
  const txCenter = (targetNode.internals?.positionAbsolute?.x ?? targetNode.position.x) + w2 / 2;
  const tyCenter = (targetNode.internals?.positionAbsolute?.y ?? targetNode.position.y) + h2 / 2;

  const dx = txCenter - sxCenter;
  const dy = tyCenter - syCenter;

  let sourcePos, targetPos;
  if (Math.abs(dx) > Math.abs(dy)) {
      sourcePos = dx > 0 ? Position.Right : Position.Left;
      targetPos = dx > 0 ? Position.Left : Position.Right;
  } else {
      sourcePos = dy > 0 ? Position.Bottom : Position.Top;
      targetPos = dy > 0 ? Position.Top : Position.Bottom;
  }

  const sX = sxCenter + (sourcePos === Position.Right ? w1/2 : sourcePos === Position.Left ? -w1/2 : 0);
  const sY = syCenter + (sourcePos === Position.Bottom ? h1/2 : sourcePos === Position.Top ? -h1/2 : 0);
  const tX = txCenter + (targetPos === Position.Right ? w2/2 : targetPos === Position.Left ? -w2/2 : 0);
  const tY = tyCenter + (targetPos === Position.Bottom ? h2/2 : targetPos === Position.Top ? -h2/2 : 0);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sX,
    sourceY: sY,
    sourcePosition: sourcePos,
    targetX: tX,
    targetY: tY,
    targetPosition: targetPos,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={props.markerEnd}
        style={props.style}
      />
      {props.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#333',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 500,
              pointerEvents: 'all',
              zIndex: 20
            }}
            className="nodrag nopan"
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { smart: SmartEdge };

interface CoretextGraphProps {
    nodes: Node[];
    edges: Edge[];
    availableSessions: string[];
    selectedSessions: string[];
    onToggleSession: (session: string) => void;
    availableGraphs: string[];
    selectedGraph: string;
    onSelectGraph: (graph: string) => void;
}

export const CoretextGraph: React.FC<CoretextGraphProps> = ({ 
    nodes: initialNodes, 
    edges: initialEdges,
    availableSessions,
    selectedSessions,
    onToggleSession,
    availableGraphs,
    selectedGraph,
    onSelectGraph
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
      if (initialNodes.length === 0) return;
      
      const simNodes = initialNodes.map(n => ({ ...n, id: n.id, category: n.data.category }));
      const simEdges = initialEdges.map(e => ({ ...e, source: e.source, target: e.target }));

      const simulation = forceSimulation(simNodes as any)
        .force('charge', forceManyBody().strength(-1500))
        .force('collide', forceCollide().radius(150).iterations(3))
        .force('link', forceLink(simEdges as any).id((d: any) => d.id).distance(300))
        .force('y', forceY((d: any) => {
            if (d.category === 'trigger') return -300;
            if (d.category === 'skill') return 300;
            return 0; // context
        }).strength(0.8))
        .force('x', forceX(0).strength(0.1))
        .stop();

      for (let i = 0; i < 500; ++i) simulation.tick();

      const layoutedNodes = simNodes.map((node: any) => ({
          ...initialNodes.find(n => n.id === node.id),
          type: 'custom',
          position: {
              x: node.x - nodeWidth / 2,
              y: node.y - nodeHeight / 2,
          }
      })) as Node[];

      const layoutedEdges = initialEdges.map(e => ({
          ...e,
          type: 'smart',
          markerEnd: e.markerEnd ? (typeof e.markerEnd === 'object' ? { ...e.markerEnd, type: MarkerType.ArrowClosed } : { type: MarkerType.ArrowClosed }) : undefined
      }));

      const isManualTrigger = layoutTrigger !== lastTriggerRef.current;
      lastTriggerRef.current = layoutTrigger;

      setNodes(prev => {
          if (prev.length === 0 || isManualTrigger) {
              return layoutedNodes;
          }
          
          const prevMap = new Map(prev.map(n => [n.id, n]));
          return layoutedNodes.map(n => {
              const existing = prevMap.get(n.id);
              if (existing) {
                  return { ...n, position: existing.position }; 
              }
              return n;
          });
      });
      setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, layoutTrigger, setNodes, setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1e1e' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap />
        <Panel position="top-left" style={{ background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', color: '#333', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{margin: 0}}>Coretext State Graph</h3>
            <button 
                onClick={() => setLayoutTrigger(prev => prev + 1)}
                style={{ padding: '8px 12px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
                Reset & Re-layout
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <h4 style={{margin: '10px 0 0 0'}}>Graph Source</h4>
                {availableGraphs.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#666' }}>No graphs found</div>
                ) : (
                    <select 
                        value={selectedGraph} 
                        onChange={(e) => onSelectGraph(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', maxWidth: '180px' }}
                    >
                        {availableGraphs.map(graph => (
                            <option key={graph} value={graph}>{graph}</option>
                        ))}
                    </select>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <h4 style={{margin: 0}}>Sessions</h4>
                <button 
                    onClick={async () => {
                        try {
                            const res = await fetch('http://localhost:3001/api/ingest', { method: 'POST' });
                            const data = await res.json();
                            alert(data.message);
                        } catch (e) {
                            alert('Error ingesting logs');
                        }
                    }}
                    style={{ padding: '4px 8px', cursor: 'pointer', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
                >
                    Ingest Logs
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                {availableSessions.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#666' }}>No sessions found</div>
                ) : (
                    availableSessions.map(session => (
                        <label key={session} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedSessions.includes(session)} 
                                onChange={() => onToggleSession(session)} 
                            />
                            {session.replace('session_', '').replace('.jsonl', '')}
                        </label>
                    ))
                )}
                {selectedSessions.length === 0 && availableSessions.length > 0 && (
                    <div style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>Showing latest session</div>
                )}
            </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};