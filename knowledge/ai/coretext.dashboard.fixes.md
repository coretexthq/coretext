## Summary
Extracted problem-solution pairs from four previous AI session summaries regarding the Coretext Visualization Dashboard into formally structured Coretext rules (`docs/rules/`) and registered them via `.coretext/add_rules.py`. Following rule extraction, debugged and patched backend path resolution issues caused by moving the dashboard into the `.coretext/` directory. Further investigated a blank rendering issue, identifying an infinite React rendering loop in `CoretextGraph.tsx` caused by unnecessary re-renders of the d3-force simulation. Refactored the component to decouple the physics simulation layout from node highlighting state updates. Clarified the difference between `npm run dev` (frontend only) and `npm run start` (concurrent frontend and backend).

## Highlights
- 

## Problems & Solutions
- **Problem**: The dashboard was not recognizing `coretext--visualization.jsonl` or the `sessions/` directory after being moved into `.coretext/`.
  - **Solution**: Updated relative path resolutions in `server/index.js` by surgically replacing `../../.coretext` with `../../` to correctly point to the root workspace data.
- **Problem**: The React application displayed a blank screen and froze the browser due to an infinite rendering loop and ResizeObserver failure.
  - **Solution**: Refactored `CoretextGraph.tsx` to use a `structuralKey` (`useMemo`) to ensure the expensive d3-force physics simulation only runs when nodes or edges are added/removed, and added a separate `useEffect` to silently synchronize node highlighting state without triggering a re-layout.
- **Problem**: User was running `npm run dev` resulting in a blank screen because no data could be fetched.
  - **Solution**: Clarified that `npm run dev` only starts the Vite frontend, whereas `npm run start` runs `concurrently` to boot both the Express backend API and the Vite frontend simultaneously.

## Related Notes
- [[Coretext Visualization Dashboard#Problems & Solutions]] - Source for rule extraction.
- [[Visual Feedback Hook Implementation#Problems & Solutions]] - Source for rule extraction.
- [[Dashboard State & Graph Selection Features#Problems & Solutions]] - Source for rule extraction.
- [[Packaging Coretext Dashboard and Configs#Problems & Solutions]] - Source for rule extraction.

## Original Prompts Reference
**Prompt 1:**
continue the work in @/Users/mac/Git/knowledge/project/coretext/ai/Coretext\ Visualization\ Dashboard.md then @/Users/mac/Git/knowledge/project/coretext/ai/Visual\ Feedback\ Hook\ Implementation.md then @/Users/mac/Git/knowledge/project/coretext/ai/Dashboard\ State\ \&\ Graph\ Selection\ Features.md then @/Users/mac/Git/knowledge/project/coretext/ai/Packaging\ Coretext\ Dashboard\ and\ Configs.md for each problem-solution pair, create a rule

**Prompt 2:**
i think the visualization have some problem. it's not recognizing coretext--visualization.jsonl, or sessions/, maybe it's because the folder was moved to within .coretext? fix

**Prompt 3:**
it's still blank

**Prompt 4:**
continue

**Prompt 5:**
i realized, it's because i runned npm run dev, instead of npm run start. what's the difference?

**Prompt 6:**
use summary skill to write a summary