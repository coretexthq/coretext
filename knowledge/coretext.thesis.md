# Status

# Backlog
- viết 1 phần tìm hiểu về các harness mới nhất: [[AGENTS.md file]], [[Agent Skills]], [[Hooks]]. nghiên cứu về mức độ adoption của industry, đặt ra yêu cầu về sự thống nhất trong hệ sinh thái. một số đã có giải pháp, nhưng riêng memory thì chưa. yêu cầu học hỏi từ các hệ sinh thái chuẩn ở trên để từ đó xây dựng nền tảng thống nhất. các công ty lớn đều đang chuyển hướng sang xây dựng hệ sinh thái skills của riêng mình, với mcp dường như hết trend. [[You Need to Rewrite Your CLI for AI Agents]] [[will MCP be dead soon]]
- xây dựng knowledge base cho tất cả các công cụ mới nhất trong https://www.respan.ai/market-map

# Log
- Nghiên cứu so sánh Coretext với Codex Rules/Memories và client memory systems (Antigravity Knowledge, Gemini CLI Auto Memory). Chi tiết tại [[Coretext vs Codex Rules and Memories]].
- [[coretext.thesis.introduction]]
- 

# Resource
[[coretext.resource]]
## Guide

- [[KH nam hoc 2025-2026_CN_KS.pdf]]
- [[main.pdf]]
## Watchlist
- https://docs.google.com/spreadsheets/d/1pMu2N44AN6nVnTzVNHqzMEiyDoGbcXGR/edit?fbclid=IwY2xjawRP4BFleHRuA2FlbQIxMQBzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeVNDHIELjgFKYMLOt-TOd0rG-LPHGZW63OrRDsPo6EtcRlUxQ-Er40EnybcY_aem_ji9-JkUD2-FhjmLTx78-gg&gid=420078354#gid=420078354
	- https://github.com/Hieu1607/Recruitment_AI_assistant
- https://husteduvn-my.sharepoint.com/:x:/g/personal/khai_bn225501_sis_hust_edu_vn/IQCANmFmGQakS4JQLIROsDI0AbArfEAwg0kioMTdVIklGzQ?rtime=Vp-_dP6c3kg
- https://husteduvn-my.sharepoint.com/:x:/g/personal/lam_dp225027_sis_hust_edu_vn/IQBLNPREFKHbQ6K2EOnsnDnbAZY7W4mUkfkWVV_EEyp7Y1E?e=25ejM79.03.2036.xlsx&fbclid=IwY2xjawRP4D1leHRuA2FlbQIxMABicmlkETFheE9neGxTREJORFJmUzJ6c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHuDVHd5o-jyhh4uDqFaIFmzIZTCYkSWhGigiGmgcbwxBqmhfZPOOxUnXkZVL_aem_muriVvkHN7XlEJxffX-X8w
- https://github.com/triet4p/agent-memory-cognitive
- https://husteduvn-my.sharepoint.com/:x:/g/personal/nghia_ct225056_sis_hust_edu_vn/IQCBE8A1rlTPSZXGgAW9_PAKAZvXCvbueg9n2kgtg3vIUic?rtime=KeMqnlaZ3kg&fbclid=IwY2xjawRP5IpleHRuA2FlbQIxMABicmlkETFheE9neGxTREJORFJmUzJ6c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHqvomZd_ysE1TG5BMRugu0X3UHPiEb2wsaSv2jIF5rYVTrlp5vUUrqSKrAqk_aem_8GBdJZ2zRQ0rDn6lE8TtAA
- https://github.com/DoNotChoke/LiCoMemory
- https://github.com/illupy/ArHistory
## Example
- [Xây dựng hệ thống _tác_ _tử_ AI cộng _tác_ ứng dụng trong vận hành doanh nghiệp](https://dlib.hust.edu.vn/entities/publication/19609b23-7769-44fd-96c9-c9949185630e)
- [OutDoor _Fire_ Smoke Detection](https://dlib.hust.edu.vn/entities/publication/a3d292bf-797c-4d01-9923-b1db7371626e)
- [A _Monitoring_ and Alerting Weather Data System for Vietnamese Cities](https://dlib.hust.edu.vn/entities/publication/f5476553-eaf4-421a-878a-fbf62c515d5f)
- [Ứng dụng kỹ thuật _Chưng_ _cất_ _dữ_ _liệu_ cho học liên kết trong mạng điện toán biên di động](https://dlib.hust.edu.vn/entities/publication/1b92a0e0-4b87-4cac-bd6f-c688ecabcab1)
- [Hệ thống quản lý và cho thuê _Homestay_](https://dlib.hust.edu.vn/entities/publication/241b5773-fdf2-4667-9579-20dca4b9e075)
- [Phần mềm quản lý _chung_ _cư_ và dịch vụ hỗ trợ _cư_ dân](https://dlib.hust.edu.vn/entities/publication/5abcdf7d-230c-48e1-af0e-1bf2d983be65)
- [Hệ thống hỗ trợ biên tập và quản lý nội dung _âm_ _nhạc_ đa kênh](https://dlib.hust.edu.vn/entities/publication/cd2c8baf-094d-4e9a-b669-07368addfb16)

**Gemini CLI**: 
```bash
cd ~/Git/graduation-thesis && gemini -m gemini-3.1-pro-preview --include-directories ~/Git/coretext ~/Git/knowledge/project/coretext
```
**Antigravity CLI:**
```bash
cd ~/Git/graduation-thesis && agy --add-dir ~/Git/coretext ~/Git/knowledge/project/coretext ~/Git/knowledge/project/coretext
```
**Codex CLI:**
```bash
cd ~/Git/graduation-thesis && codex --add-dir ~/Git/coretext ~/Git/knowledge/project/coretext ~/Git/knowledge/project/coretext
```