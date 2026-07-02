# Coretext Visualization Dashboard User Guide

The Coretext Visualization Dashboard is a local web-based inspection and visualization interface designed to render the system state DAG (directed acyclic graph), workspace note hierarchies, and active agent execution histories. 

Operating on the **Shared Kernel Thesis**, the dashboard acts as a visualization surface that delegates core data aggregation (nesting, session mapping, and highlights) to the underlying Python kernel (`.coretext/note_hierarchy.py`), ensuring that human developers and AI agents interact with the exact same file-native source of truth.

---

## 1. Quick Start & Execution

The dashboard source code and server reside under `.coretext/coretext-graph-ui/`.

*   **Launching the Dashboard:**
    To launch the dashboard, run the following command from the repository root:
    ```bash
    npm run start
    ```
    > [!IMPORTANT]
    > Always run `npm run start` rather than `npm run dev`. `npm run start` concurrenty boots both the Express backend API (port `3001` or `3002`) and the Vite frontend dev server. Running `npm run dev` starts only the frontend, resulting in failed data fetches and a blank screen.

*   **Accessing the Dashboard:**
    Once running, open your web browser and navigate to the local URL (typically `http://localhost:5173` or as indicated by the Vite startup logs).

---

## 2. Navigating the UI Layout & Switching Views

The dashboard employs a symmetrical pane layout with a radial-gradient dark background:

*   **Left Control Panel:** Houses the view tab switcher, layout controls, and the list of active/archived sessions. It can be collapsed off-screen by clicking the left-pointing chevron (`<`) at the screen edge to maximize canvas real estate. When collapsed, it is replaced by a glassmorphic floating pill labeled `coretext` at the top-left.
*   **Right Details Panel:** Features a persistent autocomplete search bar at the top, a workspace note preview container, and sliding controls. Clicking the right-pointing chevron (`>`) collapses the panel off-screen.
*   **Central Canvas:** Renders the graph or tree representation. Viewport margins and padding dynamically adjust between `340px` (when panels are open) and `60px` (when panels are collapsed) to prevent active nodes from sliding behind the panels.
*   **Switching Views:**
    At the top of the Left Control Panel, use the **Tab Switcher** buttons to toggle between:
    1.  **Graph View:** Renders the force-directed state DAG.
    2.  **Tree View:** Renders a horizontal, structured mindmap of your codebase organization.

---

## 3. Graph View & Physics Layout

The **Graph View** visualizes the workspace state as a Directed Acyclic Graph (DAG) using **React Flow**, custom glassmorphic pill nodes, and smart Bezier curve edges (`SmartEdge` with shortest-path calculations to prevent overlaps).

### The Reset & Re-layout Button
Because the layout is force-directed, nodes can occasionally cluster or drift during interaction.
*   **How to Use:** Click the blue **Reset & Re-layout** button in the Left Control Panel (visible only when Graph View is active).
*   **Under the Hood:** Clicking this button triggers a **d3-force physics simulation** for 500 ticks. The simulation uses:
    *   `forceManyBody` (repelling force of `-1500`) to push nodes apart.
    *   `forceCollide` (radius of `150` pixels) to guarantee nodes do not overlap.
    *   `forceY` gravity (`0.8` strength) to separate categories vertically: **Triggers** are pulled up (`y = -300`), **Skills** are pushed down (`y = 300`), and **Context (markdown notes)** remain centered (`y = 0`).
*   **Performance Optimization:** An expensive layout recalculation only occurs when structural changes (nodes added/removed) or a manual reset is triggered. Highlight updates are applied silently to prevent browser freezing.

---

## 4. Tree View & Node Hierarchy

The **Tree View** (Mindmap Mode) provides progressive disclosure of project context, organized horizontally from left to right.

### Interpreting Node Hierarchy
The tree structure represents the logical containment hierarchy of your project documentation and constraints:
$$\text{Project Root} \longrightarrow \text{Scopes \& Sub-scopes} \longrightarrow \text{AI Session Notes} \longrightarrow \text{Architectural Rules} \longrightarrow \text{Trigger Files}$$

*   **Project Root:** The coreentry point of the repository (e.g., `coretext.md`).
*   **Scopes & Sub-scopes:** Domain folders or MOC (Map of Content) notes that group related files (e.g., `coretext.dashboard`).
*   **AI Session Notes:** Persistent logs documenting specific AI execution trajectories (e.g., `knowledge/ai/coretext.dashboard.url-sync.md`).
*   **Architectural Rules:** Atomic, deterministic constraints generated as outcomes of AI sessions, stored in `.coretext-data/rules/`.
*   **Trigger Files / Context:** The actual code files or hooks in the repository that activate or are governed by the rules.

### Visual Styling & Connectors
The Tree View uses segmented connector lines with custom CSS bounds (`:first-child`, `:last-child`, `:only-child`) that align exactly with the centers of horizontal nodes. This prevents line overshoot and ensures a clean, tree-like structure.

---

## 5. Node Categories & Color Coding

Nodes in both the Graph View and Tree View are color-coded to denote their category:

| Category | Node Accent Color | Text/Label Color | Icon | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Project** | Blue (`#3498db`) | White | Folder/Root | The core project note representing the repository root. |
| **Scope** | Purple (`#9b59b6`) | Yellow-Gold (`#e1b12c`) | Category / MOC | Domain areas, sub-scopes, and documentation maps. |
| **Session** | Orange (`#e67e22`) | Soft White (Italic) | Document | Trajectory summaries of active or archived AI sessions. |
| **Rule** | Green (`#2ecc71`) | Green (Monospace) | Key / Shield | Atomic architectural constraints in `.coretext-data/rules/`. |
| **Trigger** | Dark Gray (`#7f8c8d`) | Gray (Monospace) | Terminal / File | Code files, hooks, or scripts that trigger rule context. |

