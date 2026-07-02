# Comprehensive Academic Review and Remediation Report: Context Routing Infrastructure for AI Coding Agents

## Executive Summary and Scope of the Review

This document presents an exhaustive academic, structural, and methodological review of the graduation thesis titled "Coretext - A File-Native Context Routing Infrastructure for AI Coding Agents," submitted to the School of Information and Communications Technology (SoICT) at Hanoi University of Science and Technology (HUST). The objective of this review is to evaluate the manuscript against rigorous academic standards, focusing on structural compliance with institutional guidelines, methodological validity, logical consistency, linguistic precision, and the integrity of data representation. The thesis tackles a highly relevant and complex domain concerning context routing, memory management, and workflow enforcement for repository-level artificial intelligence coding agents. However, a meticulous analysis reveals that the current manuscript exhibits substantial deficiencies that severely undermine its academic rigor and validity.

The analysis identifies critical vulnerabilities across the empirical evaluation design, particularly the reliance on a single case study with uncontrolled confounding variables that invalidate the primary metrics. Furthermore, the document is plagued by the pervasive use of unacademic language, hyperbolic claims, severe formatting anomalies that violate explicit HUST guidelines, and logical inconsistencies within its theoretical framework regarding the intersection of deterministic software constraints and probabilistic language model execution. This report systematically dissects these issues, providing granular diagnostic feedback and actionable remediation directives designed to elevate the manuscript to the standard expected of a rigorous scientific graduation thesis in the field of computer science.

## Formatting, Structural Compliance, and Institutional Presentation

Academic theses at the Hanoi University of Science and Technology must adhere to strict formatting and structural guidelines to ensure institutional consistency, professional presentation, and archival integrity. An analysis of the submitted manuscript reveals widespread non-compliance with these standard typographical and structural conventions, suggesting a severe breakdown in document compilation and template management.

### Front Matter and Cover Page Anomalies

The cover page serves as the formal academic identification of the research work, and institutional guidelines dictate a precise taxonomy of required information. Standard HUST graduation thesis guidelines necessitate the explicit inclusion of the Student ID alongside the student's full name, cohort information, specific major, specialization, and the formal designation of the supervisor. The current manuscript deviates significantly from these requirements. The cover page provides the student's name and an institutional email address ("minh.bn225509@sis.hust.edu.vn"), conflating the required distinct Student ID (20225509) with the email format. Furthermore, it omits critical cohort and specialization data entirely.

Compounding these omissions is a severe compilation error resulting in the dual inclusion of the cover page within the digital artifact. Page 1 and Page 2 are nearly identical, with the second iteration containing an awkwardly integrated signature line that lacks alignment with standard institutional templates. Such duplication in the finalized document indicates a lack of final proofreading and suggests an improper implementation of the LaTeX document class or Word template macro utilized for generation.

### Abstract Length and Formatting Violations

Institutional guidelines for graduation theses across academic disciplines explicitly cap abstracts at a strict maximum word count, universally recommended to be 350 words or fewer. The pedagogical purpose of an abstract is to distill the research problem, methodology, findings, and conclusion into a highly concise summary that allows other researchers to determine the relevance of the document. The abstract provided in the manuscript spans two full pages (Page 3 and Page 4) and significantly exceeds this strict limitation, functioning more as an executive summary or an abridged introduction.

The text delves into overly specific mechanistic details, such as naming "all 27 check predicates" and specifying a "5-spawn subagent budget," which belong in the methodology or evaluation chapters, not the abstract. The failure to synthesize the research into a concise format indicates a difficulty in separating the core scientific contribution from the engineering implementation details. A compliant abstract must maintain a professional tone, avoid excessive technical minutiae, and strictly adhere to the volumetric constraints of the institution.

### Pagination and Document Structure Disruption

The pagination in the front matter of the manuscript is fundamentally corrupted, indicating a severe misuse of LaTeX page numbering macros or manual page break errors. Standard academic templates require front matter to be numbered using lowercase Roman numerals, seamlessly transitioning to Arabic numerals for the primary chapters. The manuscript attempts this but fails catastrophically in its execution. The abstract begins on a page marked 'i' (Page 3), continues on a page marked 'ii' (Page 4), but the Table of Contents inexplicably begins with a subsequent page also marked 'ii' (Page 6).

