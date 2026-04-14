import json
import sys
from pathlib import Path

def generate_mermaid(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

    edges = data.get('edges', [])
    
    operational_edges = [
        (".gemini/agents/planner.md", "docs/ARCHITECTURE.md", "read"),
        (".gemini/agents/planner.md", "tests/unit/test_auth.py", "modify"),
        (".gemini/agents/planner.md", "docs/superpowers/specs/target_state.md", "modify"),
        (".gemini/agents/planner.md", "docs/superpowers/plans/atomic_step.md", "modify"),
        (".gemini/agents/executor.md", "docs/superpowers/specs/target_state.md", "read"),
        (".gemini/agents/executor.md", "docs/superpowers/plans/atomic_step.md", "read"),
        (".gemini/agents/executor.md", "tests/unit/test_auth.py", "read"),
        (".gemini/agents/executor.md", "src/api/auth.py", "modify"),
        (".gemini/agents/executor.md", "docs/handoffs/handoff.md", "modify"),
        (".gemini/agents/reviewer.md", "docs/superpowers/specs/target_state.md", "read"),
        (".gemini/agents/reviewer.md", "docs/superpowers/plans/atomic_step.md", "read"),
        (".gemini/agents/reviewer.md", "tests/unit/test_auth.py", "read"),
        (".gemini/agents/reviewer.md", "src/api/auth.py", "read"),
        (".gemini/agents/reviewer.md", "docs/handoffs/handoff.md", "read"),
        (".gemini/agents/reviewer.md", "docs/knowledge/bcrypt_rounds.md", "modify"),
        (".gemini/agents/reviewer.md", "docs/ARCHITECTURE.md", "modify"),
        (".gemini/agents/reviewer.md", "changelog.md", "modify"),
        (".gemini/agents/reviewer.md", "experience.json", "modify"),
    ]

    # Map nodes to subgraphs for grouping
    subgraphs = {
        "Planning_Phase": [".gemini/agents/planner.md", "docs/superpowers/specs/target_state.md", "docs/superpowers/plans/atomic_step.md", "tests/unit/test_auth.py"],
        "Execution_Phase": [".gemini/agents/executor.md", "src/api/auth.py", "docs/handoffs/handoff.md"],
        "Review_Audit_Phase": [".gemini/agents/reviewer.md", "docs/knowledge/bcrypt_rounds.md", "experience.json", "changelog.md", "docs/archive/handoff_001.md", "docs/archive/spec_001.md"],
        "Global_Reference": ["docs/ARCHITECTURE.md", "docs/testing.md", ".agents/skills/test-driven-development/SKILL.md", "docs/templates/knowledge_template.md"]
    }

    cat_colors = {
        "agents": "#2c3e50", "skills": "#e67e22", "docs": "#3498db", 
        "knowledge": "#2ecc71", "templates": "#9b59b6", "archive": "#95a5a6", 
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
        if path.startswith("docs/knowledge/"): return "knowledge"
        if path.startswith("docs/templates/"): return "templates"
        if path.startswith("docs/"): return "docs"
        if path.startswith("experience.json"): return "coretext"
        if path.startswith("src/"): return "src"
        if path.startswith("tests/"): return "tests"
        return "docs"

    nodes_in_graph = set()
    # Pre-calculate all nodes
    for edge in edges:
        nodes_in_graph.add(edge['source']); nodes_in_graph.add(edge['target'])
    for s, t, _ in operational_edges:
        nodes_in_graph.add(s); nodes_in_graph.add(t)

    # Generate Subgraphs
    for name, files in subgraphs.items():
        mermaid.append(f"    subgraph {name}")
        for f in files:
            if f in nodes_in_graph:
                f_id = f.replace('.', '_').replace('/', '_').replace('-', '_')
                mermaid.append(f"        {f_id}[\"{f}\"]")
        mermaid.append("    end")

    # Add Structural Edges
    for edge in edges:
        source = edge['source']; target = edge['target']; etype = edge['type']
        s_id = source.replace('.', '_').replace('/', '_').replace('-', '_')
        t_id = target.replace('.', '_').replace('/', '_').replace('-', '_')
        mermaid.append(f"    {s_id} -->|{etype}| {t_id}")

    # Add Operational Edges
    for source, target, etype in operational_edges:
        s_id = source.replace('.', '_').replace('/', '_').replace('-', '_')
        t_id = target.replace('.', '_').replace('/', '_').replace('-', '_')
        mermaid.append(f"    {s_id} -.->|{etype}| {t_id}")

    # Apply classes
    for node in nodes_in_graph:
        n_id = node.replace('.', '_').replace('/', '_').replace('-', '_')
        cat = get_category(node)
        mermaid.append(f"    class {n_id} {cat}")

    return "\n".join(mermaid)

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    json_path = script_dir / "experience.json"
    output_path = script_dir.parent / "docs" / "coretext" / "lifecycle.md"

    if not json_path.exists():
        print(f"Error: {json_path} not found.")
        sys.exit(1)
        
    content = [
        "# Coretext Lifecycle Graph",
        "",
        "This graph visualizes the agent operational lifecycle (read/modify) on top of the structural dependencies, grouped by phase.",
        "",
        "```mermaid",
        generate_mermaid(json_path),
        "```",
        ""
    ]
    with open(output_path, "w") as f:
        f.write("\n".join(content))
    print(f"Successfully generated {output_path}")
