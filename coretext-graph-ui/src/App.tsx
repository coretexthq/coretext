import { useEffect, useState } from 'react';
import { CoretextGraph } from './core/CoretextGraph';
import type { Node, Edge } from '@xyflow/react';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graphRes = await fetch('http://localhost:3001/api/graph');
        const graphData = await graphRes.json();
        
        // simple comparison to avoid unnecessary react flow re-layouting
        setNodes(prev => JSON.stringify(prev) === JSON.stringify(graphData.nodes) ? prev : graphData.nodes);
        setEdges(prev => JSON.stringify(prev) === JSON.stringify(graphData.edges) ? prev : graphData.edges);

        const highlightRes = await fetch('http://localhost:3001/api/highlights');
        const highlightData = await highlightRes.json();
        setHighlightedNodes(new Set(highlightData.nodes));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Inject highlighted state into nodes before passing them to CoretextGraph
  const nodesWithHighlight = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isHighlighted: highlightedNodes.has(node.id)
    }
  }));

  return (
    <CoretextGraph nodes={nodesWithHighlight} edges={edges} />
  );
}

export default App;
