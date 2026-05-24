## Summary
This note summarizes the git commit history in the EvoClaw-auth-recovery branch from commit 600b01a to b399033. The changes primarily focus on improving the performance and authentication of the Gemini CLI agent within the testing harness, managing submodule data, and tweaking container resource limits. 

## Highlights
- 

## Problems & Solutions
- **Problem**: Running the Gemini CLI agent in a Docker container required an API key and could not reuse an existing authenticated session from the host machine.
  - **Solution**: Added support for the `GEMINI_CLI_HOME` environment variable in `harness/e2e/agents/gemini.py` (commit `600b01a`). This mounts the host's `.gemini` configuration directory into `/home/fakeroot/.gemini` inside the container, enabling persistent authentication without an API key.
- **Problem**: The `gemini.py` agent script was extremely inefficient when patching Gemini CLI configs because it searched the entire root file system (`/`) recursively for `defaultModelConfigs.js`.
  - **Solution**: Scoped the `glob.glob` search explicitly to `/usr/lib/node_modules` and `/usr/local/lib/node_modules` (commit `015e705`), preventing massive I/O traversal and potential permission errors.
- **Problem**: The evaluator container could consume excessive CPU resources during end-to-end testing.
  - **Solution**: Reduced the default Docker CPU limit to 8 (commit `b399033`).
- **Problem**: The test data and classification results in the project needed alignment with the latest project milestones.
  - **Solution**: Updated the `EvoClaw-data` submodule pointer and test configurations (commits `f97f81b` and `015e705`).

## Related Notes
- 

## Original Prompts Reference
write a summary for the changes in commit 600b01a to commit b399033 and the commits in between