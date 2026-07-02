#!/usr/bin/env uv run
# /// script
# requires-python = ">=3.11"
# ///

import json
import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser(
        description="Remove specified nodes and their connected edges from a JSON Canvas file.",
        epilog="""
Exit codes:
  0: Success (nodes removed, or already absent).
  1: File missing or access error.
  2: Invalid JSON format.
  3: Other execution error.
        """,
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("canvas_path", help="Path to the .canvas file")
    parser.add_argument("node_ids", nargs='+', help="List of node IDs to remove")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without saving")
    parser.add_argument("--verbose", action="store_true", help="Print detailed progress to stderr")
    args = parser.parse_args()

    if not os.path.exists(args.canvas_path):
        print(f"Error: Canvas file not found at {args.canvas_path}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(args.canvas_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON canvas file - {e}", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"Error: Failed to read file - {e}", file=sys.stderr)
        sys.exit(3)
    
    ids_to_remove = set(args.node_ids)
    
    # Process Nodes
    original_nodes = data.get('nodes', [])
    original_node_count = len(original_nodes)
    data['nodes'] = [node for node in original_nodes if node.get('id') not in ids_to_remove]
    removed_node_count = original_node_count - len(data['nodes'])
    
    # Process Edges (Remove dangling edges connected to removed nodes)
    original_edges = data.get('edges', [])
    original_edge_count = len(original_edges)
    data['edges'] = [
        edge for edge in original_edges
        if edge.get('fromNode') not in ids_to_remove and edge.get('toNode') not in ids_to_remove
    ]
    removed_edge_count = original_edge_count - len(data['edges'])

    if removed_node_count == 0 and removed_edge_count == 0:
        if args.verbose:
            print("Notice: No matching nodes or edges found to remove. File is unchanged.", file=sys.stderr)
        # Idempotency: Return success even if nothing to do.
        print(json.dumps({"status": "unchanged", "removed_nodes": 0, "removed_edges": 0}))
        sys.exit(0)

    # Save changes
    if not args.dry_run:
        try:
            with open(args.canvas_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent='\t', ensure_ascii=False)
        except Exception as e:
            print(f"Error: Failed to write changes to {args.canvas_path} - {e}", file=sys.stderr)
            sys.exit(3)
    
    if args.verbose:
        action = "Would remove" if args.dry_run else "Removed"
        print(f"{action} {removed_node_count} node(s) and {removed_edge_count} connected edge(s).", file=sys.stderr)

    # Output structured data to stdout
    result = {
        "status": "dry_run" if args.dry_run else "success",
        "removed_nodes": removed_node_count,
        "removed_edges": removed_edge_count
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
