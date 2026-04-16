import argparse
import sys
from pathlib import Path
from coretext_engine import CoretextEngine

def main():
    parser = argparse.ArgumentParser(description="Add an edge to the Coretext Coretext Graph")
    parser.add_argument("--source", required=True, help="Source file path (e.g., src/api/auth.py)")
    parser.add_argument("--target", required=True, help="Target rules/docs file path (e.g., rules/rule.md)")
    parser.add_argument("--type", default="rules", help="Edge type (e.g., rules, docs)")
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    engine = CoretextEngine(str(script_dir))
    
    success, err = engine.add_rules(args.source, args.target, args.type)
    if success:
        print(f"Successfully added edge: {args.source} -> {args.target} ({args.type})")
    else:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
