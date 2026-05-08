### **Analysis of Results - Story by Story**

**Story 1-1**

| Metric                | Subject B (File-Based) | Subject C (Coretext) | Delta (%)   |
| :-------------------- | :--------------------- | :------------------- | :---------- |
| Total Requests        | 87                     | 72                   | \-17.2%     |
| Input Tokens (Total)  | 306,443                | 227,384              | \-25.8%     |
| Output Tokens (Total) | 13,910                 | 11,650               | \-16.2%     |
| LOC                   | 612                    | 532                  | \-13.1%     |
| **Tokens / LOC**      | **523.5**              | **449.3**            | **\-14.2%** |

**Observation:** In the initial scaffolding phase, the Coretext Agent used **25.8% fewer tokens** than the baseline. Instead of reading the entire Product Requirement Document (PRD), it simply queried the graph for the specific folder structure and naming rules. This shows that for setting up a project, the agent does not need to read the full narrative if it can access specific structural details.

**Story 1-2**

| Metric                | Subject B (File-Based) | Subject C (Coretext) | Delta (%)    |
| :-------------------- | :--------------------- | :------------------- | :----------- |
| Total Requests        | 82                     | 25                   | \-69.5%      |
| Input Tokens (Total)  | 309,951                | 253,777              | \-18.1%      |
| Output Tokens (Total) | 12,868                 | 5,032                | \-60.9%      |
| LOC                   | 549                    | 120                  | \-78.1%      |
| **Tokens / LOC**      | **588.0**              | **2,156.7**          | **\+266.8%** |

**Observation:** The Coretext Agent reduced the total request count by **69.5%**, leveraging the `query_knowledge` tool to retrieve only the relevant database schema definitions while filtering out unrelated architectural details. However, the referential integrity enforcement mechanism prevented the agent from completing the task until it resolved broken cross-references detected in the documentation. This result indicates that the graph imposes stricter data quality constraints than conventional flat-file workflows.

**Story 1-3**

| Metric                | Subject B (File-Based) | Subject C (Coretext) | Delta (%)   |
| :-------------------- | :--------------------- | :------------------- | :---------- |
| Total Requests        | 65                     | 66                   | \+1.5%      |
| Input Tokens (Total)  | 241,692                | 392,436              | \+62.4%     |
| Output Tokens (Total) | 11,954                 | 13,454               | \+12.5%     |
| LOC                   | 451                    | 487                  | \+8.0%      |
| **Tokens / LOC**      | **562.4**              | **833.4**            | **\+48.2%** |

**Observation:** Token efficiency declined in this story, with a 62.4% increase in input token consumption. The agent encountered difficulty formulating effective search queries to locate specific service boundary definitions within the graph. In contrast to the baseline agent—which could access the relevant file directly—the Coretext Agent was required to perform multiple iterative searches to establish its navigational context. This finding suggests that when the agent lacks precise search terminology, graph-based retrieval can incur higher costs than direct linear file access.

**Story 1-4**

| Metric                | Subject B (File-Based) | Subject C (Coretext) | Delta (%)  |
| :-------------------- | :--------------------- | :------------------- | :--------- |
| Total Requests        | 64                     | 78                   | \+21.9%    |
| Input Tokens (Total)  | 253,637                | 281,110              | \+10.8%    |
| Output Tokens (Total) | 10,713                 | 13,708               | \+28.0%    |
| LOC                   | 359                    | 435                  | \+21.2%    |
| **Tokens / LOC**      | **736.4**              | **677.7**            | **\-8.0%** |

**Observation:** The Coretext Agent required a higher request count (+21.9%) yet maintained marginally superior efficiency per line of code (-8.0%). Notably, the `lint` tool identified path reference errors that the baseline agent failed to detect. The Coretext Agent was required to perform additional corrective steps to resolve these errors, resulting in improved documentation quality at the cost of increased total processing time.

**Story 1-5**

| Metric                | Subject B (File-Based) | Subject C (Coretext) | Delta (%)   |
| :-------------------- | :--------------------- | :------------------- | :---------- |
| Total Requests        | 61                     | 54                   | \-11.5%     |
| Input Tokens (Total)  | 392,928                | 272,790              | \-30.6%     |
| Output Tokens (Total) | 18,875                 | 17,144               | \-9.2%      |
| LOC                   | 370                    | 768                  | \+107.6%    |
| **Tokens / LOC**      | **1,113.0**            | **377.5**            | **\-66.1%** |

**Observation:** This story showed the clearest benefit of the system. The Coretext Agent generated twice as much code as the baseline but used **30.6% fewer tokens**. Because the graph was fully populated by this stage, the agent could retrieve the exact business rules it needed without re-reading the entire project history. This indicates that the graph approach becomes significantly more efficient as the project grows larger.

**Epic 1 Summary: Cumulative Efficiency**

| Subject                | Total Input Tokens | Total Output Tokens | Total Requests | LOC   | Tokens / LOC (Avg) | Efficiency Gain |
| :--------------------- | :----------------- | :------------------ | :------------- | :---- | :----------------- | :-------------- |
| Subject B (File-Based) | 1,504,651          | 68,320              | 359            | 2,341 | 671.9              | \-              |
| Subject C (Coretext)   | 1,427,497          | 60,988              | 295            | 2,342 | 635.6              | **\-5.4%**      |

**Conclusion of Experiment 2:**
Overall, the Coretext Agent demonstrated better efficiency than the file-based baseline:

-   **17.8% fewer requests** (295 vs 359)
-   **5.1% fewer input tokens** (1,427,497 vs 1,504,651)
-   **10.7% fewer output tokens** (60,988 vs 68,320)
-   **5.4% better token efficiency** (635.6 vs 671.9 tokens/LOC)

The 5.4% efficiency gain indicates that the Coretext Agent consumed fewer tokens to produce an equivalent volume of code. The system delivered its greatest advantage in complex, dependency-heavy tasks where targeted subgraph retrieval eliminated the need for exhaustive file reading. Conversely, the regressions observed in Story 1-3 demonstrated that when the graph index is incomplete or the agent lacks precise search terminology, graph-based retrieval can incur higher costs than direct linear file access.