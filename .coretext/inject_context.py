import sys
import json
from pathlib import Path
from coretext_engine import CoretextEngine

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"decision": "allow"}))
            return
            
        payload = json.loads(input_data)
        
        # Extract file_path and action from the hook payload
        toolName = payload.get("toolName", payload.get("request", {}).get("name", ""))
        action = "write" if "write" in toolName or "replace" in toolName else "read"
        
        file_path = None
        params = payload.get("toolParameters", payload.get("request", {}).get("parameters", {}))
        
        if "file_path" in params:
            file_path = params["file_path"]
        elif "AbsolutePath" in params:
            file_path = params["AbsolutePath"]
        elif "TargetFile" in params:
            file_path = params["TargetFile"]
            
        if not file_path:
            # If we can't find the file path, just allow the tool to proceed normally
            print(json.dumps({"decision": "allow"}))
            return

        # Initialize the Coretext Engine
        script_dir = Path(__file__).parent
        engine = CoretextEngine(str(script_dir))
        
        # Check if there is any rules linked to this file
        context_payload = engine.render_context_payload(file_path, action)
        
        if context_payload:
            # Inject the context!
            response = {
                "decision": "allow",
                "hookSpecificOutput": {
                    "additionalContext": context_payload
                }
            }
            print(json.dumps(response))
        else:
            # No context for this file, proceed normally
            print(json.dumps({"decision": "allow"}))
            
    except Exception as e:
        # On error, log to stderr so the user can debug, but do not block the agent's tool call
        print(f"Coretext Injection Hook Error: {e}", file=sys.stderr)
        print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()
