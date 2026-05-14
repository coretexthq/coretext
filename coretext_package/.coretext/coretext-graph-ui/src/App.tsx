import { useEffect, useState, useMemo } from 'react';
import { CoretextGraph } from './core/CoretextGraph';
import type { Node, Edge } from '@xyflow/react';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const [availableGraphs, setAvailableGraphs] = useState<string[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let graphUrl = 'http://localhost:3001/api/graph';
        if (selectedGraph) {
            graphUrl += `?graph=${selectedGraph}`;
        }
        const graphRes = await fetch(graphUrl);
        const graphData = await graphRes.json();
        
        setNodes(prev => JSON.stringify(prev) === JSON.stringify(graphData.nodes) ? prev : graphData.nodes);
        setEdges(prev => JSON.stringify(prev) === JSON.stringify(graphData.edges) ? prev : graphData.edges);

        const graphsRes = await fetch('http://localhost:3001/api/graphs');
        const graphsData = await graphsRes.json();
        setAvailableGraphs(prev => JSON.stringify(prev) === JSON.stringify(graphsData.graphs) ? prev : graphsData.graphs);
        if (!selectedGraph && graphsData.graphs.length > 0) {
            const defaultGraph = graphsData.graphs.find((g: string) => g !== 'coretext') || graphsData.graphs[0];
            setSelectedGraph(defaultGraph);
        }

        const sessionsRes = await fetch('http://localhost:3001/api/sessions');
        const sessionsData = await sessionsRes.json();
        setAvailableSessions(prev => JSON.stringify(prev) === JSON.stringify(sessionsData.sessions) ? prev : sessionsData.sessions);

        let highlightUrl = 'http://localhost:3001/api/highlights';
        if (selectedSessions.length > 0) {
            highlightUrl += `?sessions=${selectedSessions.join(',')}`;
        }

        const highlightRes = await fetch(highlightUrl);
        const highlightData = await highlightRes.json();
        setHighlightedNodes(prev => {
            const newArray = Array.from(new Set(highlightData.nodes));
            const oldArray = Array.from(prev);
            if (JSON.stringify(newArray.sort()) === JSON.stringify(oldArray.sort())) return prev;
            return new Set(highlightData.nodes);
        });
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, [selectedSessions, selectedGraph]);

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
          isHighlighted: highlightedNodes.has(node.id)
        }
      }));
  }, [nodes, highlightedNodes]);

  return (
    <CoretextGraph 
      nodes={nodesWithHighlight} 
      edges={edges} 
      availableSessions={availableSessions}
      selectedSessions={selectedSessions}
      onToggleSession={toggleSession}
      availableGraphs={availableGraphs}
      selectedGraph={selectedGraph}
      onSelectGraph={setSelectedGraph}
    />
  );
}

export default App;