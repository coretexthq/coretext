# Story Artifact Alignment Comparison Template

> **Purpose:** Compare how well implementation story artifacts from different experiments align with the original planning specifications.
>
> **Specs Baseline:**
> - [architecture.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/architecture.md)
> - [epics.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/epics.md)
> - [prd.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/prd.md)
> - [ux-design-specification.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/ux-design-specification.md)

---

## Rating Scale

| Score | Label | Meaning |
|:-----:|:------|:--------|
| 5 | **Full** | Completely aligned — spec requirement addressed verbatim or faithfully |
| 4 | **Strong** | Addressed with minor deviations or omissions |
| 3 | **Partial** | Key aspects present but notable gaps or reinterpretations |
| 2 | **Weak** | Mentioned but substantially deviated or incomplete |
| 1 | **Missing** | Not addressed at all |
| N/A | **Not Applicable** | Requirement not relevant to this story |

---

## Output Files

> [!IMPORTANT]
> Each story comparison should be saved as a **separate file** in the comparison folder using the naming convention below.

**Output directory:** `experiments/trore/results/comparison/`

**Naming convention:** `{story-id}-{story-slug}.md`

| Story | Output File |
|:------|:------------|
| 1-1: Project Scaffolding & Database Foundation | [`1-1-project-scaffolding-database-foundation.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-1-project-scaffolding-database-foundation.md) |
| 1-2: Admin Manual Listing Creation | [`1-2-admin-manual-listing-creation.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-2-admin-manual-listing-creation.md) |
| 1-3: Seeker Discovery Grid & Keyword Search | [`1-3-seeker-discovery-grid-keyword-search.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-3-seeker-discovery-grid-keyword-search.md) |
| 1-4: Property Detail View & Metadata | [`1-4-property-detail-view-metadata.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-4-property-detail-view-metadata.md) |
| 1-5: Admin Listing Management | [`1-5-admin-listing-management.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-5-admin-listing-management.md) |

**Cross-story summary** (after all individual stories are completed):
[`cross-story-summary.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/cross-story-summary.md)

---

## Per-Story Comparison Table

> [!IMPORTANT]
> **Single-story scope:** This template is designed to be used **one story at a time**. The user's prompt will specify which story to compare (e.g., "compare story 1-2"). Focus **only** on that story. Do NOT attempt to compare all 5 stories in a single session.

**Instructions for the agent:**
1. Identify the **one story** specified in the user prompt.
2. Read only the two corresponding implementation artifacts (exp-b and exp-c) for that story.
3. Read the four original specs (architecture, epics, PRD, UX design).
4. Fill in the comparison table below for that single story.
5. Save the result to the appropriate output file listed in the **Output Files** section above.

Replace `{STORY_ID}` and `{STORY_TITLE}` below with the actual values (e.g., `1-1`, `Project Scaffolding & Database Foundation`).

### Story {STORY_ID}: {STORY_TITLE}

**Artifacts Compared:**
- **Exp-B:** [1-{STORY_ID}-{slug}.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/{filename}.md)
- **Exp-C:** [1-{STORY_ID}-{slug}.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/{filename}.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | | | |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | | | |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | | | |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | | | |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | | | |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | | | |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | | | |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | | | |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | | | |
| | | **Architecture Subtotal** | **/45** | **/45** | |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story {STORY_ID} | | | |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story {STORY_ID} ACs | | | |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story {STORY_ID} ACs | | | |
| | | **Epics Subtotal** | **/15** | **/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | | | FR#: |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | | | NFR#: |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | | | |
| | | **PRD Subtotal** | **/15** | **/15** | |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | | | |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | | | |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | | | |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | | | |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | | | |
| | | **UX Subtotal** | **/25** | **/25** | |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 45 | | | |
| Epics | 15 | | | |
| PRD | 15 | | | |
| UX Design | 25 | | | |
| **Total** | **100** | | | |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | | |
| **API endpoint pattern** | | |
| **Form library / validation** | | |
| **State management approach** | | |
| **Test strategy** | | |
| **Notable omissions** | | |

#### Verdict

> **Winner:** {Exp-B / Exp-C / Tie}
> **Rationale:** _{one-sentence summary}_

---

## Cross-Story Summary (fill after all stories compared)

| Story | Exp-B Total | Exp-C Total | Δ | Winner |
|:------|:----------:|:----------:|:-:|:------:|
| 1-1: Project Scaffolding & Database Foundation | | | | |
| 1-2: Admin Manual Listing Creation | | | | |
| 1-3: Seeker Discovery Grid & Keyword Search | | | | |
| 1-4: Property Detail View & Metadata | | | | |
| 1-5: Admin Listing Management | | | | |
| **Aggregate** | | | | |

### Overall Observations

> _Summarize patterns: Does one experiment consistently deviate in a specific dimension (e.g., folder structure, naming)? Does one experiment add extra value beyond spec requirements? Does one experiment miss critical requirements more often?_

1. **Architecture Compliance:** 
2. **Spec Fidelity:** 
3. **Implementation Depth:** 
4. **Notable Patterns:** 

---

## Appendix: Spec Quick-Reference Cheat Sheet

> [!NOTE]
> Use this when filling the template to quickly check which requirements apply to each story.

### FR → Story Mapping (from Epics)

| FR | Description | Epic / Story |
|:---|:------------|:-------------|
| FR3 | Keyword search | Epic 1 / Story 1.3 |
| FR16 | UUID assignment | Epic 1 / Story 1.1 |
| FR20 | Admin edit/override | Epic 1 / Story 1.2, 1.5 |
| FR27 | Admin manual input | Epic 1 / Story 1.2 |

### Architecture Key Patterns Quick-Check

| Pattern | Expected |
|:--------|:---------|
| JSON field casing | camelCase (Pydantic `alias_generator=to_camel`) |
| API endpoints | RESTful plural (`/api/v1/listings`) |
| Web features | `apps/web/src/features/{name}/` |
| Server state | TanStack Query keys as arrays |
| Client state | Zustand stores `use{Name}Store` |
| Tests | Co-located `*.test.tsx` / `test_*.py` |
| Error response | `{ "code": "...", "message": "...", "details": {} }` |
| List response | `{ "items": [...], "meta": { "total": N } }` |
