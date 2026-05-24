# Coretext EvoClaw

## Status
- Coretext treats EvoClaw as benchmark with added auth method and trial setup integrating coretext.
## Key Integrations
- **Auth Recovery:** Gemini CLI Auth handling within the EvoClaw context.
- **Trial Setup:** Injecting Coretext "laws" into cold-booted subagents during EvoClaw trials.

## Resource
- [[coretext.evoclaw.auth]]
- [[coretext.evoclaw.trial_setup]]
- [[EvoClaw]]

**Gemini CLI**
```bash
cd ~/Git/.worktrees/EvoClaw--auth-recovery && gemini -m gemini-3.1-pro-preview --include-directories ~/Git/knowledge/project/coretext
```
**Antigravity CLI**
```bash
cd ~/Git/.worktrees/EvoClaw--auth-recovery && agy --add-dir ~/Git/knowledge/project/coretext
```
**Codex CLI**
```bash
cd ~/Git/.worktrees/EvoClaw--auth-recovery && codex --add-dir ~/Git/knowledge/project/coretext
```
