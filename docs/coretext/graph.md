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
    trore_src_components_**_*_jsx["trore/src/components/**/*.jsx"] -->|"hint (both)"| docs_rules_url_driven_state_md["docs/rules/url_driven_state.md"]
    trore_src_hooks_**_*_js["trore/src/hooks/**/*.js"] -->|"hint (both)"| docs_rules_url_driven_state_md["docs/rules/url_driven_state.md"]
    trore_src_hooks_useProperties_js["trore/src/hooks/useProperties.js"] -->|"hint (both)"| docs_rules_api_mocking_and_auth_md["docs/rules/api_mocking_and_auth.md"]
    trore_vite_config_js["trore/vite.config.js"] -->|"hint (both)"| docs_rules_api_mocking_and_auth_md["docs/rules/api_mocking_and_auth.md"]
    trore_src_components_Filters_jsx["trore/src/components/Filters.jsx"] -->|"hint (both)"| docs_rules_url_driven_state_md["docs/rules/url_driven_state.md"]
    trore_src_hooks_useProperties_js["trore/src/hooks/useProperties.js"] -->|"hint (both)"| docs_rules_client_side_filtering_md["docs/rules/client_side_filtering.md"]
    trore_src_**_*_jsx["trore/src/**/*.jsx"] -->|"hint (both)"| docs_superpowers_specs_2026_04_18_advanced_search_pagination_design_md["docs/superpowers/specs/2026-04-18-advanced-search-pagination-design.md"]
    trore_src_hooks_*_js["trore/src/hooks/*.js"] -->|"hint (both)"| docs_superpowers_specs_2026_04_18_advanced_search_pagination_design_md["docs/superpowers/specs/2026-04-18-advanced-search-pagination-design.md"]
    trore_src_components_SaveSearchButton_jsx["trore/src/components/SaveSearchButton.jsx"] -->|"hint (both)"| docs_rules_url_driven_state_md["docs/rules/url_driven_state.md"]
    trore_src_hooks_useSaveSearch_js["trore/src/hooks/useSaveSearch.js"] -->|"hint (both)"| docs_rules_api_mocking_and_auth_md["docs/rules/api_mocking_and_auth.md"]
    src_**_*_jsx["src/**/*.jsx"] -->|"hint (both)"| ARCHITECTURE_md["ARCHITECTURE.md"]
    src_hooks_**_*_js["src/hooks/**/*.js"] -->|"hint (both)"| ARCHITECTURE_md["ARCHITECTURE.md"]
    class trore_src_components_SaveSearchButton_jsx docs
    class trore_src_hooks_**_*_js docs
    class trore_src_components_**_*_jsx docs
    class docs_rules_client_side_filtering_md rules
    class trore_src_hooks_*_js docs
    class src_hooks_**_*_js src
    class trore_src_hooks_useProperties_js docs
    class trore_src_**_*_jsx docs
    class trore_src_components_Filters_jsx docs
    class ARCHITECTURE_md docs
    class src_**_*_jsx src
    class trore_src_hooks_useSaveSearch_js docs
    class docs_rules_url_driven_state_md rules
    class trore_vite_config_js docs
    class docs_superpowers_specs_2026_04_18_advanced_search_pagination_design_md docs
    class docs_rules_api_mocking_and_auth_md rules
```