This erratic pagination continues to degrade the navigational integrity of the document. The List of Figures jumps inexplicably to 'vii' and 'viii', the List of Tables to 'ix' and 'x', and the List of Abbreviations to 'xi' and 'xii'. Such a disjointed numbering sequence destroys document cohesion, making it impossible for a reviewer or future reader to reliably navigate the text using the index. This suggests the author manually manipulated page counters or misapplied the `\pagenumbering{roman}` command in LaTeX across multiple document parts without managing the continuous counter.

|**Document Section**|**Expected Pagination (Standard)**|**Actual Pagination in Manuscript**|**Deviation Impact**|
|---|---|---|---|
|Cover Page|Unnumbered|Unnumbered (Duplicated)|Presentation flaw|
|Abstract|i, ii|i (Page 3), ii (Page 4)|Correct initial numbering|
|Table of Contents|iii, iv, v|Unnumbered (Page 5), ii (Page 6)|Severe sequential break|
|List of Figures|vi, vii|vii (Page 11), viii (Page 12)|Disconnected counter|
|List of Tables|viii, ix|ix (Page 13), x (Page 14)|Disconnected counter|

### Table of Contents and Hierarchical Inconsistencies

The hierarchical structuring within the Table of Contents reveals improper heading depths and inconsistent casing conventions. In a rigorous academic document, the structural hierarchy must reflect logical groupings of concepts. Section 5.2 outlines "Contribution 1" with corresponding sub-sections 5.2.1, 5.2.2, and 5.2.3, but the document subsequently lists "Contribution 2" as section 5.3, rather than maintaining a consistent narrative grouping under a singular contributions section.

Furthermore, the capitalization within the Table of Contents is erratic. Some sections utilize Title Case, such as "Requirement Survey And Analysis," while others employ Sentence case, such as "Tentative solution". Strict adherence to a singular casing standard is a non-negotiable requirement for academic publishing. The presence of these inconsistencies suggests a lack of automated heading management and points to a manual, error-prone compilation process that violates standard formatting regulations.

## Academic Tone, Language, and Linguistic Precision

A graduation thesis must maintain an objective, dispassionate, and rigorously precise tone. Scientific writing relies on measurable claims, empirical evidence, and logical deduction. The manuscript currently suffers from a pervasive infiltration of marketing-style rhetoric, hyperbolic overclaiming, and the overuse of industry buzzwords, which collectively degrade its scholarly credibility and obscure the actual engineering contributions of the work.

### Hyperbolic Language and Overclaiming

The author frequently employs absolute terminology that cannot be empirically justified by the highly limited scope of the research design. The utilization of emotive adjectives and sweeping generalizations represents a significant departure from expected academic standards. An analysis of the text identifies multiple instances of severe overclaiming.

The thesis repeatedly emphasizes achieving "zero invariant violations" across its evaluation. However, boasting about zero violations on a sample size of a single project under a highly constrained, researcher-controlled test environment is statistically meaningless and highly hyperbolic. It implies a guarantee of absolute reliability that the underlying probabilistic language model cannot possibly sustain in the wild. Similarly, the author describes existing industry solutions as causing "massive portability friction" and incurring "massive overhead". The adjective "massive" is highly subjective, emotive, and unquantified. Academic writing requires specific, measurable descriptors, such as stating that a process induces "high latency" or "statistically significant network overhead," supported by benchmark data.

The manuscript also employs exclusionary absolutes, claiming that existing native subagent frameworks "entirely fail to specify" task ownership. Such absolute statements leave no room for nuance and are easily falsifiable, as different platforms implement varying degrees of ownership scoping that the author simply glosses over to elevate their own proposed system. Furthermore, describing the proposed framework as "perfectly complementing heavier semantic intent frameworks" utilizes the adverb "perfectly," which is an instance of subjective self-praise that has no place in an objective scientific evaluation.

