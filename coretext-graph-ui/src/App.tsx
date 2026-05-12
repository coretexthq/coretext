import { useEffect, useState } from 'react';
import { CoretextGraph } from './core/CoretextGraph';
import type { Node, Edge } from '@xyflow/react';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/graph');
        const data = await res.json();
        
        // simple comparison to avoid unnecessary react flow re-layouting
        setNodes(prev => JSON.stringify(prev) === JSON.stringify(data.nodes) ? prev : data.nodes);
        setEdges(prev => JSON.stringify(prev) === JSON.stringify(data.edges) ? prev : data.edges);
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      }
    };

    fetchGraph();
    const interval = setInterval(fetchGraph, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CoretextGraph nodes={nodes} edges={edges} />
  );
}

export default App;
