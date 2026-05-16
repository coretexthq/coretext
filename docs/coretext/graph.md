# Coretext Structural Graph

This graph visualizes the structural context injection edges defined in `coretext.jsonl`.

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
    _coretext_*[".coretext/*"] -->|"hint (read)"| docs_coretext_coretext_flowchart_md["docs/coretext/coretext_flowchart.md"]
    _coretext_*[".coretext/*"] -->|"hint (both)"| docs_rules_coretext_engine_modifications_md["docs/rules/coretext_engine_modifications.md"]
    docs_superpowers_specs_*["docs/superpowers/specs/*"] -->|"hint (write)"| _agents_skills_brainstorming_SKILL_md[".agents/skills/brainstorming/SKILL.md"]
    docs_superpowers_plans_*["docs/superpowers/plans/*"] -->|"hint (write)"| _agents_skills_writing_plans_SKILL_md[".agents/skills/writing-plans/SKILL.md"]
    src_*["src/*"] -->|"hint (both)"| docs_ARCHITECTURE_md["docs/ARCHITECTURE.md"]
    src_*["src/*"] -->|"hint (both)"| _agents_skills_test_driven_development_SKILL_md[".agents/skills/test-driven-development/SKILL.md"]
    src_*["src/*"] -->|"hint (both)"| _agents_skills_systematic_debugging_SKILL_md[".agents/skills/systematic-debugging/SKILL.md"]
    src_*["src/*"] -->|"hint (write)"| _agents_skills_verification_before_completion_SKILL_md[".agents/skills/verification-before-completion/SKILL.md"]
    tests_*["tests/*"] -->|"hint (both)"| _agents_skills_test_driven_development_SKILL_md[".agents/skills/test-driven-development/SKILL.md"]
    docs_superpowers_reviews_*request*["docs/superpowers/reviews/*request*"] -->|"hint (write)"| _agents_skills_requesting_code_review_SKILL_md[".agents/skills/requesting-code-review/SKILL.md"]
    docs_superpowers_reviews_*request*["docs/superpowers/reviews/*request*"] -->|"hint (read)"| _agents_skills_code_reviewer_SKILL_md[".agents/skills/code-reviewer/SKILL.md"]
    docs_superpowers_reviews_*feedback*["docs/superpowers/reviews/*feedback*"] -->|"hint (write)"| _agents_skills_coretext_SKILL_md[".agents/skills/coretext/SKILL.md"]
    docs_rules_*["docs/rules/*"] -->|"hint (write)"| _agents_skills_coretext_SKILL_md[".agents/skills/coretext/SKILL.md"]
    test_engine_py["test_engine.py"] -->|"hint (both)"| docs_ARCHITECTURE_md["docs/ARCHITECTURE.md"]
    _gemini_settings_json[".gemini/settings.json"] -->|"hint (both)"| docs_rules_gemini_cli_payload_structure_md["docs/rules/gemini_cli_payload_structure.md"]
    _coretext_inject_context_py[".coretext/inject_context.py"] -->|"hint (both)"| docs_rules_gemini_cli_payload_structure_md["docs/rules/gemini_cli_payload_structure.md"]
    src_**_*_tsx["src/**/*.tsx"] -->|"hint (both)"| docs_rules_react_flow_overlapping_edges_md["docs/rules/react_flow_overlapping_edges.md"]
    src_**_*_tsx["src/**/*.tsx"] -->|"hint (both)"| docs_rules_react_flow_custom_nodes_md["docs/rules/react_flow_custom_nodes.md"]
    src_**_*_tsx["src/**/*.tsx"] -->|"hint (both)"| docs_rules_d3_force_overlapping_nodes_md["docs/rules/d3_force_overlapping_nodes.md"]
    _coretext_notify_action_py[".coretext/notify_action.py"] -->|"hint (both)"| docs_rules_normalize_hook_paths_md["docs/rules/normalize_hook_paths.md"]
    _gemini_settings_json[".gemini/settings.json"] -->|"hint (both)"| docs_rules_gemini_cli_hook_merging_md["docs/rules/gemini_cli_hook_merging.md"]
    _gemini_settings_json[".gemini/settings.json"] -->|"hint (both)"| docs_rules_session_based_hooks_md["docs/rules/session_based_hooks.md"]
    src_**_*_tsx["src/**/*.tsx"] -->|"hint (both)"| docs_rules_dashboard_session_state_md["docs/rules/dashboard_session_state.md"]
    setup_coretext_sh["setup_coretext.sh"] -->|"hint (both)"| docs_rules_coretext_setup_script_md["docs/rules/coretext_setup_script.md"]
    sync_coretext_sh["sync_coretext.sh"] -->|"hint (both)"| docs_rules_coretext_sync_packaging_md["docs/rules/coretext_sync_packaging.md"]
    src_**_*_tsx["src/**/*.tsx"] -->|"hint (both)"| docs_rules_react_flow_expensive_layouts_md["docs/rules/react_flow_expensive_layouts.md"]
    class docs_rules_react_flow_custom_nodes_md rules
    class _agents_skills_code_reviewer_SKILL_md skills
    class docs_superpowers_reviews_*feedback* docs
    class docs_coretext_coretext_flowchart_md docs
    class test_engine_py docs
    class src_**_*_tsx src
    class docs_rules_react_flow_overlapping_edges_md rules
    class _agents_skills_systematic_debugging_SKILL_md skills
    class _agents_skills_coretext_SKILL_md skills
    class docs_superpowers_plans_* docs
    class docs_rules_session_based_hooks_md rules
    class docs_superpowers_specs_* docs
    class docs_rules_react_flow_expensive_layouts_md rules
    class _agents_skills_requesting_code_review_SKILL_md skills
    class docs_rules_coretext_sync_packaging_md rules
    class _agents_skills_verification_before_completion_SKILL_md skills
    class _coretext_notify_action_py docs
    class _agents_skills_test_driven_development_SKILL_md skills
    class setup_coretext_sh docs
    class tests_* tests
    class src_* src
    class _coretext_inject_context_py docs
    class docs_rules_normalize_hook_paths_md rules
    class docs_rules_coretext_setup_script_md rules
    class _agents_skills_writing_plans_SKILL_md skills
    class docs_superpowers_reviews_*request* docs
    class docs_rules_coretext_engine_modifications_md rules
    class docs_rules_gemini_cli_hook_merging_md rules
    class docs_rules_dashboard_session_state_md rules
    class sync_coretext_sh docs
    class _agents_skills_brainstorming_SKILL_md skills
    class docs_rules_* rules
    class docs_ARCHITECTURE_md docs
    class _coretext_* docs
    class _gemini_settings_json docs
    class docs_rules_gemini_cli_payload_structure_md rules
    class docs_rules_d3_force_overlapping_nodes_md rules
```
