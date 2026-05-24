## Summary
Setup EvoClaw for parallel trial runs on the ripgrep repository using gemini-cli and gemini-3-flash-preview. Modified the harness to optionally inject the coretext_package into the container's workspace based on the EVOCLAW_CORETEXT environment variable, and resolved macOS Docker mount issues alongside f-string template evaluation bugs.

## Highlights
- 

## Problems & Solutions
- **Problem**: The gemini-cli agent container failed to authenticate or find the session history when using a relative path for the isolated auth directory.
  - **Solution**: Used an absolute path (`/private/tmp/evoclaw-gemini-auth`) for the `GEMINI_CLI_HOME` mount to bypass macOS symlink issues with Docker.
- **Problem**: The trial failed initially because the model name `gemini-3.0-flash` was incorrect or unavailable.
  - **Solution**: Updated the configuration to use `gemini-3-flash-preview` based on user request.
- **Problem**: Need to run parallel experiments (one with Coretext injected, one without) without duplicating the entire agent framework code.
  - **Solution**: Refactored `harness/e2e/agents/gemini.py` to make the Coretext injection logic conditional on the `EVOCLAW_CORETEXT` environment variable and created two separate config files (`trial_config_baseline.yaml`, `trial_config_coretext.yaml`).
- **Problem**: The container initialization script generated a `NameError` on the host side because Python evaluated f-string variables (e.g., `{node_version}`, `{stderr}`) intended for the container script.
  - **Solution**: Escaped the curly braces (`{{node_version}}`, `{{stderr}}`, etc.) inside the Python f-string template in `gemini.py`.

## Related Notes


## Original Prompts Reference
- `read @docs/setup.md and @docs/advanced.md and @docs/running-trials.md and @docs/gemini-cli-auth.md and @README.md and prepare for a trial run with gemini-cli and gemini 3 flash. perform any missing setup steps`
- `modify it to work with only the repo griprep, and make sure to always use uv run (add an agents.md file specifying that)`
- `start now`
- `there are some errors, so i have to clean up the auth folder following gemini-cli-auth.md, now clean up past run to run a new trial run`
- `i have logged in. help me delete the log in .evoclaw and run the force command to overwrite for me`
- `change the model to gemini-3-flash-preview`
- `continue`
- `continue`
- `i need to include the files and folder within @../coretext--trasition-to-sdd/coretext_package/** into the workspace (the testbed not the home/fakeroot/ right?), how can i modify gemini.py to include it during config for this`
- `so is it testbed/coretext_package/? it should be testbed/.coretext and testbed/.gemini/settings.json`
- `what are you doing`
- `wait, no. why did you restart? i want 2 seperate experiments in parallel. find a way to run the trial run with gemini.py with and without coretext. by the way, check if the current file gemini.py is correct`
- `continue`
- `what if i change auth account? do i have to restart both?`
- `Use the skill summary`
