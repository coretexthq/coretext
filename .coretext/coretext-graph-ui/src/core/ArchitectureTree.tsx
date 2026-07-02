import React, { useState, useRef, useEffect } from 'react';
import { ScrollingLabel } from './CoretextGraph';

interface TreeNode {
    id: string;
    name: string;
    type: 'project' | 'scope' | 'session' | 'trigger';
    path?: string;
    absolutePath?: string;
    sessionName?: string;
    sessionPath?: string;
    children?: TreeNode[];
    hasBacklog?: boolean;
    meta?: {
        source: string;
        type: string;
        description?: string;
        hook?: string;
    };
}

interface ArchitectureTreeProps {
    treeData: TreeNode | null;
    highlightedNodes: Set<string>;
    highlightedActions?: Record<string, 'read' | 'write'>;
    isPanelCollapsed?: boolean;
    isRightPanelOpen?: boolean;
    onSelectNode: (node: TreeNode | null) => void;
    selectedNotePath: string | null;
    isTreeFullyExpanded?: boolean;
    hasActiveSession?: boolean;
}

const ProjectIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

const ScopeIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
);

const SessionIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TriggerIcon = () => (
    <svg className="tree-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

const isPathMatch = (a: string | null, b: string | null) => {
    if (!a || !b) return false;
    const normA = a.replace(/\\/g, '/');
    const normB = b.replace(/\\/g, '/');
    return normA === normB || normA.endsWith('/' + normB) || normB.endsWith('/' + normA);
};

const hasDescendantWithPath = (node: TreeNode, path: string | null): boolean => {
    if (!path) return false;

    if (node.children) {
        for (const child of node.children) {
            const childPath = child.path || child.absolutePath || null;
            if (isPathMatch(path, childPath)) {
                return true;
            }
            if (hasDescendantWithPath(child, path)) {
                return true;
            }
        }
    }
    return false;
};
const hasHighlightedDescendant = (node: TreeNode, isNodeHighlighted: (path: string | undefined) => boolean): boolean => {
    if (node.children) {
        for (const child of node.children) {
            const childPath = child.path || child.absolutePath;
            if (isNodeHighlighted(childPath)) {
                return true;
            }
            if (hasHighlightedDescendant(child, isNodeHighlighted)) {
                return true;
            }
        }
    }
    return false;
};
interface MindmapNodeProps {
    node: TreeNode;
    depth: number;
    onSelectNode: (node: TreeNode) => void;
    selectedNotePath: string | null;
    isNodeHighlighted: (nodePath: string | undefined) => boolean;
    getNodeHighlightType: (nodePath: string | undefined) => 'write' | 'read' | null;
    isTreeFullyExpanded?: boolean;
    onNodeToggle?: (node: TreeNode) => void;
    isRightPanelOpen?: boolean;
    hasActiveSession?: boolean;
}

const MindmapNode: React.FC<MindmapNodeProps> = ({
    node,
    depth = 0,
    onSelectNode,
    selectedNotePath,
    isNodeHighlighted,
    getNodeHighlightType,
    isTreeFullyExpanded = false,
    onNodeToggle,
    isRightPanelOpen = false,
    hasActiveSession = false
}) => {
    const getInitialExpansion = () => {
        if (isTreeFullyExpanded) return true;
        if (hasActiveSession) {
            return depth === 0 || hasHighlightedDescendant(node, isNodeHighlighted);
        }
        return depth < 1;
    };

    const [isExpanded, setIsExpanded] = useState(getInitialExpansion());
    const [isNodeHovered, setIsNodeHovered] = useState(false);

    useEffect(() => {
        if (selectedNotePath && hasDescendantWithPath(node, selectedNotePath)) {
            setIsExpanded(true);
        }
    }, [selectedNotePath, node]);

    const hasChildren = node.children && node.children.length > 0;
    const nodeFullPath = node.path || node.absolutePath;
    const isActive = isRightPanelOpen && isPathMatch(selectedNotePath, nodeFullPath || null);
    const highlightType = getNodeHighlightType(node.path);
    const isBacklogHighlighted = !hasActiveSession && node.hasBacklog;

    const getIcon = () => {
        switch (node.type) {
            case 'project': return <ProjectIcon />;
            case 'scope': return <ScopeIcon />;
            case 'session': return <SessionIcon />;
            case 'trigger': return <TriggerIcon />;
        }
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        if (onNodeToggle) {
            onNodeToggle(node);
        }
    };

    return (
        <div className="mindmap-branch">
            <div className="mindmap-node-wrapper">
                <div 
                    onMouseEnter={() => setIsNodeHovered(true)}
                    onMouseLeave={() => setIsNodeHovered(false)}
                    className={`mindmap-node type-${node.type} ${highlightType ? `highlighted-${highlightType}` : ''} ${isBacklogHighlighted ? 'highlighted-backlog' : ''} ${isActive ? 'active-node' : ''}`}
                    onClick={() => onSelectNode(node)}
                    style={{ cursor: 'pointer' }}
                    data-path={nodeFullPath || ''}
                >
                    <span className="mindmap-icon">{getIcon()}</span>
                    <div className="mindmap-text-content">
                        <span className="mindmap-name" style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                            <ScrollingLabel label={node.name.replace('.md', '')} isHovered={isNodeHovered} />
                            {node.type === 'trigger' && node.meta && (
                                <span className="trigger-badge" style={{ backgroundColor: node.meta.type === 'full' ? '#e74c3c' : '#95a5a6', flexShrink: 0 }}>
                                    {node.meta.type}
                                </span>
                            )}
                        </span>
                        {node.type === 'trigger' && node.meta?.description && (
                            <span className="mindmap-desc">{node.meta.description}</span>
                        )}
                    </div>

                    {hasChildren && (
                        <button 
                            className={`mindmap-collapse-btn ${isExpanded ? 'expanded' : ''}`}
                            onClick={toggleExpand}
                            title={isExpanded ? "Collapse children" : "Expand children"}
                        >
                            {isExpanded ? '—' : '+'}
                        </button>
                    )}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="mindmap-children">
                    {node.children!.map(child => (
                        <MindmapNode 
                            key={child.id} 
                            node={child} 
                            depth={depth + 1} 
                            onSelectNode={onSelectNode}
                            selectedNotePath={selectedNotePath}
                            isNodeHighlighted={isNodeHighlighted}
                            getNodeHighlightType={getNodeHighlightType}
                            isTreeFullyExpanded={isTreeFullyExpanded}
                            onNodeToggle={onNodeToggle}
                            isRightPanelOpen={isRightPanelOpen}
                            hasActiveSession={hasActiveSession}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ArchitectureTree: React.FC<ArchitectureTreeProps> = ({
    treeData,
    highlightedNodes,
    highlightedActions = {},
    isPanelCollapsed = false,
    isRightPanelOpen = false,
    onSelectNode,
    selectedNotePath,
    isTreeFullyExpanded = false,
    hasActiveSession = false
}) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    
    // Combine scale and translation into a single state for smooth atomic updates
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const panStartRef = useRef({ x: 0, y: 0 });

    const isNodeHighlighted = (nodePath: string | undefined) => {
        if (!nodePath) return false;
        const normalizedPath = nodePath.replace(/\\/g, '/');
        
        if (highlightedNodes.has(nodePath) || highlightedNodes.has(normalizedPath)) return true;
        
        return Array.from(highlightedNodes).some(h => {
            const hNorm = h.replace(/\\/g, '/');
            return hNorm.endsWith(normalizedPath) || normalizedPath.endsWith(hNorm);
        });
    };

    const getNodeHighlightType = (nodePath: string | undefined): 'write' | 'read' | null => {
        if (!nodePath) return null;
        
        const getAction = (path: string): 'write' | 'read' | null => {
            if (highlightedActions[path]) return highlightedActions[path];
            const keys = Object.keys(highlightedActions);
            for (const key of keys) {
                if (isPathMatch(path, key)) {
                    return highlightedActions[key];
                }
            }
            return null;
        };

        let isHighlighted = false;
        if (highlightedNodes.has(nodePath)) {
            isHighlighted = true;
            const act = getAction(nodePath);
            if (act) return act;
        }
        
        for (const h of Array.from(highlightedNodes)) {
            if (isPathMatch(nodePath, h)) {
                isHighlighted = true;
                const act = getAction(h);
                if (act) return act;
            }
        }
        
        return isHighlighted ? 'read' : null;
    };

    // Calculate layout sizing to fit the entire tree view on screen
    const fitView = () => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        
        const treeElement = viewport.querySelector('.mindmap-root-wrapper > .mindmap-branch') as HTMLElement;
        if (!treeElement) return;

        const rect = viewport.getBoundingClientRect();
        
        // Unscaled actual dimensions of the tree content
        const contentWidth = treeElement.offsetWidth;
        const contentHeight = treeElement.offsetHeight;
        
        // Unscaled positions of the tree element relative to the canvas parent
        const treeLeft = treeElement.offsetLeft;
        const treeTop = treeElement.offsetTop;

        // Visual boundaries of the visible (uncovered) region
        const visibleLeft = isPanelCollapsed ? 60 : 340;
        const visibleRight = isRightPanelOpen ? rect.width - 490 : rect.width - 40;
        
        const visibleWidth = visibleRight - visibleLeft;
        const visibleHeight = rect.height - 80; // 40px top and bottom padding

        if (contentWidth === 0 || contentHeight === 0) return;

        // Scale factors to fit either width or height, with a 10% outer margin
        const scaleX = visibleWidth / contentWidth;
        const scaleY = visibleHeight / contentHeight;
        const newScale = Math.min(Math.min(scaleX, scaleY) * 0.9, 1.5); // Clamp scale to a max of 1.5 to prevent extreme zoom-in

        // Center the tree inside the visible (uncovered) region
        const targetX = visibleLeft + (visibleWidth - contentWidth * newScale) / 2;
        const targetY = 40 + (visibleHeight - contentHeight * newScale) / 2;

        // Compute the final pan translation offsets
        setTransform({
            scale: newScale,
            x: targetX - treeLeft * newScale,
            y: targetY - treeTop * newScale
        });
    };

    // Center and zoom in on a specific node path
    const centerOnNode = (nodePath: string | null, targetScale?: number) => {
        if (!nodePath) return;
        const viewport = viewportRef.current;
        if (!viewport) return;

        const nodeElements = viewport.querySelectorAll('.mindmap-node');
        let selectedEl: HTMLElement | null = null;

        for (let el of Array.from(nodeElements)) {
            const path = el.getAttribute('data-path');
            if (isPathMatch(nodePath, path)) {
                selectedEl = el as HTMLElement;
                break;
            }
        }

        if (!selectedEl) return;

        const rect = viewport.getBoundingClientRect();
        const visibleLeft = isPanelCollapsed ? 60 : 340;
        const visibleRight = isRightPanelOpen ? rect.width - 490 : rect.width - 40;
        
        const visibleWidth = visibleRight - visibleLeft;
        const visibleHeight = rect.height - 80;

        const targetCenterX = visibleLeft + visibleWidth / 2;
        const targetCenterY = 40 + visibleHeight / 2;

        const nodeRect = selectedEl.getBoundingClientRect();
        const canvas = viewport.querySelector('.mindmap-canvas') as HTMLElement;
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();

        setTransform(prev => {
            // Use targetScale if provided, otherwise preserve the current scale
            const focusScale = targetScale !== undefined ? targetScale : prev.scale;

            // Calculate node center in unscaled canvas coordinates
            const nodeCanvasX = (nodeRect.left - canvasRect.left) / prev.scale;
            const nodeCanvasY = (nodeRect.top - canvasRect.top) / prev.scale;
            const unscaledNodeWidth = nodeRect.width / prev.scale;
            const unscaledNodeHeight = nodeRect.height / prev.scale;

            const nodeCenterCanvasX = nodeCanvasX + unscaledNodeWidth / 2;
            const nodeCenterCanvasY = nodeCanvasY + unscaledNodeHeight / 2;

            return {
                scale: focusScale,
                x: targetCenterX - nodeCenterCanvasX * focusScale,
                y: targetCenterY - nodeCenterCanvasY * focusScale
            };
        });
    };

    const lastSelectedPathRef = useRef<string | null>(null);
    useEffect(() => {
        if (selectedNotePath) {
            lastSelectedPathRef.current = selectedNotePath;
        }
    }, [selectedNotePath]);

    // Recenter and zoom to a node when selectedNotePath changes
    useEffect(() => {
        if (!selectedNotePath) return;
        const timer = setTimeout(() => {
            centerOnNode(selectedNotePath, 0.75); // Target scale is 75% zoom when selected
        }, 320); // Syncs with sidebar slide transitions
        return () => clearTimeout(timer);
    }, [selectedNotePath, isPanelCollapsed, isRightPanelOpen]);

    // Recenter when panel collapses and no node is active, keeping scale/zoom
    useEffect(() => {
        if (selectedNotePath || !lastSelectedPathRef.current) return;
        const timer = setTimeout(() => {
            centerOnNode(lastSelectedPathRef.current);
        }, 150);
        return () => clearTimeout(timer);
    }, [isRightPanelOpen, selectedNotePath]);

    // Automatically fit the view when the tree data changes or expands/collapses (when no specific node is selected)
    useEffect(() => {
        if (!treeData) return;
        // Don't auto-fit-all if we just selected a node (so we focus on the node instead)
        if (selectedNotePath) return;

        const timer = setTimeout(() => {
            fitView();
        }, 150);
        return () => clearTimeout(timer);
    }, [treeData, isTreeFullyExpanded, isPanelCollapsed]);

    const handleNodeToggle = (node: TreeNode) => {
        // Recenter on this node after layout settles, keeping the current scale
        setTimeout(() => {
            centerOnNode(node.path || node.absolutePath || null);
        }, 180);
    };

    // Handle mouse dragging to pan the canvas
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // Only pan on left-click
        
        const target = e.target as HTMLElement;
        // Do not pan if clicking inside nodes, toggle buttons, or controls
        if (
            target.closest('.mindmap-node') || 
            target.closest('.mindmap-collapse-btn') || 
            target.closest('.mindmap-controls')
        ) {
            return;
        }

        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        panStartRef.current = { x: transform.x, y: transform.y };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setTransform(prev => ({
            ...prev,
            x: panStartRef.current.x + dx,
            y: panStartRef.current.y + dy
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (
            target.closest('.mindmap-node') || 
            target.closest('.mindmap-collapse-btn') || 
            target.closest('.mindmap-controls')
        ) {
            return;
        }

        const dx = Math.abs(e.clientX - dragStartRef.current.x);
        const dy = Math.abs(e.clientY - dragStartRef.current.y);

        // If it's a click (not a pan drag)
        if (dx < 5 && dy < 5) {
            onSelectNode(null);
        }
    };

    // Zoom around the center of the viewport
    const zoomAtCenter = (factor: number) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        
        const rect = viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setTransform(prev => {
            const newScale = Math.min(Math.max(prev.scale * factor, 0.15), 3.0);
            const canvasX = (centerX - prev.x) / prev.scale;
            const canvasY = (centerY - prev.y) / prev.scale;
            return {
                scale: newScale,
                x: centerX - canvasX * newScale,
                y: centerY - canvasY * newScale
            };
        });
    };

    // Zoom towards the exact cursor coordinates (smooth, unified update)
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomSensitivity = 0.0015;
            const zoomFactor = Math.exp(-e.deltaY * zoomSensitivity);
            
            setTransform(prev => {
                const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.15), 3.0);
                const canvasX = (mouseX - prev.x) / prev.scale;
                const canvasY = (mouseY - prev.y) / prev.scale;
                
                return {
                    scale: newScale,
                    x: mouseX - canvasX * newScale,
                    y: mouseY - canvasY * newScale
                };
            });
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            viewport.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className="mindmap-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <div 
                className="mindmap-viewport"
                ref={viewportRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleViewportClick}
                style={{
                    padding: '40px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex'
                }}
            >
                {treeData ? (
                    <div 
                        className="mindmap-canvas"
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transformOrigin: '0 0',
                            transition: isDragging ? 'none' : 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '100%',
                            width: 'max-content'
                        }}
                    >
                        <div className="mindmap-root-wrapper" style={{ margin: 'auto 0' }}>
                             <MindmapNode 
                                 key={`${treeData.id}-${isTreeFullyExpanded}-${hasActiveSession}`}
                                 node={treeData} 
                                 depth={0} 
                                 onSelectNode={onSelectNode}
                                 selectedNotePath={selectedNotePath}
                                 isNodeHighlighted={isNodeHighlighted}
                                 getNodeHighlightType={getNodeHighlightType}
                                 isTreeFullyExpanded={isTreeFullyExpanded}
                                 onNodeToggle={handleNodeToggle}
                                 isRightPanelOpen={isRightPanelOpen}
                                 hasActiveSession={hasActiveSession}
                             />
                        </div>
                    </div>
                ) : (
                    <div className="tree-empty-state">
                        <div className="spinner"></div>
                        <p>Parsing project hierarchy...</p>
                    </div>
                )}
            </div>

            {/* Floating Zoom Controls */}
            <div 
                className="mindmap-controls"
                style={{
                    left: isPanelCollapsed ? '80px' : '360px',
                    transition: 'left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
            >
                <button onClick={() => zoomAtCenter(1.2)} title="Zoom In">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button onClick={() => zoomAtCenter(1 / 1.2)} title="Zoom Out">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button onClick={fitView} title="Fit View (Auto-zoom)">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6"></path>
                        <path d="M9 21H3v-6"></path>
                        <path d="M21 3l-7 7"></path>
                        <path d="M3 21l7-7"></path>
                    </svg>
                </button>
                <div className="mindmap-zoom-badge">
                    {Math.round(transform.scale * 100)}%
                </div>
            </div>
        </div>
    );
};
