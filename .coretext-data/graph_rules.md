# Coretext Structural Graph

This graph visualizes the structural context injection edges defined in `coretext_rules.jsonl`.

```mermaid
graph LR
    classDef agents fill:#2c3e50,stroke:#333,stroke-width:1px,color:white;
    classDef skills fill:#e67e22,stroke:#333,stroke-width:1px,color:black;
    classDef docs fill:#3498db,stroke:#333,stroke-width:1px,color:black;
    classDef rules fill:#2ecc71,stroke:#333,stroke-width:1px,color:black;
    classDef templates fill:#9b59b6,stroke:#333,stroke-width:1px,color:white;
    classDef archive fill:#95a5a6,stroke:#333,stroke-width:1px,color:black;
    classDef coretext fill:#e74c3c,stroke:#333,stroke-width:1px,color:white;
    classDef src fill:#1abc9c,stroke:#333,stroke-width:1px,color:black;
    classDef tests fill:#f1c40f,stroke:#333,stroke-width:1px,color:black;
    _coretext_*[".coretext/*"] -->|"hint (both)"| docs_ARCHITECTURE_md["docs/ARCHITECTURE.md"]
    _coretext_*[".coretext/*"] -->|"hint (both)"| docs_coretext_hooks_md["docs/coretext_hooks.md"]
    _coretext_*[".coretext/*"] -->|"hint (both)"| _coretext_data_rules_coretext_engine_modifications_md[".coretext-data/rules/coretext_engine_modifications.md"]
    _coretext_data_rules_*[".coretext-data/rules/*"] -->|"hint (write)"| _agents_skills_coretext_SKILL_md[".agents/skills/coretext/SKILL.md"]
    _coretext_inject_context_py[".coretext/inject_context.py"] -->|"hint (both)"| docs_coretext_hooks_md["docs/coretext_hooks.md"]
    _coretext_runtime_hook_adapter_py[".coretext/runtime_hook_adapter.py"] -->|"hint (both)"| docs_coretext_hooks_md["docs/coretext_hooks.md"]
    _agents_hooks_json[".agents/hooks.json"] -->|"hint (both)"| docs_coretext_hooks_md["docs/coretext_hooks.md"]
    _codex_*[".codex/*"] -->|"hint (both)"| docs_coretext_hooks_md["docs/coretext_hooks.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_react_flow_overlapping_edges_md[".coretext-data/rules/react_flow_overlapping_edges.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_react_flow_custom_nodes_md[".coretext-data/rules/react_flow_custom_nodes.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_d3_force_overlapping_nodes_md[".coretext-data/rules/d3_force_overlapping_nodes.md"]
    _coretext_notify_action_py[".coretext/notify_action.py"] -->|"hint (both)"| _coretext_data_rules_normalize_hook_paths_md[".coretext-data/rules/normalize_hook_paths.md"]
    _coretext_notify_action_py[".coretext/notify_action.py"] -->|"hint (both)"| _coretext_data_rules_session_based_hooks_md[".coretext-data/rules/session_based_hooks.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_dashboard_session_state_md[".coretext-data/rules/dashboard_session_state.md"]
    setup_sh["setup.sh"] -->|"hint (both)"| _coretext_data_rules_coretext_setup_script_md[".coretext-data/rules/coretext_setup_script.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_react_flow_expensive_layouts_md[".coretext-data/rules/react_flow_expensive_layouts.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_react_nested_component_state_md[".coretext-data/rules/react_nested_component_state.md"]
    _coretext_coretext_graph_ui_server_**_*_js[".coretext/coretext-graph-ui/server/**/*.js"] -->|"hint (both)"| _coretext_data_rules_hierarchical_tree_path_collision_md[".coretext-data/rules/hierarchical_tree_path_collision.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_dashboard_preview_url_sync_md[".coretext-data/rules/dashboard_preview_url_sync.md"]
    _coretext_*_py[".coretext/*.py"] -->|"hint (both)"| _coretext_data_rules_ledger_validation_constraints_md[".coretext-data/rules/ledger_validation_constraints.md"]
    _coretext_ingest_transcript_py[".coretext/ingest_transcript.py"] -->|"hint (read)"| _coretext_data_rules_unified_session_ingestion_md[".coretext-data/rules/unified_session_ingestion.md"]
    _coretext_coretext_graph_ui_server_index_js[".coretext/coretext-graph-ui/server/index.js"] -->|"hint (both)"| _coretext_data_rules_dashboard_session_labels_md[".coretext-data/rules/dashboard_session_labels.md"]
    _coretext_coretext_graph_ui_src_**_*_tsx[".coretext/coretext-graph-ui/src/**/*.tsx"] -->|"hint (both)"| _coretext_data_rules_dashboard_session_labels_md[".coretext-data/rules/dashboard_session_labels.md"]
    git push["git push"] -->|"hint (both)"| _coretext_data_rules_exclude_personal_files_md[".coretext-data/rules/exclude_personal_files.md"]
    class _coretext_data_rules_coretext_engine_modifications_md rules
    class _coretext_data_rules_react_nested_component_state_md rules
    class _coretext_data_rules_hierarchical_tree_path_collision_md rules
    class _coretext_data_rules_ledger_validation_constraints_md rules
    class _coretext_data_rules_react_flow_custom_nodes_md rules
    class _coretext_data_rules_dashboard_session_labels_md rules
    class _coretext_*_py docs
    class setup_sh docs
    class _coretext_data_rules_session_based_hooks_md rules
    class _coretext_inject_context_py docs
    class _coretext_runtime_hook_adapter_py docs
    class _coretext_data_rules_react_flow_expensive_layouts_md rules
    class _agents_skills_coretext_SKILL_md skills
    class _coretext_coretext_graph_ui_server_index_js docs
    class _coretext_data_rules_coretext_setup_script_md rules
    class _coretext_data_rules_dashboard_preview_url_sync_md rules
    class _coretext_notify_action_py docs
    class _coretext_data_rules_unified_session_ingestion_md rules
    class git push docs
    class _coretext_data_rules_react_flow_overlapping_edges_md rules
    class _agents_hooks_json docs
    class _coretext_* docs
    class _coretext_ingest_transcript_py docs
    class _coretext_coretext_graph_ui_server_**_*_js docs
    class _coretext_data_rules_* rules
    class _coretext_data_rules_dashboard_session_state_md rules
    class docs_ARCHITECTURE_md docs
    class _coretext_data_rules_normalize_hook_paths_md rules
    class docs_coretext_hooks_md docs
    class _coretext_data_rules_d3_force_overlapping_nodes_md rules
    class _codex_* docs
    class _coretext_coretext_graph_ui_src_**_*_tsx docs
    class _coretext_data_rules_exclude_personal_files_md rules
```