|**Emotive/Marketing Language in Manuscript**|**Suggested Academic Alternative**|**Rationale for Change**|
|---|---|---|
|"massive portability friction"|"significant synchronization overhead"|Removes subjective emotion; specifies the exact technical constraint.|
|"zero invariant violations"|"no invariant violations within the observed case study"|Bounds the claim to the specific empirical limits of the experiment.|
|"entirely fail to specify"|"frequently lack explicit mechanisms for"|Replaces a falsifiable absolute with a precise analytical observation.|
|"perfectly complementing"|"providing a complementary architectural layer to"|Eliminates subjective self-praise and maintains objective distance.|
|"permanently solving the opacity"|"mitigating the opacity constraints observed in"|Acknowledges that complex software problems are rarely "permanently solved."|

### Inappropriate Use of Buzzwords and Neologisms

The text is laden with contemporary industry buzzwords that lack formal academic definition within the context of the paper. Terms such as "agentic" are used loosely throughout the document to describe a broad spectrum of automated behaviors, rather than being strictly defined as a specific architectural paradigm. The manuscript claims the architecture provides a "zero-infrastructure" solution. This is factually incorrect and academically disingenuous, as the system relies heavily on Git version control, local file systems, and Node.js backend processes, all of which constitute infrastructure. Rebranding local computational dependencies as "zero-infrastructure" is a marketing tactic, not a scientific classification.

Furthermore, the author utilizes the acronym "BMAD," defined as the "Breakthrough Method for Agile AI-Driven Development". The inclusion of the word "Breakthrough" in an architectural acronym is inherently unacademic. It signals a lack of objective distance and attempts to artificially inflate the perceived value of the cited methodology. A graduation thesis must filter out industry hype and focus purely on the structural and mathematical properties of the software systems under review.

### Grammatical Anomalies and Cohesion Failures

While the general English proficiency of the document is high, sentence cohesion frequently breaks down due to excessive clause chaining and poor syntactical structuring. Long, meandering sentences tax the reader's working memory and obscure the logical flow of the argument.

For instance, the abstract contains the following sentence: "Current agent runtimes provide models, tools, repository instructions, Skills, and lifecycle hooks, but they do not yet jointly provide a standard project-owned mechanism that preserves session evidence, organizes durable knowledge by scope, maps delegated work to those scopes, and activates selected context deterministically across runtimes". This sentence attempts to achieve too much simultaneously, listing five distinct capabilities followed immediately by a negation that lists four complex architectural propositions. It should be parsed into distinct, logically sequential sentences to improve readability and cognitive processing.

Furthermore, there is a recurring stylistic flaw where the author switches between describing the automated system's actions and the human user's actions without clear transitional markers. This leads to vague explanations regarding who exactly—the agent, the deterministic system, or the human operator—is initiating a specific workflow step. In sections detailing the distillation of knowledge, it is frequently ambiguous whether the "parent agent" autonomously distills information or if human intervention is required, degrading the precision of the architectural description.

## Methodological Rigor and Evaluation Validity

The most severe vulnerabilities in the thesis lie within its evaluation methodology, detailed primarily in Chapter 4. The design-science feasibility case study and the mechanism contract testing exhibit fundamental flaws that threaten both the internal and external validity of the research findings. The conclusions drawn from these evaluations overstep the boundaries of the collected data.

### The Limitation of an $N=1$ Sample Size and External Validity

The entire empirical evaluation of the proposed Coretext system rests on a single case study: the construction of the "Trore Lodging Marketplace MVP". Evaluating a complex software engineering workflow framework on a single, researcher-seeded, toy-scale project provides purely anecdotal evidence. It does not establish statistical significance, nor does it prove that the framework generalizes to other codebases, different architectural patterns, or varying degrees of project complexity.

While the author acknowledges this $N=1$ boundary as a limitation in the concluding remarks, simply acknowledging a fatal methodological flaw does not neutralize its impact on the research claims. To claim in Chapter 5 that the system successfully bridges the activation gap or effectively isolates conversational state based on a single trial is academically unacceptable. Rigorous software engineering research requires evaluating tools across a diverse corpus of projects to account for variances in domain, language, and repository structure. The extrapolation of success from the Trore project to a generalized claim about repository-level coding agents is a massive overreach of external validity.

### The Lines of Code (LOC) Confounder and Invalid Metrics

The primary quantitative metric used by the author to demonstrate the superiority of the Coretext system is the "Orientation Step Count," which measures the number of consecutive read-only tool calls an agent makes before executing its first productive write operation. The thesis claims a victory because the Hooks-Enabled arm reduced this orientation count to a mean of 10.00 steps, compared to 15.50 steps in the No-Hooks arm.

