# /// script
# requires-python = ">=3.8"
# ///
import sys
import json
import datetime
from pathlib import Path
from runtime_hook_adapter import allow_response, parse_request


def main():
    # Deprecated: Visual telemetry is no longer captured in real-time.
    # Telemetry extraction is performed post-run via the export skill.
    print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()
