import sys
import json
import os
import datetime

def normalize_path(abs_path):
    project_dir = os.environ.get('GEMINI_PROJECT_DIR', '')
    if project_dir and abs_path.startswith(project_dir):
        rel_path = abs_path[len(project_dir):].lstrip('/')
        return rel_path
    return abs_path

def main():
    try:
        # Read the JSON payload from stdin
        payload_str = sys.stdin.read()
        
        debug_path = os.path.join(os.environ.get('GEMINI_PROJECT_DIR', os.getcwd()), '.coretext', 'payload_debug.log')
        with open(debug_path, "a") as f:
            f.write("EXECUTED! Payload: " + payload_str + "\n")
            
        if not payload_str:
            print(json.dumps({}))
            return
            
        payload = json.loads(payload_str)
        session_id = payload.get('session_id', 'default_session')
        
        # Extract file path from tool_input
        tool_input = payload.get('tool_input', {})
        file_path = tool_input.get('file_path', '')
        
        if not file_path:
            print(json.dumps({}))
            return
            
        # Normalize path to match the graph nodes
        node_id = normalize_path(file_path)
        
        # Prepare the sessions directory
        project_dir = os.environ.get('GEMINI_PROJECT_DIR', os.getcwd())
        sessions_dir = os.path.join(project_dir, '.coretext', 'sessions')
        os.makedirs(sessions_dir, exist_ok=True)
        
        # Write to the current session's history JSONL file
        history_file = os.path.join(sessions_dir, f"session_{session_id}.jsonl")
        
        entry = {
            "node_id": node_id,
            "timestamp": datetime.datetime.now().isoformat(),
            "tool_name": payload.get('tool_name', 'unknown')
        }
        
        with open(history_file, 'a') as f:
            f.write(json.dumps(entry) + '\n')
            
    except Exception as e:
        # Silently fail so we don't break the agent's flow
        print(f"Hook error: {str(e)}", file=sys.stderr)
    
    # Always return empty JSON object to signify success without modifying tool response
    print(json.dumps({}))

if __name__ == "__main__":
    main()
