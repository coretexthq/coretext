## Summary
An exploration of designing self-organizing agent swarms and headless companies modeled after open-source software (OSS) communities and governance structures.

## Problems & Solutions
- **Problem**: Designing autonomous multi-agent coordination systems without top-down centralized human control often leads to coordination failures, misalignment, or scaling bottlenecks.
  - **Solution**: Adapt mature open-source community governance models (such as Ladder of Contribution, GOVERNANCE.md, and CONTRIBUTING.md frameworks) to structure how agent swarms contribute, self-organize, and maintain consensus as a self-managed ecosystem.

## Resource
  - [[Open Source Software community structures to Agentic Software Engineering]]: Main concept synthesis in the vault.
  - [[AGENTS.md file]]: Governing rules and privacy rules for agents in this vault.
  - [Pull request latency explained: an empirical overview](https://arxiv.org/abs/2108.09946)
  - [Triage in Software Engineering: A Systematic Review of Research and Practice](https://arxiv.org/abs/2511.08607v1)
  - [The Death Spiral of Open Source Projects: A Post-Mortem Analysis of Pull Request Workflow Dynamics](https://arxiv.org/abs/2605.11844)
  - [Architecting Agentic Communities using Design Patterns](https://arxiv.org/abs/2601.03624)
  - [Performing systematic literature reviews in software engineering](https://dl.acm.org/doi/10.1145/1134285.1134500)
  - [Towards Continuous Systematic Literature Review in Software Engineering](https://arxiv.org/abs/2206.04177)
  - [An exploratory study of the pull-based software development model](https://dl.acm.org/doi/10.1145/2568225.2568260)
*   **Decoupled Governance & Compliance:**
	*   [Governance-as-a-Service: A Multi-Agent Framework for AI System Compliance](https://arxiv.org/abs/2508.18765): Decouples compliance policies from core agent logic.
*   **Constitutional Context & Configuration:**
	*   [Configuring Agentic AI Coding Tools: An Exploratory Study](https://arxiv.org/abs/2602.14690): Empirical validation of repository context conventions like `AGENTS.md`.
	*   [Context Engineering for AI Agents in Open-Source Software](https://arxiv.org/abs/2510.21413): Version-controlled instructions and rules as software artifacts.
*   **Structured Lifecycle & Design Patterns:**
	*   [Agentic Software Engineering: Foundational Pillars and a Research Roadmap](https://arxiv.org/abs/2509.06216): Structured Agentic Software Engineering (SASE) roadmap.
	*   [Architecting Agentic Communities using Design Patterns](https://arxiv.org/abs/2601.03624): Design patterns for governed agent ecosystems.
	*   [Collaborative Agentic AI Needs Interoperability](https://arxiv.org/abs/2505.21550): Standards for agent collectives to interoperate.
	*   [An Empirical Study of Testing Practices in Open Source AI Agent Frameworks](https://arxiv.org/abs/2509.19185): Analysis of validation and verification protocols.
## Original Prompts
đi theo hướng xây dựng hệ thống tự quản lý như [[Open-source]] 
- một vài hướng đi trong [[Open Source Software community structures to Agentic Software Engineering]]
- ý tưởng ban đầu ở [[coretext.strategy.headless-company]]
- ví dụ: [[Rust]], Debian, Python, curl
- Ladder of Contribution
- GOVERNANCE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md giống [[AGENTS.md file]]
- common-pool resource, [The sustainability of open source commons](https://www.tandfonline.com/doi/full/10.1080/0960085X.2022.2046516)
- [Understanding OSS as a Self-Organizing Process](https://scispace.com/papers/understanding-oss-as-a-self-organizing-process-4x1lia2i8f)
- liên hệ đến hashimoto phàn nàn về việc AI làm loãng hệ thống contribution của open source: https://music.youtube.com/watch?v=WjckELpzLOU&si=7MQoWVkQJMPrw23t
- Xây dựng dashboard project, tìm xem có nghiên cứu nào ủng hộ cấu trúc {{project}}.{{scope}}.{{issue}} không (đối chiếu với các các sdd framework hoạt động và cách các [[Open-source]] hoạt động để làm nghiên cứu mang tính khoa học hơn. Dashboard theo dõi project chứ không chỉ có các rules, các rules/hooks hiển thị cùng 1 chỗ với project. Nghiêng về công cụ quản lý dự án trực quan nguyên thủy (nêu rõ các công nghệ sử dụng). Đối chiếu với việc visualize graph bmad + obsidian, cơ bản khá giống nhưng đã lược bỏ các yếu tố thừa. - 1 cái dashboard quản lý công việc, giống các note project như [[coretext]] nhưng có cấu trúc hơn, có thể biến thành yaml frontmatter. agent sẽ tự động đọc các task từ backlog để đưa vào status, rồi lại đưa vào note scope trong log. và context sẽ được phân phối theo cấp xuống dần, note {{project}}.md + {{project}}.{{scope}}.md + các note {{project}}.{{scope}}.{{issue}}.md liên quan cho từng issue 