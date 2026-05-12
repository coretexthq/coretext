import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.get('/api/graph', (req, res) => {
    try {
        const jsonlPath = path.resolve(__dirname, '../../.coretext/coretext.jsonl');
        const content = fs.readFileSync(jsonlPath, 'utf8');
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const edgesData = lines.map(line => JSON.parse(line));
        
        const sources = new Set(edgesData.map(e => e.source));
        const targets = new Set(edgesData.map(e => e.target));
        
        const getRole = (id) => {
            const isSource = sources.has(id);
            const isTarget = targets.has(id);
            
            // 1. If it's a SKILL target, style as skill
            if (isTarget && id.endsWith('SKILL.md')) return 'skill';
            // 2. If it's purely a target, style as context doc
            if (isTarget && !isSource) return 'context';
            // 3. If it originates an edge, style as a trigger source
            if (isSource) return 'trigger';
            
            return 'context';
        };

        const nodesMap = new Map();
        const edges = [];
        
        edgesData.forEach((edge, index) => {
            const source = edge.source;
            const target = edge.target;
            
            if (!nodesMap.has(source)) {
                nodesMap.set(source, {
                    id: source,
                    data: { label: source, category: getRole(source) },
                    position: { x: 0, y: 0 }
                });
            }
            if (!nodesMap.has(target)) {
                nodesMap.set(target, {
                    id: target,
                    data: { label: target, category: getRole(target) },
                    position: { x: 0, y: 0 }
                });
            }
            
            edges.push({
                id: `e${index}-${source}-${target}`,
                source: source,
                target: target,
                label: `${edge.type} (${edge.hook || 'both'})`,
                type: 'default',
                animated: edge.type === 'hint',
                style: { stroke: edge.type === 'full' ? '#e74c3c' : '#95a5a6' },
                markerEnd: { type: 'arrowclosed', color: edge.type === 'full' ? '#e74c3c' : '#95a5a6' }
            });
        });
        
        res.json({
            nodes: Array.from(nodesMap.values()),
            edges: edges
        });
    } catch (error) {
        console.error("Error reading graph data:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`CLI Backend running on http://localhost:${PORT}`);
});
