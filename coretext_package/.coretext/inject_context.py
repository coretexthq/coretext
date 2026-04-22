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
        toolName = payload.get("tool_name", payload.get("toolName", payload.get("request", {}).get("name", "")))
        action = "write" if "write" in toolName or "replace" in toolName else "read"
        
        file_path = None
        params = payload.get("tool_input", payload.get("toolParameters", payload.get("request", {}).get("parameters", {})))
        
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
        hints = context_payload.get("hints", "")
        full_files = context_payload.get("full_files", "")
        
        if hints or full_files:
            # Extract session ID for namespacing
            session_id = payload.get("session_id", "default")
            
            # Check if this is a BeforeTool hook (which applies to write/replace now)
            hookType = payload.get("hook_event_name", payload.get("hookType", ""))
            is_before_tool = hookType == "BeforeTool"
            
            if is_before_tool and action == "write" and full_files:
                ack_file = script_dir / f".acknowledged_paths_{session_id}"
                acknowledged = False
                
                # Check if this file path has already been acknowledged
                if ack_file.exists():
                    try:
                        with open(ack_file, "r") as f:
                            lines = f.read().splitlines()
                            if file_path in lines:
                                acknowledged = True
                                # Leave it in the file so it remains acknowledged for the rest of the session
                    except Exception:
                        pass
                
                if not acknowledged:
                    # Not yet acknowledged, record that we rejected it
                    try:
                        with open(ack_file, "a") as f:
                            f.write(file_path + "\n")
                    except Exception:
                        pass
                        
                    # Disruptive hook: Reject the write action and force the agent to read the context
                    combined_payload = hints + "\n\n" + full_files if hints else full_files
                    response = {
                        "decision": "deny",
                        "reason": f"ACTION BLOCKED: You must read and acknowledge the following architectural rules before creating or modifying this file.\n\nPlease read the rules below. Once you understand them, simply retry your write/replace tool call exactly as you just did, and it will be allowed to proceed.\n\n{combined_payload}"
                    }
                else:
                    # Path was already acknowledged, allow the action
                    response = {
                        "decision": "allow"
                    }
            elif not is_before_tool and hints:
                # Standard AfterTool injection with just hints
                response = {
                    "decision": "allow",
                    "hookSpecificOutput": {
                        "additionalContext": hints
                    }
                }
            else:
                response = {
                    "decision": "allow"
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
