import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sessions', (req, res) => {
    try {
        const sessionsDir = path.resolve(__dirname, '../../.coretext/sessions');
        if (!fs.existsSync(sessionsDir)) {
            return res.json({ sessions: [] });
        }
        
        const files = fs.readdirSync(sessionsDir)
            .filter(f => f.endsWith('.jsonl'))
            .map(f => ({ name: f, time: fs.statSync(path.join(sessionsDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);
            
        res.json({ sessions: files.map(f => f.name) });
    } catch (error) {
        console.error("Error reading sessions:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ingest', (req, res) => {
    try {
        const logsDir = path.resolve(__dirname, '../../.coretext/logs');
        const sessionsDir = path.resolve(__dirname, '../../.coretext/sessions');
        
        if (!fs.existsSync(logsDir)) {
            return res.json({ message: "No logs directory found.", ingested: 0 });
        }
        
        if (!fs.existsSync(sessionsDir)) {
            fs.mkdirSync(sessionsDir, { recursive: true });
        }
        
        const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.json'));
        let count = 0;
        
        files.forEach(file => {
            const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
            let data;
            try {
                data = JSON.parse(content);
            } catch (e) {
                return; // Skip malformed JSON
            }
            
            const lines = [];
            
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item.parts) {
                        item.parts.forEach(part => {
                            if (part.functionCall && ['read_file', 'write_file', 'replace'].includes(part.functionCall.name)) {
                                let filePath = part.functionCall.args.file_path;
                                if (filePath) {
                                    let relPath = filePath;
                                    const wtIndex = filePath.indexOf('.worktrees/');
                                    if (wtIndex !== -1) {
                                        const afterWt = filePath.substring(wtIndex + '.worktrees/'.length);
                                        const slashIndex = afterWt.indexOf('/');
                                        if (slashIndex !== -1) {
                                            relPath = afterWt.substring(slashIndex + 1);
                                        }
                                    }
                                    
                                    lines.push(JSON.stringify({
                                        node_id: relPath,
                                        timestamp: new Date().toISOString(),
                                        tool_name: part.functionCall.name
                                    }));
                                }
                            }
                        });
                    }
                });
            }
            
            if (lines.length > 0) {
                const baseName = file.replace('.json', '');
                fs.writeFileSync(path.join(sessionsDir, `${baseName}.jsonl`), lines.join('\n') + '\n');
                count++;
            }
        });
        
        res.json({ message: `Ingested ${count} files.`, ingested: count });
    } catch (error) {
        console.error("Error ingesting logs:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/highlights', (req, res) => {
    try {
        const sessionsDir = path.resolve(__dirname, '../../.coretext/sessions');
        if (!fs.existsSync(sessionsDir)) {
            return res.json({ nodes: [] });
        }
        
        let filesToRead = [];
        if (req.query.sessions) {
            const requestedSessions = req.query.sessions.split(',');
            filesToRead = requestedSessions.map(s => path.join(sessionsDir, s)).filter(f => fs.existsSync(f));
        } else {
            const files = fs.readdirSync(sessionsDir)
                .filter(f => f.endsWith('.jsonl'))
                .map(f => ({ name: f, time: fs.statSync(path.join(sessionsDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);
                
            if (files.length > 0) {
                filesToRead = [path.join(sessionsDir, files[0].name)];
            }
        }
            
        if (filesToRead.length === 0) {
            return res.json({ nodes: [] });
        }
        
        const highlightedNodes = new Set();
        filesToRead.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n').filter(l => l.trim().length > 0);
            
            lines.forEach(line => {
                try {
                    const data = JSON.parse(line);
                    if (data.node_id) highlightedNodes.add(data.node_id);
                } catch (e) {}
            });
        });
        
        res.json({ nodes: Array.from(highlightedNodes) });
    } catch (error) {
        console.error("Error reading highlights:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graphs', (req, res) => {
    try {
        const coretextDir = path.resolve(__dirname, '../../.coretext');
        if (!fs.existsSync(coretextDir)) {
            return res.json({ graphs: [] });
        }
        
        const files = fs.readdirSync(coretextDir)
            .filter(f => f.endsWith('.jsonl'))
            .map(f => f.replace('.jsonl', ''));
            
        res.json({ graphs: files });
    } catch (error) {
        console.error("Error reading graphs:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graph', (req, res) => {
    try {
        const coretextDir = path.resolve(__dirname, '../../.coretext');
        let graphFile = 'coretext.jsonl';
        
        if (req.query.graph) {
            graphFile = `${req.query.graph}.jsonl`;
        } else {
            const files = fs.readdirSync(coretextDir).filter(f => f.endsWith('.jsonl'));
            if (files.length > 0) {
                // Default to the first found or a specific default logic
                // Using the workspace name logic:
                const workspaceName = path.basename(path.resolve(__dirname, '../../'));
                const defaultGraph = `${workspaceName}.jsonl`;
                if (files.includes(defaultGraph)) {
                    graphFile = defaultGraph;
                } else if (files.includes('coretext.jsonl')) {
                    graphFile = 'coretext.jsonl';
                } else {
                    graphFile = files[0];
                }
            }
        }
        
        const jsonlPath = path.join(coretextDir, graphFile);
        
        if (!fs.existsSync(jsonlPath)) {
            return res.json({ nodes: [], edges: [] });
        }
        
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