However, the thesis simultaneously reveals a devastating confounding variable within the very next table: the Hooks-Enabled arm generated 12,846 Lines of Code (LOC), whereas the No-Hooks arm generated only 6,859 LOC. The baseline arm, meanwhile, generated a staggering 27,121 LOC. The stochastic variance of the large language model output—generating vastly different amounts of code for the exact same product specification—acts as a massive uncontrolled variable in this experiment.

The orientation step count is inherently correlated with the volume, complexity, and file surface area of the codebase being navigated. An agent navigating a 27,000-line monolithic codebase will naturally require more exploratory reads than an agent navigating a 6,000-line modular codebase. Therefore, comparing step counts across evaluation arms where the underlying codebase volume varies by over 87% (between the Hooks and No-Hooks arms) entirely invalidates the metric. The observed reduction in orientation steps cannot be causally attributed to the proposed Coretext routing mechanism; it is equally, if not more, likely to be a byproduct of the LLM generating a smaller or differently structured codebase in that specific run.

The author attempts to dismiss this fundamental flaw by stating that "Total Files Implemented provides a more stable normalizer". However, this defense is analytically unsound without presenting a rigorous statistical correlation model, such as a multiple regression analysis that explicitly controls for both LOC and file count. Stating that one metric is a "better normalizer" without mathematical proof is insufficient for an academic thesis.

### Tautological Mechanism Contract Testing

The manuscript dedicates a significant portion of Chapter 4 to "Mechanism Contract Testing," boasting that all 27 check predicates across seven contracts passed, yielding a 100% success rate. However, a critical inspection of these contracts, as listed in Appendix A.1, reveals them to be largely tautological unit tests.

Testing whether a deterministic Python script correctly returns a string when fed a frozen, static JSON payload (e.g., Predicate C2.2: "Full edge hydrates target file content") is a demonstration of standard continuous integration (CI) software testing. It verifies that the code compiles and functions as programmed, but it does not represent a scientific research finding. Presenting standard functional unit testing as "empirical evaluation results" conflates basic software engineering best practices with academic research validation. A true mechanism test would evaluate the system's behavior under adversarial conditions, such as corrupted repositories, malformed file paths, or massive scale stress tests, rather than confirming that a basic parsing script executes successfully in a heavily sandboxed fixture.

### Self-Generated Test Suite Bias

A glaring methodological error occurs in the assessment of the generated code's quality. The manuscript notes that the "57-test automated suite and 15-point invariant checklist were generated by the same foundation model that produced the code". Using an artificial intelligence model to generate the test cases that will evaluate the correctness of its own generated output introduces a massive, undeniable confirmation bias.

Academic research has well-documented the phenomenon wherein large language models write superficial or logically circular tests that pass execution but fail to rigorously verify the underlying business logic or edge case constraints. Celebrating the achievement of "zero invariant violations" against a self-generated, potentially flawed and shallow test suite is a hollow metric. It provides no objective proof of software quality, only proof that the model can satisfy its own self-defined, unverified criteria.

### Strawman Baseline Topology

The comparative evaluation pits the hierarchical, scope-partitioned SSKL framework against a "flat sequential delegation model" baseline. This constitutes a classic strawman fallacy in experimental design. By deliberately crippling the baseline arm with an artificially naive, flat delegation model, the author virtually guarantees that their proposed hierarchical framework will exhibit superior organizational performance.

A scientifically rigorous evaluation methodology would benchmark the proposed Coretext framework against existing, state-of-the-art hierarchical orchestration frameworks (such as Superpowers, AutoGen, or other multi-agent structures currently dominating the literature). Comparing a highly structured, researcher-tuned architecture against an unoptimized, sequentially flattened baseline provides zero insight into whether the proposed system actually advances the state of the art, as the comparison is inherently asymmetrical.

## Logical Inconsistencies and Theoretical Gaps

Beyond the empirical flaws in the data collection, the theoretical and argumentative structure of the thesis exhibits several profound logical inconsistencies that weaken its core architectural propositions. The formalization of the system is superficial, and the core claim regarding deterministic control over probabilistic agents breaks down upon close inspection.

### The Contradiction of Determinism vs. Probabilistic Reliance

