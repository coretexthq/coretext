[[EvoClaw.pdf]]

# Highlights
## Deep Commit
![](https://arxiv.org/html/2603.13428v1/x1.png)
 
## EvoClaw
- **7 individual repositories** (such as _scikit-learn_, _Dubbo_, and _ripgrep_)
- decouples roadmap planning from implementation
- Repo Difficulty
	- **Complexity and Scale**
	- **Structural and Topological Challenges**
		- **number of milestones** (ranging from 9 to 23 per repo)
		- **density of dependencies** (9 to 28 inter-milestone dependencies)
	- **Code and Specification Volume**
		- **Lines of Code (LOC)** changed
		- length of the **Software RequirementSpecifications (SRS)**
	- **Exploration Burden**
- ripgrep
	- **Highest Success Rates:** In per-repository scoring, **ripgrep** consistently yielded the highest scores across all evaluated models.
	- **Lowest Complexity:** It is the smallest repository in the benchmark with only **159 source files** and the smallest total code changes (1,474 delta LOC).
	- **Task manageable:** The average milestone in ripgrep modifies only 5.5 files and has the shortest gold patch (134 LOC) on average.
- context window relevance: requires agents to maintain system integrity and architectural consistency over a **persistent, long-horizon development cycle**
	- **Context Window Size:** Evaluated models utilize large context windows to handle extensive development histories, such as **Claude (200K tokens)**, **GPT-5 series (272K tokens)**, and **Gemini (1M tokens)**.
	- **Context Management and Compaction:** Because continuous evolution can exceed even large windows, agent frameworks use strategies like **automatic context compaction** (summarizing prior history) and **eviction** (removing specific tool results) to prevent catastrophic context overflow.
	- **Context Wave Patterns:** Behavioral analysis shows "context wave" patterns where usage is stable and controllable. Exploration surges at the start of new milestones or after heavy compaction as the agent works to rebuild its mental model of the repository.
	- **Reusing Established Context:** In the middle phases of evolution, agents often perform more efficiently by reusing established context, which bypasses the redundant exploration required in independent, "stateless" evaluations.
	- **Impact of Technical Debt:** As evolution progresses, the "snowball effect" of accumulated errors increases the "information acquisition" cost, eventually overwhelming the agent's capacity to maintain a productive development state within its context.
2 evaluation settings:

|Feature|Continuous Task Evaluation (EvoClaw)|Independent Task Evaluation (Baseline)|
|---|---|---|
|**Environment State**|**Stateful/Persistent**: Modifications from each task persist into the next.|**Stateless/Reset**: The environment resets to a canonical codebase snapshot after each task.|
|**Task Delivery**|**Streaming**: Requirements arrive as a stream; an external planner dynamically unlocks tasks based on a dependency graph.|**Isolated**: Each milestone is treated as a one-off, independent task.|
|**Primary Challenges**|**Compounding effects**: Requires managing technical debt and preventing error accumulation/propagation.|**Direct implementation**: Difficulty is limited to inherent task complexity rather than cumulative history.|
|**Performance Gap**|**Significant degradation**: Frontier model scores drop to at most ~38% with very low resolve rates (~13%).|**High scores**: Models exhibit high performance (e.g., >80% or as high as 93.2% for specific models).|
|**Effort Allocation**|**Fluctuating**: Effort rises in late stages due to extensive debugging and error-recovery needs.|**Constant/Redundant**: Every task requires full exploration from scratch.|
|**Evaluation Goal**|**Long-term maintenance**: Assesses the ability to sustain system integrity and architectural consistency over time.|**Short-horizon completion**: Primarily measures an agent's ability to solve a specific localized issue.|
