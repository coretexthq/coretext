import sys
import os
from pathlib import Path

# Add .coretext to sys.path so we can import coretext_engine
sys.path.insert(0, str(Path(".coretext").resolve()))

from coretext_engine import CoretextEngine

def test():
    engine = CoretextEngine(".coretext")
    
    print("=== TESTING FOLDER TO FOLDER (hint) ===")
    res1 = engine.add_rules("docs", ".coretext", "hint", "test folder hint")
    print("res1:", res1)
    print(engine.render_context_payload("docs/ARCHITECTURE.md", "read"))

    print("\n=== TESTING FOLDER TO FILE (full) ===")
    res2 = engine.add_rules("docs/coretext", ".coretext/coretext_schema.json", "full", "test folder to file full")
    print("res2:", res2)
    print(engine.render_context_payload("docs/coretext/coretext_flowchart.md", "read"))

if __name__ == "__main__":
    test()