A central theoretical claim of the thesis is that Coretext successfully decouples "deterministic routing logic from probabilistic agent reasoning". The author explicitly caveats that Coretext does not claim deterministic model behavior, only deterministic context delivery. However, the entirety of the system's operational success relies fundamentally on the LLM's probabilistic ability to correctly interpret, internalize, and adhere to the injected context.

This contradiction is most glaring in the "Write-Gate FSM" mechanism. The system forces the agent to read a rule file before it is allowed to write to a specific directory. The thesis admits this mechanism suffers from "Semantic Blindness" —the system has absolutely no way to verify if the agent actually understood or followed the rule; it only mathematically registers that the file was fetched. Evaluating the framework's success based on the production of a prototype with "zero invariant violations" logically contradicts the premise of the system. Those zero violations were achieved purely because the probabilistic model happened to generate correct code in that specific instance, not because the Coretext mechanism enforced any semantic constraints. The deterministic shell provides no actual guardrails on the output, rendering the architectural claim largely theoretical.

### Superficial Mathematical Formalization

In Chapter 3 and Appendix E, the author attempts to formalize the routing system using mathematical set theory. The document defines sets P (paths), A (actions), T (delivery modes), and H (hooks), and presents a route selection function $R_E(p,a)$ alongside matching predicates like `match(p, ei) = fnmatch(p,sourcei) ∨ p = sourcei ∨ prefix(p, dirprefix(sourcei))`.

However, this formalization is analytically shallow and serves primarily as mathematical obfuscation. It simply encodes a basic, linear `if-then` loop—if a file path matches a string pattern and the event hook is active, append the object to an array. Wrapping a rudimentary array filtering algorithm in set-builder notation does not elevate it to a formal system model or establish a "Route Determinism Contract." True formalization in theoretical computer science involves utilizing Hoare logic, temporal logic, or process calculi to prove system properties such as termination bounds, deadlock-freedom, or invariant preservation. The mathematical notation provided in the thesis offers no such proofs, rendering the formalization an exercise in typographical aesthetics rather than rigorous computer science theory.

## Visual Data, Figures, and Tabular Presentation

The presentation of graphical models, diagrams, and tabular data within the manuscript suffers from severe formatting glitches, poor narrative integration, and a lack of descriptive rigor. Proper visualization is essential for clarifying complex architectures, but the manuscript frequently utilizes tables as data dumps rather than synthetic tools.

### The Automated Cross-Referencing Glitch

Throughout the entirety of the parsed manuscript text, the phrase "The following table:" appears repeatedly and redundantly immediately preceding actual tables, without any contextual integration or proper numbering. This phrase is observed before the Table of Contents, the List of Abbreviations, Table 2.1, Table 2.4, and nearly every subsequent table.

This anomaly is indicative of a corrupted automated cross-referencing system or a broken floating environment macro within the LaTeX compilation process. Standard academic formatting requires tables to be introduced seamlessly within the narrative context (e.g., "As detailed in Table 2.1, the mechanisms exhibit varying degrees of portability..."), rather than relying on a hardcoded, unnumbered prefix that fractures the reading experience. The failure to identify and resolve this systemic compilation error prior to submission violates basic expectations of academic diligence.

### Inadequate Table Captions and Metadata Dumps

Several tables within the implementation chapter lack sufficient explanatory captions and misuse the tabular format entirely. For example, Table 4.2 ("Design specifications for the CoretextEngine class") and Table 4.3 ("Design specifications for the NoteHierarchy class") merely dump raw code attributes and method names into a two-column grid.

In a professional academic thesis, tables must be self-contained; the caption should provide enough context that a reader can understand the table's analytical purpose without exhaustively searching through the surrounding body text. Furthermore, dumping raw programmatic structure (Attributes and Operations) into a basic table is exceptionally poor software engineering practice. Unified Modeling Language (UML) class diagrams are the universally accepted standard visual representation for object-oriented software architecture. The reliance on text-heavy grids to describe class structures suggests a lack of familiarity with standard software visualization tools.

### Figure Misreferencing and Appendix Misdirection

There are notable inconsistencies in how critical figures are referenced and placed within the document structure. The List of Figures mentions "Figure C.1 Coretext v1 C4 container diagram" and "Figure C.2 Legacy SurrealDB-based Coretext v1 operational activity flow". However, placing these critical architectural models in Appendix C obscures the narrative of the system's evolution.