---

## 6. Visual Feedback & Glowing Highlights

To help developers inspect active execution paths, nodes glow with animated pulsing borders. The colors represent distinct states:

### A. Yellow Glow: Read Interaction (`.highlighted-read`)
*   **What it means:** The node (file) was read by the agent during the selected session.
*   **Trigger:** Triggered when the selected session contains a `read_file` or `view_file` tool call for this path.

### B. Green Glow: Write/Replace Interaction (`.highlighted-write`)
*   **What it means:** The node (file) was created, modified, or written to.
*   **Trigger:** Triggered by tool calls like `write_to_file`, `replace_file_content`, or patches.
*   > [!TIP]
     > **Write Precedence:** If a node was both read and written to during a session, the green **write highlight** takes precedence and overrides the yellow read glow.

### C. Red Glow: Backlog Items (`.highlighted-backlog`)
*   **What it means:** The note contains outstanding work items.
*   **Trigger:** Active **only when no session is selected**. The Python kernel scans all durable notes; if a note contains a non-empty `# Backlog` section (content exists between `# Backlog` and the next `--- # Resource` divider), it pulses red.

### D. Blue Glow: Active Selected Node (`.active-node`)
*   **What it means:** The node is currently selected for preview.
*   **Trigger:** Clicked by the user or selected via search. A solid blue border surrounds the node, and the Right Details Panel displays its contents.
*   **Deselection:** Click anywhere on the empty canvas to deselect the active node. The blue glow turns off, and the Right Details Panel collapses.

---

## 7. Interactive Navigation & Canvas Controls

Both views support fluid canvas interactions for exploration:

*   **Pan & Zoom:** Click and drag the empty canvas to pan. Use your mouse scroll wheel or trackpad pinch gestures to zoom.
*   **Controls Overlay (Bottom-Left):**
    *   **Plus (`+`) / Minus (`-`):** Zoom in and zoom out.
    *   **Fit View / Center Button:** Instantly centers the graph/tree and scales it to fit all nodes on screen.
    *   **Scale Badge:** Displays the current zoom level (e.g., `100%`).
*   **Target Selection Zoom (75%):** Clicking a node to read its contents automatically centers the viewport on that node and adjusts the zoom scale to `75%` (`0.75`). This provides readability while maintaining context of neighboring nodes.
*   **Scale Preservation:** Toggling branches or closing panels recenters the target node while preserving your current zoom scale instead of resetting it.

---

## 8. Collapsing & Expanding

To manage large, complex codebases, the dashboard implements progressive disclosure through multiple collapse/expand options:

### Individual Node Toggles
Hovering over a node card in the Tree View reveals a small circular toggle button (`+` or `-`) on its right edge.
*   **Clicking `-`** collapses all child branches nested under that node.
*   **Clicking `+`** expands its children.

### Global Tree Expand / Collapse Button
Located in the Left Control Panel when the Tree View is active.
*   **Expand Tree:** Fully expands all nodes to reveal the entire project hierarchy.
*   **Collapse Tree (Smart Selective Collapse):**
    *   *If no session is selected:* Collapses the tree back to show only the Root Project node and immediate Scope nodes.
    *   *If a session is active:* Collapses all unrelated branches, but keeps the root node and **all branches leading to highlighted (read/write) nodes expanded** (including their immediate siblings) so you can debug the session path in context.

### Auto-Expansion on Search/Link Clicks
If you click a search result or select a markdown link targeting a node that is currently hidden (collapsed), the dashboard recursively expands all its ancestor branches (`setIsExpanded(true)`) and centers the viewport on the newly revealed node.

---

## 9. Sessions List & AI Summary Labels

The **Sessions** section in the Left Control Panel displays checkboxes for selecting execution trajectories.

*   **Overlay Highlights:** Check multiple session checkboxes to display cumulative highlights.
*   **AI Summary Labels:** The Express server matches conversation UUIDs in session log filenames against the frontmatter of your AI summaries in `knowledge/ai/*.md` (parsing the `conversations` frontmatter property). If a match is found, it replaces the raw conversation ID with the human-readable summary name (e.g., `coretext.dashboard.tree-zoom`), making it easy to identify.

---

## 10. Search, Markdown Reader & URL Sync

The Right Details Panel provides tools to search and read project notes:

*   **Persistent Search Bar:** Type into the search input at the top of the right panel to search across all node names, paths, identifiers, and categories. Selecting a search result highlights, centers, and focuses the node.
*   **Zero-Dependency Markdown Parser:** Displays file content with custom styling for:
    *   Obsidian-style wikilinks (`[[LinkTarget]]` or `[[LinkTarget|Display Text]]`) rendered as clickable links that resolve to the target node.
    *   Checklists (supporting `[ ]` uncompleted, `[/]` in-progress, and `[x]` completed states).
    *   Obsidian/GitHub callout alerts (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`).
*   **URL Synchronization:** The currently viewed note is synchronized to the browser URL as a query parameter (e.g., `/?file=%2Fknowledge%2Fcoretext.dashboard.md`). This enables browser back/forward navigation and bookmarks.
