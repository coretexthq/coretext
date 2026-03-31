### Step 1.1.CS: Create-Story (Planning)
**Experiment B (File-based)**
- **Spec files read:** `epics.md`, `architecture.md`
**Experiment C-2 (Graph-based)**
- **Queries & Retrieved Nodes:**
	- Query: `"Requirements and stories for Epic 1, specifically story 1.1 project scaffolding and database foundation. Include architecture patterns, tech stack, and database schema relevant to this story."`
		- `architecture.md#requirements-to-structure-mapping`
		- `epics.md#story-1-1-project-scaffolding-database-foundation`
		- `epics.md#fr-coverage-map`
		- `architecture.md#implementation-handoff`
		- `prd.md#project-classification`
### Step 1.2.CS: Create-Story (Planning)
**Experiment B (File-based)**
- **Spec files read:** `epics.md`, `architecture.md`, `ux-design-specification.md`
**Experiment C-2 (Graph-based)**
- **Queries & Retrieved Nodes:**
	- Query: `"details for story 1-2-admin-manual-listing-creation and epic-1 requirements for admin listing creation"`
		- `1-1-project-scaffolding-database-foundation.md#references`
		- `epics.md#story-1-2-admin-manual-listing-creation`
		- `epics.md#story-3-2-listing-description-normalizer`
		- `epics.md#fr-coverage-map`
		- `epics.md#functional-requirements`
	- Query: `"UX design for New Listing Form and Architecture for Listing Creation"`
		- `epics.md#story-1-2-admin-manual-listing-creation`
		- `ux-design-specification.md`
		- `ux-design-specification.md#interactions`
		- `1-1-...database-foundation.md#database-schema-details`
		- `epics.md#story-3-2-listing-description-normalizer`

### Step 1.3.CS: Create-Story (Planning)
**Experiment B (File-based)**
- **Spec files read:** `epics.md`, `architecture.md`, `ux-design-specification.md`, `prd.md`
**Experiment C-2 (Graph-based)**
- **Queries & Retrieved Nodes:**
	- Query: `"Requirements and stories for Epic 1, specifically story 1.3 Seeker Discovery Grid & Keyword Search"`
		- `epics.md#fr-coverage-map`
		- `epics.md#story-1-3-seeker-discovery-grid`
		- `1-1-project-scaffolding-database-foundation.md#references`
		- `prd.md#property-discovery-search`
		- `epics.md#functional-requirements`
	- Query: `"Architecture patterns, tech stack, and database schema for seeker discovery grid"`
		- `epics.md#story-1-3-seeker-discovery-grid`
		- `prd.md#property-discovery-search`
		- `epics.md#functional-requirements`
		- `ux-design-specification.md#target-users`
		- `prd.md#project-classification`
### Step 1.4.CS: Create-Story (Planning)
**Experiment B (File-based)**
- **Spec files read:** `epics.md`, `exp-b/.../1-3-seeker-discovery-grid-keyword-search.md`, `architecture.md`, `ux-design-specification.md`, `project-context.md`
**Experiment C-2 (Graph-based)**
- **Queries & Retrieved Nodes:**
	- Query: `"1-4-property-detail-view-metadata details requirements acceptance criteria"`
		- `epics.md#story-1-4-property-detail-view`
		- `epics.md#functional-requirements`
		- `architecture.md#requirements-coverage-validation`
		- `epics.md#nonfunctional-requirements`
		- `architecture.md#requirements-overview`
	- Query: `"Property Detail View UX Design wireframe"`
		- `epics.md#story-1-4-property-detail-view`
		- `ux-design-specification.md#transferable-ux-patterns`
		- `ux-design-specification.md`
### Step 1.5.CS: Create-Story (Planning)
**Experiment B (File-based)**
- **Spec files read:** `epics.md`, `architecture.md`, `ux-design-specification.md`
**Experiment C-2 (Graph-based)**
- **Queries & Retrieved Nodes:**
	- Query: `"Requirements and acceptance criteria for Epic 1 Story 5 Admin Listing Management"`
		- `1-1-project-scaffolding-database-foundation.md#references`
		- `epics.md#fr-coverage-map`
		- `1-2-admin-manual-listing-creation.md#story-1-2-admin-manual-listing-creation`
		- `epics.md#story-3-2-listing-description-normalizer`
		- `1-2-admin-manual-listing-creation.md#acceptance-criteria`
	- Query: `"Full content of Story 1.5 Admin Listing Management"`
		- `1-2-admin-manual-listing-creation.md#story-1-2-admin-manual-listing-creation`
		- `1-2-admin-manual-listing-creation.md#story`
		- `1-2-admin-manual-listing-creation.md`
		- `epics.md#story-3-2-listing-description-normalizer`
		- `prd.md#quality-control-administration`
	- Query: `"Architecture patterns for Admin Dashboard and Management Interface"`
		- `architecture.md#state-management-patterns`
		- `prd.md#quality-control-administration`
		- `1-2-admin-manual-listing-creation.md#dev-notes`
		- `1-1-...database-foundation.md#architecture-compliance`
		- `ux-design-specification.md#platform-strategy`