If the fundamental transition from a centralized graph database (v1) to a file-native JSONL ledger (v2) is a primary contribution and motivation for the research, the visual comparison of these architectures must reside prominently in Chapter 3 or Chapter 4. Relegating the visual evidence of the system's architectural lineage to an appendix disrupts the logical flow of the argument and buries the context necessary for the reader to understand the design trade-offs.

## Literature Review, Citation Integrity, and Contextualization

A rigorous literature review and precise citation practices form the bedrock of an academic thesis. The manuscript demonstrates a heavy reliance on non-peer-reviewed sources, exhibits citation formatting inconsistencies, and critically omits foundational literature that is essential to contextualize the research within the broader field of computer science.

### Overreliance on Non-Peer-Reviewed Preprints

An analysis of the referenced literature reveals a massive and disproportionate overreliance on arXiv preprints. Citations such as , , , , , , , , , , , , , , , , and are all identified explicitly as arXiv preprints. While the exceptionally rapid pace of contemporary AI research often necessitates citing recent preprints to discuss cutting-edge developments, a graduation thesis must also demonstrate the student's ability to engage deeply with peer-reviewed literature from established conferences (such as ICSE, FSE, ASE, or ACL) or authoritative journals.

Solely building a theoretical foundation upon preprints is highly risky, as these papers have not passed rigorous external, double-blind peer review and their methodologies may contain undetected flaws. Additionally, a significant portion of the citations are simple URLs linking to proprietary developer documentation (e.g., Anthropic, OpenAI, React Flow). While necessary for citing API specifications, documentation pages do not constitute scientific literature.

|**Source Type**|**Examples in Manuscript**|**Academic Status**|**Acceptability for Thesis Core**|
|---|---|---|---|
|Preprints (arXiv)|, , , ,|Non-peer-reviewed|Acceptable only for latest context, not as sole foundation.|
|Developer Docs|, , ,|Corporate manuals|Acceptable for technical specs, not for theoretical claims.|
|Peer-Reviewed Papers|Conspicuously absent|Rigorously vetted|Must form the majority of the theoretical literature review.|

### Citation Formatting Anomalies and Chaining

The citation style appears to follow a numeric bracketed format (similar to IEEE style), but the formatting of the references themselves is inconsistent and incomplete. Web references frequently lack proper retrieval dates or precise author attribution where available, which violates standard citation guidelines.

Furthermore, the introduction introduces broad, sweeping claims about the state of the industry, such as "Recent surveys and repository-level evidence indicate that AI tools are now part of ordinary engineering practice". Instead of synthetically analyzing the specific findings of the referenced surveys, the author strings together multiple generic citations at the end of the sentence. This practice, known as citation chaining or citation dumping, indicates a superficial engagement with the source material. A proper academic review requires explicating exactly what evidence each source provides to build a compelling narrative, rather than hiding behind a wall of bracketed numbers.

### Missing Foundational Information Retrieval Literature

The thesis discusses context retrieval, lexical search, and graph-based memory, explicitly comparing the Coretext routing mechanism to Retrieval-Augmented Generation (RAG) and graph databases. However, the literature review critically omits foundational research on Information Retrieval (IR) in software engineering. Discussing index-free lexical retrieval (grep-like search) without citing historical, seminal work on code search, Abstract Syntax Tree (AST)-based retrieval, and developer navigation behavior demonstrates a superficial engagement with the broader, established computer science literature. The thesis treats AI coding agents as an entirely isolated phenomenon occurring only post-2022, completely ignoring decades of relevant research in automated program repair, software traceability, and repository mining that directly inform the mechanisms under study.

## Redundancy, Padding, and Document Cohesion

The structural logic of the document indicates a heavy reliance on repetitive padding, likely utilized to artificially inflate the page count or word volume. A graduation thesis must prioritize information density and analytical depth over sheer length. The manuscript violates this principle through repetitive structuring and the inclusion of inappropriate industrial documentation formats.

### Repetition of Contributions

