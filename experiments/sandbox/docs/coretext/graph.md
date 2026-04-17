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
    _coretext_*[".coretext/*"] -->|"full (both)"| docs_ARCHITECTURE_md["docs/ARCHITECTURE.md"]
    _coretext_*[".coretext/*"] -->|"hint (read)"| docs_coretext_coretext_flowchart_md["docs/coretext/coretext_flowchart.md"]
    _coretext_*[".coretext/*"] -->|"full (both)"| docs_rules_coretext_engine_modifications_md["docs/rules/coretext_engine_modifications.md"]
    docs_superpowers_specs_*["docs/superpowers/specs/*"] -->|"hint (write)"| _agents_skills_brainstorming_SKILL_md[".agents/skills/brainstorming/SKILL.md"]
    docs_superpowers_plans_*["docs/superpowers/plans/*"] -->|"hint (write)"| _agents_skills_writing_plans_SKILL_md[".agents/skills/writing-plans/SKILL.md"]
    src_*["src/*"] -->|"hint (both)"| docs_ARCHITECTURE_md["docs/ARCHITECTURE.md"]
    src_*["src/*"] -->|"hint (both)"| _agents_skills_test_driven_development_SKILL_md[".agents/skills/test-driven-development/SKILL.md"]
    src_*["src/*"] -->|"hint (both)"| _agents_skills_systematic_debugging_SKILL_md[".agents/skills/systematic-debugging/SKILL.md"]
    src_*["src/*"] -->|"hint (write)"| _agents_skills_verification_before_completion_SKILL_md[".agents/skills/verification-before-completion/SKILL.md"]
    tests_*["tests/*"] -->|"hint (both)"| _agents_skills_test_driven_development_SKILL_md[".agents/skills/test-driven-development/SKILL.md"]
    docs_superpowers_reviews_*request*["docs/superpowers/reviews/*request*"] -->|"hint (write)"| _agents_skills_requesting_code_review_SKILL_md[".agents/skills/requesting-code-review/SKILL.md"]
    docs_superpowers_reviews_*request*["docs/superpowers/reviews/*request*"] -->|"full (read)"| _agents_skills_code_reviewer_SKILL_md[".agents/skills/code-reviewer/SKILL.md"]
    docs_superpowers_reviews_*feedback*["docs/superpowers/reviews/*feedback*"] -->|"hint (write)"| _agents_skills_consolidate_rules_SKILL_md[".agents/skills/consolidate-rules/SKILL.md"]
    docs_rules_*["docs/rules/*"] -->|"hint (write)"| _agents_skills_consolidate_rules_SKILL_md[".agents/skills/consolidate-rules/SKILL.md"]
    class docs_superpowers_specs_* docs
    class _agents_skills_test_driven_development_SKILL_md skills
    class docs_rules_coretext_engine_modifications_md rules
    class tests_* tests
    class docs_superpowers_reviews_*request* docs
    class _agents_skills_requesting_code_review_SKILL_md skills
    class _agents_skills_code_reviewer_SKILL_md skills
    class docs_coretext_coretext_flowchart_md docs
    class docs_superpowers_plans_* docs
    class _agents_skills_consolidate_rules_SKILL_md skills
    class docs_superpowers_reviews_*feedback* docs
    class _coretext_* docs
    class _agents_skills_brainstorming_SKILL_md skills
    class docs_rules_* rules
    class docs_ARCHITECTURE_md docs
    class src_* src
    class _agents_skills_writing_plans_SKILL_md skills
    class _agents_skills_verification_before_completion_SKILL_md skills
    class _agents_skills_systematic_debugging_SKILL_md skills
```
