import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  getBezierPath,
  useInternalNode,
  EdgeLabelRenderer,
  useReactFlow
} from '@xyflow/react';
import type { Node, Edge, EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force';
import type { SessionOption } from '../App';

const nodeWidth = 200;
const nodeHeight = 50;

const categoryStyles: Record<string, { bg: string, border: string, text: string }> = {
    trigger: {
        bg: 'rgba(149, 165, 166, 0.05)',
        border: 'rgba(149, 165, 166, 0.25)',
        text: '#95a5a6'
    },
    knowledge: {
        bg: 'rgba(52, 152, 219, 0.08)',
        border: 'rgba(52, 152, 219, 0.3)',
        text: '#3498db'
    }
};

const ProjectIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

const ScopeIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
);

const SessionIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TriggerIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

export const ScrollingLabel = ({ label, isHovered = false }: { label: string, isHovered?: boolean }) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [scrollDist, setScrollDist] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (container && text) {
            const containerWidth = container.clientWidth;
            const textWidth = text.scrollWidth;
            if (textWidth > containerWidth) {
                setScrollDist(textWidth - containerWidth);
            } else {
                setScrollDist(0);
            }
        }
    }, [label]);

    const duration = 1.5 + scrollDist * 0.015;

    return (
        <span 
            ref={containerRef}
            style={{ 
                overflow: 'hidden', 
                whiteSpace: 'nowrap',
                flexGrow: 1,
                textAlign: 'left',
                display: 'block',
                position: 'relative',
                WebkitMaskImage: scrollDist > 0 && !isHovered 
                    ? 'linear-gradient(to right, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)' 
                    : 'none',
                maskImage: scrollDist > 0 && !isHovered 
                    ? 'linear-gradient(to right, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)' 
                    : 'none',
            }}
        >
            <span
                ref={textRef}
                style={{
                    display: 'inline-block',
                    transition: isHovered && scrollDist > 0 
                        ? `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1)` 
                        : 'transform 0.5s ease-out',
                    transform: isHovered && scrollDist > 0 
                        ? `translateX(-${scrollDist + 10}px)` 
                        : 'translateX(0)',
                }}
            >
                {label}
            </span>
        </span>
    );
};

const CustomNode = ({ data }: { data: any }) => {
    const [isNodeHovered, setIsNodeHovered] = useState(false);
    const cat = data.category || 'knowledge';
    const styles = categoryStyles[cat] || categoryStyles.knowledge;
    
    const getIcon = () => {
        switch (cat) {
            case 'trigger': return <TriggerIcon />;
            default: return <ScopeIcon />;
        }
    };

    return (
        <div 
            onMouseEnter={() => setIsNodeHovered(true)}
            onMouseLeave={() => setIsNodeHovered(false)}
            style={{
                background: 'rgba(23, 23, 27, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: data.isSelected ? '#fff' : styles.text,
                padding: '12px 20px',
                borderRadius: '24px',
                border: data.isSelected
                    ? '2px solid #3498db'
                    : data.isHighlighted 
                        ? '2px solid #f1c40f' 
                        : `1px solid ${styles.border}`,
                width: `${nodeWidth}px`,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                boxSizing: 'border-box',
                gap: '12px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                wordWrap: 'break-word',
                boxShadow: data.isSelected
                    ? '0 0 20px 5px rgba(52, 152, 219, 0.5)'
                    : data.isHighlighted 
                        ? '0 0 20px 5px rgba(241, 196, 15, 0.4)' 
                        : '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
                filter: (data.isSelected || data.isHighlighted) ? 'brightness(1.2)' : 'brightness(1)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transform: (data.isSelected || data.isHighlighted) ? 'scale(1.05)' : 'scale(1)',
                zIndex: (data.isSelected || data.isHighlighted) ? 1000 : 1
            }}
        >
            <Handle type="target" position={Position.Top} id="t-top" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Bottom} id="t-bot" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Left} id="t-left" style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Right} id="t-right" style={{ visibility: 'hidden' }} />
            
            <Handle type="source" position={Position.Top} id="s-top" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} id="s-bot" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Left} id="s-left" style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Right} id="s-right" style={{ visibility: 'hidden' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: styles.text }}>
                    {getIcon()}
                </span>
                <ScrollingLabel label={data.label} isHovered={isNodeHovered} />
            </div>
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