The "six contributions" of the thesis are listed exhaustively in the Abstract. These identical six points are then repeated almost verbatim in Chapter 1 (Introduction), form the exact subsection headings of Chapter 5 (Solution and Contribution), and are restated yet again in Chapter 6 (Conclusion). While an academic paper must signpost its contributions, restating the exact same list four separate times without adding significant new analytical dimensions in each instance is extreme redundancy. Chapter 5, in particular, reads as a defensive reiteration of the abstract rather than a profound theoretical synthesis of the findings.

### Inappropriate Inclusion of Industrial Specifications

Chapter 2 suffers from a severe identity crisis, oscillating between a literature review and an industrial Product Requirements Document (PRD). Section 2.4 contains dense tables detailing elementary software engineering Use Cases (UC-01 to UC-07), listing primary actors, preconditions, postconditions, and main flows. While this specific format is mandated by ISO/IEC/IEEE 29148 for corporate software engineering requirements, it is entirely out of place in a scientific research thesis.

A graduation thesis is evaluated on its ability to test a hypothesis, propose a novel architecture, or conduct rigorous empirical analysis. It is not an industrial design specification document. Documenting basic operational flows like "UC-07 Inspect knowledge, routes, and sessions" with trivial preconditions shifts the focus of the document away from scientific inquiry and toward mere software manual documentation. The inclusion of these exhaustive PRD tables represents severe academic padding designed to consume space rather than advance the research argument.

Similarly, Chapter 4 devotes space to detailing standard software build procedures. Section 4.4.2 outlines the "Build and installation workflow," noting generic commands such as `npm install` and `npm run start`. Including standard Node.js package management commands in a graduation thesis is excessive and pedagogically irrelevant. The academic focus should remain tightly constrained to the novel routing algorithms, the parsing latency, and the integration boundaries, completely excising rudimentary environment setup instructions.

## Conclusion and Remediation Directives

The manuscript "Coretext - A File-Native Context Routing Infrastructure for AI Coding Agents" attempts to address a highly relevant and complex bottleneck in contemporary AI-assisted software engineering: the management of context and repository state across long-running agent sessions. The engineering implementation of a file-native, non-database routing ledger utilizing JSONL records and Git semantics is a practical proposition that addresses the overhead of heavy vector databases.

However, the current document falls significantly short of graduation thesis standards due to severe methodological flaws, hyperbolic rhetoric, logical contradictions, and widespread formatting violations. The empirical evaluation relies on a scientifically invalid comparison hindered by massive, uncontrolled confounding variables, while the theoretical claims of determinism are undermined by the semantic blindness of the proposed mechanism. Furthermore, the reliance on non-peer-reviewed preprints and the inclusion of excessive industrial padding degrade the scholarly nature of the work.

To achieve academic acceptability and align with the rigorous standards of the Hanoi University of Science and Technology, the following comprehensive remediation directives must be executed:

1. **Methodological Overhaul and Metric Re-evaluation:** The empirical claims within Chapter 4 and Chapter 5 must be entirely rewritten to reflect the severe limitations of an $N=1$ case study. The author must explicitly retract the implication that orientation step counts denote architectural efficiency without utilizing a rigorous statistical model to control for the massive Lines of Code (LOC) confounding variable generated by the stochastic LLM.
    
2. **Linguistic Sanitization and Objective Realignment:** A comprehensive editorial pass must eradicate all marketing terminology, emotive adjectives ("massive," "zero-infrastructure," "perfectly complementing"), and absolute statements. The tone must be returned to an objective, scholarly register that accurately describes software limitations.
    
3. **Formatting Compliance and Template Correction:** The LaTeX or Word compilation templates must be thoroughly debugged to resolve the corrupted front-matter pagination and eliminate the redundant "following table" prefix glitch. Furthermore, the author must strictly enforce the 350-word abstract limit mandated by standard academic guidelines, excising the mechanistic minutiae currently bloating the summary.
    
4. **Structural Pruning and Academic Focus:** The repetitive listings of the six contributions across multiple chapters must be consolidated. The undergraduate-level Use Case PRD tables and elementary NPM build commands must be excised entirely to focus the text strictly on algorithmic, architectural, and theoretical research contributions.
    
5. **Literature Expansion:** The theoretical background must be expanded to include foundational, peer-reviewed literature on Information Retrieval (IR) in software engineering, moving beyond the current overreliance on recent arXiv preprints to provide a proper historical context for code search and repository navigation.