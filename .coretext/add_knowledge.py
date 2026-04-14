import argparse
import sys
from pathlib import Path
from experience_engine import ExperienceEngine

def main():
    parser = argparse.ArgumentParser(description="Add an edge to the Coretext Experience Graph")
    parser.add_argument("--source", required=True, help="Source file path (e.g., src/api/auth.py)")
    parser.add_argument("--target", required=True, help="Target knowledge/docs file path (e.g., knowledge/rule.md)")
    parser.add_argument("--type", default="knowledge", help="Edge type (e.g., knowledge, docs)")
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    engine = ExperienceEngine(str(script_dir))
    
    success, err = engine.add_knowledge(args.source, args.target, args.type)
    if success:
        print(f"Successfully added edge: {args.source} -> {args.target} ({args.type})")
    else:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
