import sys
import json
from pathlib import Path
from coretext_engine import CoretextEngine

def main():
    try:
        input_data = sys.stdin.read()
        print(f"DEBUG INJECT_CONTEXT RAW PAYLOAD: {input_data}", file=sys.stderr)
        
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
        
        if context_payload:
            # Check if this is a BeforeTool hook (which applies to write/replace now)
            hookType = payload.get("hook_event_name", payload.get("hookType", ""))
            is_before_tool = hookType == "BeforeTool"
            
            if is_before_tool and action == "write":
                ack_file = script_dir / ".acknowledged_paths"
                acknowledged = False
                
                # Check if this file path has already been acknowledged
                if ack_file.exists():
                    try:
                        with open(ack_file, "r") as f:
                            lines = f.read().splitlines()
                            if file_path in lines:
                                acknowledged = True
                                lines.remove(file_path)
                                
                        # Only rewrite if we removed it
                        if acknowledged:
                            with open(ack_file, "w") as f:
                                if lines:
                                    f.write("\n".join(lines) + "\n")
                    except Exception:
                        pass
                
                if not acknowledged:
                    # Not yet acknowledged, reject it and record that we rejected it
                    try:
                        with open(ack_file, "a") as f:
                            f.write(file_path + "\n")
                    except Exception:
                        pass
                        
                    # Disruptive hook: Reject the write action and force the agent to read the context
                    response = {
                        "decision": "deny",
                        "reason": f"ACTION BLOCKED: You must read and acknowledge the following architectural rules before creating or modifying this file.\n\nPlease read the rules below. Once you understand them, simply retry your write/replace tool call exactly as you just did, and it will be allowed to proceed.\n\n{context_payload}"
                    }
                else:
                    # Path was found and removed, allow the action without further injection
                    response = {
                        "decision": "allow"
                    }
            else:
                # Standard AfterTool injection
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
