import { useEffect, useState, useMemo, useCallback } from 'react';
import { CoretextGraph } from './core/CoretextGraph';
import type { Node, Edge } from '@xyflow/react';
import { ReactFlowProvider } from '@xyflow/react';

export interface SessionOption {
  name: string;
  label: string;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedActions, setHighlightedActions] = useState<Record<string, 'read' | 'write'>>({});

  const [availableSessions, setAvailableSessions] = useState<SessionOption[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const [selectedGraph, setSelectedGraph] = useState<string>('');

  // Tab and Mindmap Tree States
  const [activeTab, setActiveTab] = useState<'graph' | 'tree'>('graph');
  const [treeData, setTreeData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isProd = import.meta.env.PROD;
        const apiBase = isProd ? '/knowledge/api' : 'http://localhost:3001/api';

        // 1. Fetch graph data
        const graphUrl = isProd ? `${apiBase}/graph.json` : `http://localhost:3001/api/graph${selectedGraph ? `?graph=${selectedGraph}` : ''}`;
        const graphRes = await fetch(graphUrl);
        const graphData = await graphRes.json();
        
        setNodes(prev => JSON.stringify(prev) === JSON.stringify(graphData.nodes) ? prev : graphData.nodes);
        setEdges(prev => JSON.stringify(prev) === JSON.stringify(graphData.edges) ? prev : graphData.edges);

        // 2. Fetch graphs
        const graphsUrl = isProd ? `${apiBase}/graphs.json` : 'http://localhost:3001/api/graphs';
        const graphsRes = await fetch(graphsUrl);
        const graphsData = await graphsRes.json();
        if (!selectedGraph && graphsData.graphs.length > 0) {
            const defaultGraph = graphsData.graphs.find((g: string) => g !== 'coretext') || graphsData.graphs[0];
            setSelectedGraph(defaultGraph);
        }

        // 3. Fetch sessions
        const sessionsUrl = isProd ? `${apiBase}/sessions.json` : 'http://localhost:3001/api/sessions';
        const sessionsRes = await fetch(sessionsUrl);
        const sessionsData = await sessionsRes.json();
        const sessions = (sessionsData.sessions || []).map((session: string | SessionOption) => {
            if (typeof session === 'string') {
                return {
                    name: session,
                    label: session.replace('session_', '').replace('.jsonl', '')
                };
            }
            return session;
        });
        setAvailableSessions(prev => JSON.stringify(prev) === JSON.stringify(sessions) ? prev : sessions);

        // 4. Fetch highlights
        let highlightData = { nodes: [] as string[], actions: {} as Record<string, 'read' | 'write'> };
        if (isProd) {
            if (selectedSessions.length > 0) {
                const results = await Promise.all(selectedSessions.map(async (session) => {
                    try {
                        const sName = session.replace('.jsonl', '.json');
                        const res = await fetch(`${apiBase}/highlights/${sName}`);
                        if (res.ok) return await res.json();
                    } catch (e) {
                        console.error("Failed to fetch highlights for session", session, e);
                    }
                    return { nodes: [], actions: {} };
                }));
                const nodesSet = new Set<string>();
                results.forEach(res => {
                    (res.nodes || []).forEach((n: string) => nodesSet.add(n));
                    Object.entries(res.actions || {}).forEach(([nodeId, action]) => {
                        if (action === 'write' || !highlightData.actions[nodeId]) {
                            highlightData.actions[nodeId] = action as 'read' | 'write';
                        }
                    });
                });
                highlightData.nodes = Array.from(nodesSet);
            }
        } else {
            let highlightUrl = 'http://localhost:3001/api/highlights';
            if (selectedSessions.length > 0) {
                highlightUrl += `?sessions=${selectedSessions.join(',')}`;
            }
            const highlightRes = await fetch(highlightUrl);
            highlightData = await highlightRes.json();
        }
        
        setHighlightedActions(highlightData.actions || {});
        setHighlightedNodes(prev => {
            const newArray = Array.from(new Set(highlightData.nodes));
            const oldArray = Array.from(prev);
            if (JSON.stringify(newArray.sort()) === JSON.stringify(oldArray.sort())) return prev;
            return new Set(highlightData.nodes);
        });

        // 5. Fetch tree data
        const treeUrl = isProd ? `${apiBase}/architecture.json` : `http://localhost:3001/api/architecture${selectedGraph ? `?graph=${selectedGraph}` : ''}`;
        const treeRes = await fetch(treeUrl);
        if (treeRes.ok) {
            const treeDataJson = await treeRes.json();
            setTreeData((prev: any) => JSON.stringify(prev) === JSON.stringify(treeDataJson) ? prev : treeDataJson);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
    
    const isProd = import.meta.env.PROD;
    let interval: any;
    if (!isProd) {
        interval = setInterval(fetchData, 2000);
    }

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [selectedSessions, selectedGraph]);

  const [selectedNotePath, setSelectedNotePath] = useState<string | null>(null);
  const [selectedNoteContent, setSelectedNoteContent] = useState<string | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const handleSelectNote = useCallback(async (path: string | null) => {
    if (!path) {
      setSelectedNotePath(null);
      setSelectedNoteContent(null);
      setIsRightPanelOpen(false);
      return;
    }
    if (path.includes('*') || path.includes('?')) return;
    
    setIsNoteLoading(true);
    setSelectedNotePath(path);
    setIsRightPanelOpen(true);
    
    try {
      const isProd = import.meta.env.PROD;
      const apiBase = isProd ? '/knowledge/api' : 'http://localhost:3001/api';
      
      let fetchUrl = `${apiBase}/file-content?path=${encodeURIComponent(path)}`;
      if (isProd) {
        let clean = path.replace(/\\/g, '/');
        if (clean.startsWith('/')) {
          clean = clean.substring(1);
        }
        const safeName = clean.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
        fetchUrl = `${apiBase}/file-content/${safeName}`;
      }
      
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        setSelectedNoteContent(data.content);
        if (data.relativePath) {
          setSelectedNotePath(data.relativePath);
        }
      } else {
        setSelectedNoteContent(`### Error\nFailed to load content for: \`${path}\`\n(File might not exist or is a directory)`);
      }
    } catch (err) {
      console.error(err);
      setSelectedNoteContent(`### Error\nFailed to fetch file content:\n${err}`);
    } finally {
      setIsNoteLoading(false);
    }
  }, []);

  // Sync state to URL search parameters (?file=...)
  useEffect(() => {
    const url = new URL(window.location.href);
    const currentFile = url.searchParams.get('file');
    
    if (isRightPanelOpen && selectedNotePath) {
      if (currentFile !== selectedNotePath) {
        url.searchParams.set('file', selectedNotePath);
        window.history.pushState({}, '', url.pathname + url.search);
      }
    } else {
      if (currentFile) {
        url.searchParams.delete('file');
        window.history.pushState({}, '', url.pathname + url.search);
      }
    }
  }, [isRightPanelOpen, selectedNotePath]);

  // Handle browser Back/Forward navigation & Initial load from URL
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const fileParam = params.get('file');
      if (fileParam) {
        handleSelectNote(fileParam);
      } else {
        setIsRightPanelOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get('file');
    if (fileParam) {
      handleSelectNote(fileParam);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleSelectNote]);

  const toggleSession = (session: string) => {
    setSelectedSessions(prev => {
        if (prev.includes(session)) {
            return prev.filter(s => s !== session);
        } else {
            return [...prev, session];
        }
    });
  };

  const nodesWithHighlight = useMemo(() => {
      return nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: highlightedNodes.has(node.id),
          isSelected: isRightPanelOpen && selectedNotePath === node.id
        }
      }));
  }, [nodes, highlightedNodes, selectedNotePath, isRightPanelOpen]);

  return (
    <ReactFlowProvider>
      <CoretextGraph 
        nodes={nodesWithHighlight} 
        edges={edges} 
        availableSessions={availableSessions}
        selectedSessions={selectedSessions}
        onToggleSession={toggleSession}
        highlightedNodes={highlightedNodes}
        highlightedActions={highlightedActions}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        treeData={treeData}
        selectedNotePath={selectedNotePath}
        selectedNoteContent={selectedNoteContent}
        isNoteLoading={isNoteLoading}
        isRightPanelOpen={isRightPanelOpen}
        onSelectNote={handleSelectNote}
        onChangeRightPanelOpen={setIsRightPanelOpen}
      />
    </ReactFlowProvider>
  );
}

export default App;
