import json
import sys
from pathlib import Path

def generate_mermaid(jsonl_path):
    edges = []
    with open(jsonl_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                edges.append(json.loads(line))

    
    cat_colors = {
        "agents": "#2c3e50", "skills": "#e67e22", "docs": "#3498db", 
        "rules": "#2ecc71", "templates": "#9b59b6", "archive": "#95a5a6", 
        "coretext": "#e74c3c", "src": "#1abc9c", "tests": "#f1c40f"
    }

    mermaid = ["graph LR"]
    for cat, color in cat_colors.items():
        text_color = "white" if cat in ["agents", "coretext", "templates"] else "black"
        mermaid.append(f"    classDef {cat} fill:{color},stroke:#333,stroke-width:1px,color:{text_color};")

    def get_category(path):
        if path.startswith(".gemini/agents/"): return "agents"
        if path.startswith(".agents/skills/"): return "skills"
        if path.startswith("docs/archive/"): return "archive"
        if path.startswith("docs/superpowers/plans/"): return "docs"
        if path.startswith("docs/superpowers/specs/"): return "docs"
        if path.startswith("docs/handoffs/"): return "docs"
        if path.startswith("docs/rules/"): return "rules"
        if path.startswith("docs/templates/"): return "templates"
        if path.startswith("docs/"): return "docs"
        if path.startswith("coretext.jsonl"): return "coretext"
        if path.startswith("src/"): return "src"
        if path.startswith("tests/"): return "tests"
        return "docs"

    nodes = set()
    for edge in edges:
        source = edge['source']; target = edge['target']; etype = edge['type']
        hook = edge.get('hook', 'both')
        nodes.add(source); nodes.add(target)
        s_id = source.replace('.', '_').replace('/', '_').replace('-', '_')
        t_id = target.replace('.', '_').replace('/', '_').replace('-', '_')
        edge_label = f"{etype} ({hook})"
        mermaid.append(f"    {s_id}[\"{source}\"] -->|\"{edge_label}\"| {t_id}[\"{target}\"]")

    for node in nodes:
        n_id = node.replace('.', '_').replace('/', '_').replace('-', '_')
        cat = get_category(node)
        mermaid.append(f"    class {n_id} {cat}")

    return "\n".join(mermaid)

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    jsonl_path = script_dir / "coretext.jsonl"
    output_path = script_dir.parent / "docs" / "coretext" / "graph.md"

    if not jsonl_path.exists():
        print(f"Error: {jsonl_path} not found.")
        sys.exit(1)
        
    content = [
        "# Coretext Structural Graph",
        "",
        "This graph visualizes the structural context injection edges defined in `coretext.jsonl`.",
        "",
        "```mermaid",
        generate_mermaid(jsonl_path),
        "```",
        ""
    ]
    with open(output_path, "w") as f:
        f.write("\n".join(content))
    print(f"Successfully generated {output_path}")