import { ArchitectureTree } from './ArchitectureTree';

// Helper to parse bold, code, and link markdown syntax inline
function parseInlineMarkdown(text: string, onSelectNote?: (path: string | null) => void): React.ReactNode[] {
    let keyIndex = 0;

    const parseSegment = (str: string): React.ReactNode[] => {
        if (!str) return [];

        const codeMatch = str.match(/`([^`]+)`/);
        const boldMatch = str.match(/\*\*([^*]+)\*\*/);
        const linkMatch = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
        const wikilinkMatch = str.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);

        let earliest: { index: number, type: 'code' | 'bold' | 'link' | 'wikilink', match: RegExpMatchArray } | null = null;

        if (codeMatch && codeMatch.index !== undefined) {
            earliest = { index: codeMatch.index, type: 'code', match: codeMatch };
        }
        if (boldMatch && boldMatch.index !== undefined && (earliest === null || boldMatch.index < earliest.index)) {
            earliest = { index: boldMatch.index, type: 'bold', match: boldMatch };
        }
        if (linkMatch && linkMatch.index !== undefined && (earliest === null || linkMatch.index < earliest.index)) {
            earliest = { index: linkMatch.index, type: 'link', match: linkMatch };
        }
        if (wikilinkMatch && wikilinkMatch.index !== undefined && (earliest === null || wikilinkMatch.index < earliest.index)) {
            earliest = { index: wikilinkMatch.index, type: 'wikilink', match: wikilinkMatch };
        }

        if (!earliest) {
            return [str];
        }

        const result: React.ReactNode[] = [];
        if (earliest.index > 0) {
            result.push(str.substring(0, earliest.index));
        }

        const matchedText = earliest.match[0];
        const innerText = earliest.match[1];

        if (earliest.type === 'code') {
            result.push(
                <code key={keyIndex++} className="markdown-inline-code">
                    {innerText}
                </code>
            );
        } else if (earliest.type === 'bold') {
            result.push(<strong key={keyIndex++} className="markdown-bold">{innerText}</strong>);
        } else if (earliest.type === 'link') {
            const url = earliest.match[2];
            result.push(
                <a key={keyIndex++} href={url} target="_blank" rel="noopener noreferrer" className="markdown-link">
                    {innerText}
                </a>
            );
        } else if (earliest.type === 'wikilink') {
            const target = earliest.match[1].trim();
            const displayText = earliest.match[2] ? earliest.match[2].trim() : target;
            result.push(
                <span 
                    key={keyIndex++} 
                    onClick={() => onSelectNote && onSelectNote(target)} 
                    className="markdown-wikilink"
                    style={{ 
                        color: '#3498db', 
                        textDecoration: 'underline', 
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    {displayText}
                </span>
            );
        }

        const remaining = str.substring(earliest.index + matchedText.length);
        result.push(...parseSegment(remaining));
        return result;
    };

    return parseSegment(text);
}

// Custom Markdown parser component for rendering note previews
const MarkdownRenderer: React.FC<{ markdown: string, onSelectNote?: (path: string | null) => void }> = ({ markdown, onSelectNote }) => {
    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const elements = lines.map((line, idx) => {
        // Code Block
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                inCodeBlock = false;
                const code = codeBlockLines.join('\n');
                codeBlockLines = [];
                return (
                    <pre key={idx} className="markdown-code-block">
                        <code>{code}</code>
                    </pre>
                );
            } else {
                inCodeBlock = true;
                return null;
            }
        }

        if (inCodeBlock) {
            codeBlockLines.push(line);
            return null;
        }

        // Headings
        if (line.startsWith('# ')) {
            return <h1 key={idx} className="markdown-h1">{parseInlineMarkdown(line.substring(2), onSelectNote)}</h1>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={idx} className="markdown-h2">{parseInlineMarkdown(line.substring(3), onSelectNote)}</h2>;
        }
        if (line.startsWith('### ')) {
            return <h3 key={idx} className="markdown-h3">{parseInlineMarkdown(line.substring(4), onSelectNote)}</h3>;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            let content = line.substring(2);
            let calloutClass = "";
            if (content.startsWith('[!NOTE]')) {
                content = content.replace('[!NOTE]', '').trim();
                calloutClass = "note";
            } else if (content.startsWith('[!TIP]')) {
                content = content.replace('[!TIP]', '').trim();
                calloutClass = "tip";
            } else if (content.startsWith('[!IMPORTANT]')) {
                content = content.replace('[!IMPORTANT]', '').trim();
                calloutClass = "important";
            } else if (content.startsWith('[!WARNING]')) {
                content = content.replace('[!WARNING]', '').trim();
                calloutClass = "warning";
            }
            return (
                <blockquote key={idx} className={`markdown-blockquote ${calloutClass}`}>
                    {parseInlineMarkdown(content, onSelectNote)}
                </blockquote>
            );
        }

        // Checklist or Bullet lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            const isTodo = content.startsWith('[ ]') || content.startsWith('[x]') || content.startsWith('[/]');
            if (isTodo) {
                const checked = content.startsWith('[x]');
                const inProgress = content.startsWith('[/]');
                const text = content.substring(3).trim();
                return (
                    <div key={idx} className="markdown-todo-item">
                        <input type="checkbox" checked={checked} readOnly className={inProgress ? 'inprogress' : ''} />
                        <span className={`markdown-todo-text ${checked ? 'completed' : ''} ${inProgress ? 'inprogress-text' : ''}`}>
                            {parseInlineMarkdown(text, onSelectNote)}
                        </span>
                    </div>
                );
            }
            return (
                <li key={idx} className="markdown-list-item">
                    {parseInlineMarkdown(content, onSelectNote)}
                </li>
            );
        }

        if (line.trim() === '') {
            return <div key={idx} className="markdown-paragraph-spacer" />;
        }

        return <p key={idx} className="markdown-paragraph">{parseInlineMarkdown(line, onSelectNote)}</p>;
    }).filter(el => el !== null);

    return <div className="markdown-body">{elements}</div>;
};

interface CoretextGraphProps {
    nodes: Node[];
    edges: Edge[];
    availableSessions: SessionOption[];
    selectedSessions: string[];
    onToggleSession: (session: string) => void;
    highlightedNodes: Set<string>;
    highlightedActions: Record<string, 'read' | 'write'>;
    activeTab: 'graph' | 'tree';
    onChangeTab: (tab: 'graph' | 'tree') => void;
    treeData: any;
    selectedNotePath: string | null;
    selectedNoteContent: string | null;
    isNoteLoading: boolean;
    isRightPanelOpen: boolean;
    onSelectNote: (path: string | null) => void;
    onChangeRightPanelOpen: (open: boolean) => void;
}

export const CoretextGraph: React.FC<CoretextGraphProps> = ({ 
    nodes: initialNodes, 
    edges: initialEdges,
    availableSessions,
    selectedSessions,
    onToggleSession,
    highlightedNodes,
    highlightedActions,
    activeTab,
    onChangeTab,
    treeData,
    selectedNotePath,
    selectedNoteContent,
    isNoteLoading,
    isRightPanelOpen,
    onSelectNote,
    onChangeRightPanelOpen
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const searchableNodes = useMemo(() => {
    const itemsMap = new Map<string, { id: string, name: string, type: string, path: string }>();
    
    // Helper to traverse treeData
    const traverse = (node: any) => {
        if (!node) return;
        const path = node.path || node.absolutePath || node.id;
        if (path && (node.type !== 'trigger' || node.path)) {
            const cleanName = node.name || path.split('/').pop() || path;
            itemsMap.set(path, {
                id: node.id,
                name: cleanName,
                type: node.type || 'knowledge',
                path: path
            });
        }
        if (node.children) {
            node.children.forEach((child: any) => traverse(child));
        }
    };
    
    traverse(treeData);
    
    // Merge graph nodes if not already present
    initialNodes.forEach(node => {
        const path = node.id;
        if (path && !itemsMap.has(path)) {
            const cleanName = (node.data?.label as string) || path.split('/').pop() || path;
            itemsMap.set(path, {
                id: node.id,
                name: cleanName,
                type: (node.data?.category as string) || 'knowledge',
                path: path
            });
        }
    });
    
    return Array.from(itemsMap.values());
  }, [treeData, initialNodes]);

  const filteredNodes = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const query = searchQuery.toLowerCase();
      return searchableNodes.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.path.toLowerCase().includes(query)
      );
  }, [searchQuery, searchableNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTreeFullyExpanded, setIsTreeFullyExpanded] = useState(false);
  const lastTriggerRef = useRef(0);

  const { setCenter, getNode, getZoom } = useReactFlow();

  // Recenter and zoom to a node in Graph View when selection changes
  useEffect(() => {
      if (activeTab !== 'graph' || !selectedNotePath) return;

      const node = getNode(selectedNotePath);
      if (!node) return;

      const x = node.position.x + (node.measured?.width ?? 200) / 2;
      const y = node.position.y + (node.measured?.height ?? 50) / 2;

      // Find the screen dimensions of the React Flow viewport
      const viewportElement = document.querySelector('.react-flow') as HTMLElement;
      if (!viewportElement) {
          setCenter(x, y, { zoom: 1.1, duration: 800 });
          return;
      }
      
      const rect = viewportElement.getBoundingClientRect();
      const visibleLeft = isCollapsed ? 60 : 340;
      const visibleRight = isRightPanelOpen ? rect.width - 490 : rect.width - 40;
      
      const visibleWidth = visibleRight - visibleLeft;
      const targetScreenX = visibleLeft + visibleWidth / 2;
      const screenCenterX = rect.width / 2;
      
      const shiftX = screenCenterX - targetScreenX;
      
      // Offset center coordinate in grid space
      const targetGridX = x + shiftX / 1.1;

      // Wait a small delay to align with drawer opening transitions
      const timer = setTimeout(() => {
          setCenter(targetGridX, y, { zoom: 1.1, duration: 800 });
      }, 100);

      return () => clearTimeout(timer);
  }, [selectedNotePath, activeTab, isCollapsed, isRightPanelOpen, getNode, setCenter]);

  const lastSelectedPathRef = useRef<string | null>(null);
  useEffect(() => {
      if (selectedNotePath) {
          lastSelectedPathRef.current = selectedNotePath;
      }
  }, [selectedNotePath]);

  // Recenter when panel collapses and no node is active, keeping scale/zoom
  useEffect(() => {
      if (activeTab !== 'graph' || selectedNotePath || !lastSelectedPathRef.current) return;

      const node = getNode(lastSelectedPathRef.current);
      if (!node) return;

      const x = node.position.x + (node.measured?.width ?? 200) / 2;
      const y = node.position.y + (node.measured?.height ?? 50) / 2;

      const viewportElement = document.querySelector('.react-flow') as HTMLElement;
      if (!viewportElement) return;
      
      const rect = viewportElement.getBoundingClientRect();
      const visibleLeft = isCollapsed ? 60 : 340;
      const visibleRight = isRightPanelOpen ? rect.width - 490 : rect.width - 40;
      
      const visibleWidth = visibleRight - visibleLeft;
      const targetScreenX = visibleLeft + visibleWidth / 2;
      const screenCenterX = rect.width / 2;
      
      const shiftX = screenCenterX - targetScreenX;
      
      const currentZoom = getZoom();
      const targetGridX = x + shiftX / currentZoom;

      const timer = setTimeout(() => {
          setCenter(targetGridX, y, { zoom: currentZoom, duration: 800 });
      }, 100);

      return () => clearTimeout(timer);
  }, [isRightPanelOpen, selectedNotePath, activeTab, isCollapsed, getNode, setCenter, getZoom]);

  // Derive a structural key so the force layout only runs when nodes or edges actually change ids
  const structuralKey = React.useMemo(() => {
      return JSON.stringify({
          n: initialNodes.map(n => n.id).sort(),
          e: initialEdges.map(e => e.id).sort()
      });
  }, [initialNodes, initialEdges]);

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
            return 300; // knowledge targets
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

      lastTriggerRef.current = layoutTrigger;

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
  }, [structuralKey, layoutTrigger, setNodes, setEdges]); // Rerun layout ONLY when structure changes

  // Synchronize highlights and other node data without re-running the physics layout
  useEffect(() => {
      if (initialNodes.length === 0) return;
      setNodes(prev => {
          if (prev.length === 0) return prev;
          
          let changed = false;
          const next = prev.map(n => {
              const initN = initialNodes.find(i => i.id === n.id);
              if (!initN) return n;
              if (JSON.stringify(n.data) !== JSON.stringify(initN.data)) {
                  changed = true;
                  return { ...n, data: initN.data };
              }
              return n;
          });
          
          return changed ? next : prev;
      });
  }, [initialNodes, setNodes]);

  const panelStyle: React.CSSProperties = {
      position: 'absolute',
      top: '10px',
      left: '10px',
      width: '300px',
      maxHeight: 'calc(100vh - 20px)',
      background: 'rgba(25, 25, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '16px',
      borderRadius: '12px',
      color: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      zIndex: 100,
      transform: isCollapsed ? 'translateX(calc(-100% - 10px))' : 'translateX(0)',
      transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const rightPanelStyle: React.CSSProperties = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '450px',
      maxHeight: 'calc(100vh - 20px)',
      background: 'rgba(25, 25, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '20px',
      borderRadius: '12px',
      color: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      zIndex: 100,
      transform: isRightPanelOpen ? 'translateX(0)' : 'translateX(calc(100% + 10px))',
      transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      height: 'calc(100vh - 20px)',
      boxSizing: 'border-box'
  };

  const renderPanelContent = () => (
      <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3498db' }}>
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'lowercase', color: '#fff' }}>coretext</h3>
              </div>
              <button 
                  onClick={() => setIsCollapsed(true)}
                  style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  title="Collapse sidebar"
              >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                  </svg>
              </button>
          </div>
          
          {/* Tab Switcher */}
          <div className="tab-switcher">
              <button 
                  className={activeTab === 'graph' ? 'active' : ''} 
                  onClick={() => onChangeTab('graph')}
              >
                  Graph View
              </button>
              <button 
                  className={activeTab === 'tree' ? 'active' : ''} 
                  onClick={() => onChangeTab('tree')}
              >
                  Tree View
              </button>
          </div>

          {activeTab === 'graph' && (
              <button 
                  onClick={() => setLayoutTrigger(prev => prev + 1)}
                  className="action-btn layout-btn"
              >
                  Reset & Re-layout
              </button>
          )}

          {activeTab === 'tree' && (
              <button 
                  onClick={() => setIsTreeFullyExpanded(prev => !prev)}
                  className="action-btn layout-btn"
              >
                  {isTreeFullyExpanded ? 'Collapse Tree' : 'Expand Tree'}
              </button>
          )}

          <button 
              onClick={() => onSelectNote('.coretext/coretext-graph-ui/README.md')}
              className="action-btn user-guide-btn"
              style={{ marginTop: '10px' }}
          >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              User Guide
          </button>


          <div className="sidebar-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 className="section-title">Sessions</h4>
              </div>
              <div className="sessions-list">
                  {availableSessions.length === 0 ? (
                      <div className="empty-text">No sessions found</div>
                  ) : (
                      availableSessions.map(session => (
                          <label key={session.name} className="session-item">
                              <input 
                                  type="checkbox" 
                                  checked={selectedSessions.includes(session.name)}
                                  onChange={() => onToggleSession(session.name)}
                              />
                              <span className="session-name-text">
                                  {session.label}
                              </span>
                          </label>
                      ))
                  )}
                  {selectedSessions.length === 0 && availableSessions.length > 0 && (
                      <div className="session-helper-text">Select sessions to highlight nodes</div>
                  )}
              </div>
          </div>
      </>
  );

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'radial-gradient(circle at 60% 40%, #1e1e24 0%, #0d0d0f 100%)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {activeTab === 'graph' ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          onNodeClick={(_event, node) => onSelectNote(node.id)}
          onPaneClick={() => onSelectNote(null)}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="rgba(255, 255, 255, 0.05)" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      ) : (
        <div style={{ flex: 1, height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
            <ArchitectureTree 
                treeData={treeData}
                highlightedNodes={highlightedNodes}
                highlightedActions={highlightedActions}
                isPanelCollapsed={isCollapsed}
                isRightPanelOpen={isRightPanelOpen}
                onSelectNode={(node: any) => {
                    if (node === null) {
                        onSelectNote(null);
                    } else {
                        onSelectNote(node.path || node.absolutePath);
                    }
                }}
                selectedNotePath={selectedNotePath}
                isTreeFullyExpanded={isTreeFullyExpanded}
                hasActiveSession={selectedSessions.length > 0}
            />
        </div>
      )}
      
      {/* Collapsed Sidebar Pill */}
      {isCollapsed && (
          <button 
              onClick={() => setIsCollapsed(false)} 
              style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  background: 'rgba(25, 25, 25, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                  zIndex: 101,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              title="Expand sidebar"
          >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3498db' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span style={{ textTransform: 'lowercase' }}>coretext</span>
          </button>
      )}

      {/* Persisted Sidebar Panel */}
      <div style={panelStyle} className="nodrag nopan">
          {renderPanelContent()}
      </div>

      {/* Persisted Right Markdown Detail Panel */}
      <div style={rightPanelStyle} className="nodrag nopan">
          {/* Persistent Search Section */}
          <div className="search-section" style={{ flexShrink: 0, position: 'relative' }}>
              <div className="search-input-wrapper">
                  <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                      type="text"
                      placeholder="Search nodes by name or path..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="search-clear-btn" title="Clear search">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                      </button>
                  )}
              </div>
              
              {searchQuery.trim() !== '' && (
                  <div className="search-results-dropdown">
                      {filteredNodes.length === 0 ? (
                          <div className="search-no-results">No nodes match your search</div>
                      ) : (
                          filteredNodes.map(item => (
                              <div 
                                  key={item.id} 
                                  className={`search-result-item type-${item.type}`}
                                  onClick={() => {
                                      onSelectNote(item.path);
                                      setSearchQuery('');
                                  }}
                              >
                                  <span className="search-result-icon">
                                      {item.type === 'project' && <ProjectIcon />}
                                      {item.type === 'scope' && <ScopeIcon />}
                                      {item.type === 'session' && <SessionIcon />}
                                      {item.type === 'trigger' && <TriggerIcon />}
                                  </span>
                                  <div className="search-result-info">
                                      <span className="search-result-name">{item.name}</span>
                                      <span className="search-result-path">{item.path}</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              )}
          </div>

          {selectedNotePath ? (
              <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '2px', maxWidth: '380px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
                              Note Details
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#3498db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedNotePath}>
                              {selectedNotePath.split('/').pop()?.replace('.md', '')}
                          </span>
                      </div>
                      <button 
                          onClick={() => onSelectNote(null)}
                          style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              flexShrink: 0
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                          title="Clear selection"
                      >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                      </button>
                  </div>
                  
                  <div className="markdown-scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                      {isNoteLoading ? (
                          <div className="tree-empty-state">
                              <div className="spinner"></div>
                              <p>Loading content...</p>
                          </div>
                      ) : selectedNoteContent ? (
                          <MarkdownRenderer markdown={selectedNoteContent} onSelectNote={onSelectNote} />
                      ) : (
                          <div className="empty-text">No content available</div>
                      )}
                  </div>
              </>
          ) : (
              <div className="right-panel-empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', padding: '20px', gap: '12px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="9"></line>
                      <line x1="9" y1="13" x2="15" y2="13"></line>
                      <line x1="9" y1="17" x2="13" y2="17"></line>
                  </svg>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No node selected</p>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Select a node from the dashboard or use the search bar above to preview its contents.</p>
              </div>
          )}

          {/* Toggle Button for Right Panel */}
          <button 
              onClick={() => onChangeRightPanelOpen(!isRightPanelOpen)} 
              style={{
                  position: 'absolute',
                  left: '-36px',
                  top: '20px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px 0 0 8px',
                  background: 'rgba(25, 25, 25, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRight: 'none',
                  color: '#f5f5f5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '-4px 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 101,
                  transition: 'all 0.2s'
              }}
              title={isRightPanelOpen ? "Collapse details" : "Expand details"}
          >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isRightPanelOpen ? (
                      <polyline points="9 18 15 12 9 6" />
                  ) : (
                      <polyline points="15 18 9 12 15 6" />
                  )}
              </svg>
          </button>
      </div>
    </div>
  );
};
