import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sessions', (req, res) => {
    try {
        const python = process.env.PYTHON || 'python3';
        const repoRoot = path.resolve(__dirname, '../../../');
        const kernelPath = path.join(repoRoot, '.coretext', 'note_hierarchy.py');
        const output = execFileSync(
            python,
            [kernelPath, 'sessions'],
            {
                cwd: repoRoot,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe']
            }
        );
        res.json(JSON.parse(output));
    } catch (error) {
        console.error("Error reading sessions:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ingest', (req, res) => {
    try {
        const repoRoot = path.resolve(__dirname, '../../../');
        const logsDir = path.join(repoRoot, '.coretext', 'logs');
        const sessionsDir = path.join(repoRoot, '.coretext-data', 'sessions');
        
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
        const repoRoot = path.resolve(__dirname, '../../../');
        const sessionsDir = path.join(repoRoot, '.coretext-data', 'sessions');
        if (!fs.existsSync(sessionsDir)) {
            return res.json({ nodes: [], actions: {} });
        }

        if (!req.query.sessions) {
            return res.json({ nodes: [], actions: {} });
        }

        const python = process.env.PYTHON || 'python3';
        const kernelPath = path.join(repoRoot, '.coretext', 'note_hierarchy.py');
        const output = execFileSync(
            python,
            [kernelPath, 'highlights', '--sessions', req.query.sessions],
            {
                cwd: repoRoot,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe']
            }
        );
        res.json(JSON.parse(output));
    } catch (error) {
        console.error("Error reading highlights:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graphs', (req, res) => {
    try {
        const repoRoot = path.resolve(__dirname, '../../../');
        const coretextDir = path.join(repoRoot, '.coretext-data');
        if (!fs.existsSync(coretextDir)) {
            return res.json({ graphs: [] });
        }
        
        const files = fs.readdirSync(coretextDir)
            .filter(f => f.endsWith('_rules.jsonl'))
            .map(f => f.replace('_rules.jsonl', ''));
            
        res.json({ graphs: files });
    } catch (error) {
        console.error("Error reading graphs:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graph', (req, res) => {
    try {
        const repoRoot = path.resolve(__dirname, '../../../');
        const coretextDir = path.join(repoRoot, '.coretext-data');
        let graphFile = '';
        
        const workspaceName = path.basename(repoRoot);
        if (req.query.graph) {
            graphFile = `${req.query.graph}_rules.jsonl`;
        } else {
            if (fs.existsSync(coretextDir)) {
                const files = fs.readdirSync(coretextDir).filter(f => f.endsWith('_rules.jsonl'));
                if (files.length > 0) {
                    const defaultGraph = `${workspaceName}_rules.jsonl`;
                    if (files.includes(defaultGraph)) {
                        graphFile = defaultGraph;
                    } else {
                        graphFile = files[0];
                    }
                }
            }
        }
        
        const jsonlPath = path.join(coretextDir, graphFile);
        
        if (!graphFile || !fs.existsSync(jsonlPath)) {
            return res.json({ nodes: [], edges: [] });
        }
        
        const content = fs.readFileSync(jsonlPath, 'utf8');
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const edgesData = lines.map(line => JSON.parse(line));
        
        const sources = new Set(edgesData.map(e => e.source));
        const targets = new Set(edgesData.map(e => e.target));
        
        const getRole = (id) => {
            const isSource = sources.has(id);
            if (isSource) return 'trigger';
            return 'knowledge';
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


app.get('/api/architecture', (req, res) => {
    try {
        const projectName = 'coretext';
        const repoRoot = path.resolve(__dirname, '../../../');
        const projectPath = path.join(repoRoot, 'knowledge');
        
        if (!fs.existsSync(projectPath)) {
            return res.status(404).json({ error: `Knowledge folder not found at repo root.` });
        }

        const graphFile = req.query.graph || 'coretext';
        const python = process.env.PYTHON || 'python3';
        const kernelPath = path.join(repoRoot, '.coretext', 'note_hierarchy.py');
        const output = execFileSync(
            python,
            [kernelPath, 'architecture', '--project', projectName, '--graph', graphFile],
            {
                cwd: repoRoot,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe']
            }
        );
        let parsed;
        try {
            parsed = JSON.parse(output);
        } catch (parseError) {
            return res.status(500).json({ error: `Kernel output is invalid JSON: ${parseError.message}` });
        }
        res.json(parsed);
    } catch (error) {
        console.error("Error generating architecture tree:", error);
        res.status(500).json({ error: `Python kernel failed to execute: ${error.message}` });
    }
});
    
    app.get('/api/file-content', (req, res) => {
        try {
            let filePath = req.query.path;
            if (!filePath) {
                return res.status(400).json({ error: 'Path parameter is required' });
            }
    
            const repoRoot = path.resolve(__dirname, '../../../');
            
            // Normalize path separators and strip leading slash if it's a project relative path starting with /
            filePath = filePath.replace(/\\/g, '/');
            if (filePath.startsWith('/') && !filePath.startsWith(repoRoot.replace(/\\/g, '/')) && !filePath.startsWith('/Users') && !filePath.startsWith('/private') && !filePath.startsWith('/var')) {
                filePath = filePath.substring(1);
            }
            
            let absolutePath = filePath;
    
            if (!path.isAbsolute(filePath)) {
                // First check if it exists relative to the repository root
                const pathInRepo = path.resolve(repoRoot, filePath);
                if (fs.existsSync(pathInRepo)) {
                    absolutePath = pathInRepo;
                } else {
                    // Try relative to __dirname
                    absolutePath = path.resolve(__dirname, filePath);
                }
            }
            if (!fs.existsSync(absolutePath)) {
                // Try mapping relative .coretext-data files
                const pathInCoretext = path.resolve(repoRoot, '.coretext-data', filePath);
                if (fs.existsSync(pathInCoretext)) {
                    absolutePath = pathInCoretext;
                } else {
                    // Try dynamic search like Obsidian (resolving base name recursively)
                    const basename = path.basename(filePath);
                    const cleanBasename = basename.endsWith('.md') ? basename : basename + '.md';
                    
                    const searchDirs = [
                        path.join(repoRoot, 'knowledge'),
                        path.join(repoRoot, 'docs'),
                        path.join(repoRoot, '.coretext-data'),
                        path.join(repoRoot, '.coretext'),
                        path.join(repoRoot, '.agents'),
                        repoRoot
                    ];
                    
                    let foundPath = null;
                    function findFile(dir) {
                        if (!fs.existsSync(dir)) return null;
                        const entries = fs.readdirSync(dir, { withFileTypes: true });
                        for (const entry of entries) {
                            const fullPath = path.join(dir, entry.name);
                            if (entry.isDirectory()) {
                                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
                                const found = findFile(fullPath);
                                if (found) return found;
                            } else if (entry.isFile()) {
                                if (entry.name === cleanBasename || entry.name === basename) {
                                    return fullPath;
                                }
                            }
                        }
                        return null;
                    }
                    
                    for (const dir of searchDirs) {
                        const found = findFile(dir);
                        if (found) {
                            foundPath = found;
                            break;
                        }
                    }
                    
                    if (foundPath) {
                        absolutePath = foundPath;
                    } else {
                        return res.status(404).json({ error: `File not found: ${filePath}` });
                    }
                }
            }
    
            const content = fs.readFileSync(absolutePath, 'utf8');
            const rel = path.relative(repoRoot, absolutePath).replace(/\\/g, '/');
            const relativePath = rel.startsWith('/') ? rel : '/' + rel;
            res.json({ content, path: absolutePath, relativePath });
        } catch (error) {
            console.error("Error reading file content:", error);
            res.status(500).json({ error: error.message });
        }
    });
    
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '127.0.0.1';
    const server = app.listen(PORT, HOST, () => {
        console.log(`CLI Backend running on http://localhost:${PORT}`);
    });
    server.on('error', (error) => {
        console.error('CLI Backend failed:', error);
    });
