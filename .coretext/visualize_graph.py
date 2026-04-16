import json
import sys
from pathlib import Path

def generate_mermaid(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

    edges = data.get('edges', [])
    
    cat_colors = {
        "agents": "#2c3e50", "skills": "#e67e22", "docs": "#3498db", 
        "rules": "#2ecc71", "templates": "#9b59b6", "archive": "#95a5a6", 
        "coretext": "#e74c3c", "src": "#1abc9c", "tests": "#f1c40f"
    }

    mermaid = ["graph TD"]
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
        if path.startswith("coretext.json"): return "coretext"
        if path.startswith("src/"): return "src"
        if path.startswith("tests/"): return "tests"
        return "docs"

    nodes = set()
    for edge in edges:
        source = edge['source']; target = edge['target']; etype = edge['type']
        nodes.add(source); nodes.add(target)
        s_id = source.replace('.', '_').replace('/', '_').replace('-', '_')
        t_id = target.replace('.', '_').replace('/', '_').replace('-', '_')
        mermaid.append(f"    {s_id}[\"{source}\"] -->|{etype}| {t_id}[\"{target}\"]")

    for node in nodes:
        n_id = node.replace('.', '_').replace('/', '_').replace('-', '_')
        cat = get_category(node)
        mermaid.append(f"    class {n_id} {cat}")

    return "\n".join(mermaid)

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    json_path = script_dir / "coretext.json"
    output_path = script_dir.parent / "docs" / "coretext" / "graph.md"

    if not json_path.exists():
        print(f"Error: {json_path} not found.")
        sys.exit(1)
        
    content = [
        "# Coretext Structural Graph",
        "",
        "This graph visualizes the structural context injection edges defined in `coretext.json`.",
        "",
        "```mermaid",
        generate_mermaid(json_path),
        "```",
        ""
    ]
    with open(output_path, "w") as f:
        f.write("\n".join(content))
    print(f"Successfully generated {output_path}")
