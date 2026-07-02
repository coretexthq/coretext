const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = __dirname;
const distApiDir = path.join(repoRoot, 'dist/knowledge/api');

// Helper to check if a directory exists and create it recursively
function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

ensureDirSync(distApiDir);
ensureDirSync(path.join(distApiDir, 'file-content'));
ensureDirSync(path.join(distApiDir, 'highlights'));

const python = process.env.PYTHON || 'python3';
const kernelPath = path.join(repoRoot, '.coretext', 'note_hierarchy.py');

// 1. Load the canonical durable/session architecture tree from Python.
console.log('Loading rules-integrated architecture tree from Python kernel...');
let rootNode;
try {
    const output = execFileSync(
        python,
        [kernelPath, 'architecture', '--project', 'coretext'],
        { cwd: repoRoot, encoding: 'utf8' }
    );
    rootNode = JSON.parse(output);
} catch (error) {
    console.error('Failed to load architecture tree from kernel:', error);
    process.exit(1);
}

// ==========================================
// FILTER ARCHITECTURE TREE
// ==========================================
console.log('Filtering architecture tree to coretext.dashboard and coretext.thesis.site...');

const filteredRoot = {
    ...rootNode,
    children: rootNode.children.map(child => {
        if (child.id === 'coretext.dashboard') {
            return child;
        }
        if (child.id === 'coretext.thesis') {
            const newThesis = { ...child };
            newThesis.children = child.children.filter(c => c.id === 'coretext.thesis.site');
            return newThesis;
        }
        return null;
    }).filter(Boolean)
};

// Write filtered architecture to dist
fs.writeFileSync(path.join(distApiDir, 'architecture.json'), JSON.stringify(filteredRoot, null, 2));

// Collect all kept nodes, rules, and sessions
const keptPaths = new Set();
const keptRules = new Set();
const keptSessionNames = new Set();

function traverseFilteredTree(node) {
    if (!node) return;
    if (node.path) {
        keptPaths.add(node.path);
    }
    if (node.type === 'session') {
        keptSessionNames.add(node.sessionName);
    }
    if (node.type === 'rule') {
        keptRules.add(node.name);
    }
    if (node.children) {
        node.children.forEach(traverseFilteredTree);
    }
}
traverseFilteredTree(filteredRoot);
keptPaths.add('docs/dashboard_guide.md');

console.log(`Kept ${keptPaths.size} note paths, ${keptRules.size} rules, and ${keptSessionNames.size} sessions.`);

// ==========================================
// EXPORT FILE CONTENTS
// ==========================================
console.log('Exporting note contents...');

function getStaticPath(pathStr) {
    let clean = pathStr.replace(/\\/g, '/');
    if (clean.startsWith('/')) {
        clean = clean.substring(1);
    }
    return clean.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
}

keptPaths.forEach(relPath => {
    const cleanRel = relPath.startsWith('/') ? relPath.substring(1) : relPath;
    const absPath = path.resolve(repoRoot, cleanRel);
    if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, 'utf8');
        const data = {
            content: content,
            path: absPath,
            relativePath: relPath
        };
        const safeName = getStaticPath(relPath);
        fs.writeFileSync(path.join(distApiDir, 'file-content', safeName), JSON.stringify(data));
    }
});

// ==========================================
// FILTER AND EXPORT GRAPH VIEW
// ==========================================
console.log('Filtering and exporting graph view...');

// Load raw ledger jsonl edges
const workspaceName = path.basename(repoRoot);
let graphPath = path.join(repoRoot, '.coretext-data', `${workspaceName}_rules.jsonl`);
if (!fs.existsSync(graphPath)) {
    console.log(`Ledger graph file not found at ${graphPath}. Searching fallback paths...`);
    const coretextDataDir = path.join(repoRoot, '.coretext-data');
    if (fs.existsSync(coretextDataDir)) {
        const files = fs.readdirSync(coretextDataDir).filter(f => f.endsWith('_rules.jsonl'));
        if (files.length > 0) {
            const fallbackFile = files.find(f => f.startsWith('coretext')) || files[0];
            graphPath = path.join(coretextDataDir, fallbackFile);
            console.log(`Found fallback ledger file: ${graphPath}`);
        }
    }
}

const ledgerEdges = [];
if (fs.existsSync(graphPath)) {
    const ledgerContent = fs.readFileSync(graphPath, 'utf8');
    ledgerContent.split('\n').map(l => l.trim()).filter(l => l.length > 0).forEach(line => {
        try {
            ledgerEdges.push(JSON.parse(line));
        } catch(e) {}
    });
} else {
    console.error(`Error: Could not locate ledger graph file at ${graphPath}`);
}


const filteredEdgesData = ledgerEdges.filter(edge => {
    const targetBasename = path.basename(edge.target);
    return keptRules.has(targetBasename);
});

const sources = new Set(filteredEdgesData.map(e => e.source));
const targets = new Set(filteredEdgesData.map(e => e.target));

const getRole = (id) => {
    const isSource = sources.has(id);
    const isTarget = targets.has(id);
    if (isTarget && id.endsWith('SKILL.md')) return 'skill';
    if (isTarget && !isSource) return 'context';
    if (isSource) return 'trigger';
    return 'context';
};

const nodesMap = new Map();
const edges = [];

filteredEdgesData.forEach((edge, index) => {
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

const graphJson = {
    nodes: Array.from(nodesMap.values()),
    edges: edges
};

fs.writeFileSync(path.join(distApiDir, 'graph.json'), JSON.stringify(graphJson, null, 2));
fs.writeFileSync(path.join(distApiDir, 'graphs.json'), JSON.stringify({ graphs: ['coretext'] }, null, 2));

// ==========================================
// FILTER AND EXPORT SESSIONS & HIGHLIGHTS
// ==========================================
console.log('Filtering and exporting sessions/highlights...');

let allowedSessions = [];
try {
    const sessionsOutput = execFileSync(
        python,
        [kernelPath, 'sessions'],
        { cwd: repoRoot, encoding: 'utf8' }
    );
    allowedSessions = JSON.parse(sessionsOutput).sessions;
} catch (error) {
    console.error('Failed to load sessions list from kernel:', error);
}

allowedSessions.forEach(session => {
    try {
        const highlightsOutput = execFileSync(
            python,
            [kernelPath, 'highlights', '--sessions', session.name],
            { cwd: repoRoot, encoding: 'utf8' }
        );
        const highlightName = session.name.replace('.jsonl', '.json');
        fs.writeFileSync(path.join(distApiDir, 'highlights', highlightName), highlightsOutput);
    } catch (error) {
        console.error(`Failed to export highlights for session ${session.name}:`, error);
    }
});

fs.writeFileSync(path.join(distApiDir, 'sessions.json'), JSON.stringify({ sessions: allowedSessions }, null, 2));

console.log('Compilation of dashboard static data completed successfully!');
