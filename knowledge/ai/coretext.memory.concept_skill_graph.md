# The Concept-Skill Graph Architecture

## Summary
The conversation analyzed the "Rise and Fall" of multi-agent frameworks, moving from rigid, predefined workflows (LangChain, LangGraph) to the current "Spec-Driven Development" (SDD) era (bmad, speckit, obra/superpowers). The core thesis is that as agent intelligence increases, the need for rigid frameworks decreases, leading to an architectural "thinning" where human-readable Markdown specs and CLI-native "Agent Skills" are replacing complex MCP servers and black-box frameworks.

### Key Breakthroughs
- **The Intelligence-Flexibility Inversion:** Higher agent intelligence reduces the need for imperative scripting. The framework moves from telling the agent *how* to move (Rigid DAGs) to defining *where* to go (Goals/Specs).
- **The "Human Moat":** "Taste," "Experience," and "Pain-point understanding" remain uniquely human within the near future, as models lack "World Models" (embodied experience). The human role shifts from writing code to curating the agent's world model and applying taste to the artifacts produced.
- **From SDD to Concept-Skill Graph:** Markdown-based specs (SDD) act as "soft" guardrails that may limit future smarter models. The logical successor is a **Concept-Skill Graph**: a high-density semantic network where "Concepts" (centroids of meaning) are linked by "Skills" (deterministic executable transitions).
- **The "Necessary Hack":** While "Latent Space" experience (weights-based memory) is the ultimate AGI destination, externalized memory (Knowledge Graphs in SurrealDB) is a necessary bridge to provide **Observability, Determinism, and Portability** (the "Digital Soul") across different models.

### Architectural Path
1. **Past:** Imperative chains (LangChain).
2. **Present:** Goal-oriented Specs (Markdown/SDD).
3. **Future (Thesis):** Declarative Concept-Skill Graphs (CoreText/SurrealDB).
4. **Endgame:** Native Latent Space Intuition (No external memory).

## Related Notes
- [[KISS in Claude Code]]
- [[Coding Agent Capability]]
- [[CLI Coding Agent]]
- [[Prioritize user control]]
- [[Gemini CLI Extensions vs Agent Skills]]
- [[Agno + SurrealDB vs LangGraph + Neo4j + LLama Index]]
- [[JSON AST for LLM to KG]]
- [[Agentic Agile]]
- [[Claude Code Daily Workflows]]
- [[Better knowledge for CLI Coding Agent]]
- [[Dual Memory Agent Workflow]]
- [[Abstraction Layers]]
- [[A Definition of AGI]]
- [[how companion]]
- [[Agent Skills]]
- [[Graphiti]]
- [[Gemini CLI Context Engineering]]
- [[AI surpassing von Neumann architecture]]
- [[Graphiti MCP Server]]
- [[how ChatGPT store saved info]]
- [[MCP vs API]]
- [[LLM+KG]]
- [[Why AI Coding is Dangerous]]
- [[Multi-hop Reasoning]]
- [[AI evolution via dimensions of input]]
- [[companion 250922]]
- [[A summer conversation]]
- [[Origin of Greatness]]

## Original Prompts Reference
> discuss with me. about the rise and fall of so many multi agent frameworks. i can name so many, from the first llm, the frameworks like langchain, crewai, autogen, langgraph, agno, n8n, make, etc. so many more. but i feel like they are not as trending as it used to be. there is this rise of agentic coding tools, like codex, claude code, that maybe work in teams of agent in a more flexible way? then now i see an upcoming other type of multi agent framework, but now it's more agile and portable and flexible, like bmad, obra/superpowers, beads, speckit, openspec, etc, following the new spec driven development principle. but will it be falling again? i think as the model gets smarter, the less frameworks in need, so the frameworks are turning less and less rigid, from predefined workflow, to agentic workflow where agent can make more dicision on the workflows. i see this trend will continue. the frameworks will get even more flexible. and i see agent skills will stick around for a while. the concept before it, mcp servers, are also getting replaced by cli tools. i see this trend of rising cli coding agent, with the philosophy "give them the tools humans have access to" and also i see a rise of cli tools, together with agent skills, which i feel also more flexible than mcp servers. search the internet for relevant newest information, and across my knowledge base for my past notes. focus on this main thesis: the more intelligent the agent become, the less rigid frameworks it need to do the work

> i think there will be a point, where there is actual friction only human have. which is actual experience. maybe until world model exist with models having its own experiences. so what would be the logical next step? will these already-flexible spec frameworks evolve? maybe somehow it will become just "keywords" and "intention" and AI will get smart enough (agentic intuition) that it can do the correct thing, especially within the context, with out the need of predefined spec structure, it will just figure out. only "taste" and "experience" and "pain point understanding" from real world experience will remain uniquely human within the near future. these spec frameworks should be expected into something like that? because still, i feel like the prompts in markdown files are still acting as guardrails limiting future smarter models. maybe just a few keywords is enough? or at least broken down to something like a network of skills (which the llm agent has not been trained on), but how the skills are connected must be extremely flexible. currently, with these spec frameworks, the skills are still somewhat flexibly connected by markdown instructions files. but i feel like, also it should be flexible, actual connection but be factual, like deterministic, not stochastic like a markdown prompt explaining "execute task A with template B using skill C, then task D with template E using skill F", but we need something more structured? because, also, my thesis is that text, in markdown files or not, are poorly structured network of knowledge. do we need a better type of structure?

> dont praise my own notes too much. be objective. i personally believe graph is the future space replacing markdown files for agent memory, and i'm engineering a solution with coretext to represent that. but it's hard. using surrealdb, for example, is heavy. human minds works like that, right? in graph not in text. but building a good semantic graph is hard. i dont think buidling a graph in the traditional sense, like A --lives_in--> B is not enough, it's too atomic and make things heavy, with too many nodes and connection. my thesis is that the optimal structure is close to how human mind remember, as connected concepts. is it correct? a graph of concepts, or in this case, i feel like a combination of skills and concepts is enough for the graph. am i imagine something that is both flexible but deterministic, the only way? or just continue scaling with markdown files and well prompt-engineered instructions is enough? discuss deep with me

> so are we coming to the next step, from spec-driven-development and skills, to my thesis, concept-skill graph? is it logical enough, and fit the overall evolution, rise and fall, we discussed earlier? and we also need to accept that the latent space concept is probably a better solution, like doing actual thing instead of hacking like me currently? evaluate that thesis, to see if it fits the historical development
