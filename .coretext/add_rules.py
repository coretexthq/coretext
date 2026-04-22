import argparse
import sys
from pathlib import Path
from coretext_engine import CoretextEngine

def main():
    parser = argparse.ArgumentParser(description="Add an edge to the Coretext Graph")
    parser.add_argument("--source", required=True, help="Source file path or glob pattern (e.g., src/api/*.py)")
    parser.add_argument("--target", required=True, help="Target file path (e.g., docs/ARCHITECTURE.md)")
    parser.add_argument("--type", choices=["full", "hint"], default="hint", help="Edge injection type (full or hint)")
    parser.add_argument("--description", default="", help="Agent intent or description (e.g., 'use')")
    parser.add_argument("--hook", choices=["read", "write", "both"], default="both", help="When to inject (read, write, or both)")
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    engine = CoretextEngine(str(script_dir))
    
    success, err = engine.add_rules(args.source, args.target, args.type, args.description, args.hook)
    if success:
        print(f"Successfully added edge: {args.source} [{args.description}] -> {args.target} ({args.type}, hook: {args.hook})")
    else:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
