## **BÁO CÁO NGÀY 17/12/2025**

### **1\. Tổng quan tiến độ và Kết quả Demo**

* **Trạng thái hoàn thành:** Đã hoàn thành **Epic 1/3** của quá trình phát triển. Mặc dù mục tiêu ban đầu chỉ mang tính thử nghiệm để làm quen với quy trình BMad và Gemini CLI, nhưng kết quả thực tế đã tạo ra được sản phẩm Demo có thể chạy được.  
* **Thời gian thực hiện:** 1 tuần cho Epic 1 (gồm 6 User Stories).  
* **Cấu trúc Repo:**   
  * Folder coretext/: Lưu trữ source code chính của công cụ CLI.  
  * Folder docs/: Lưu trữ toàn bộ tài liệu dự án, hoạt động như cơ sở tri thức.  
* **Kết quả Demo:** Đã có thể show các luồng hoạt động chính:  
  * Khởi chạy ứng dụng và cài đặt Git Hook.  
  * Quy trình tự động khi Commit: Hệ thống tự động kiểm tra định dạng, kiểm tra tính toàn vẹn của liên kết, bóc tách các header trong file Markdown và đẩy dữ liệu vào SurrealDB.  
  * Trực quan hóa: Sử dụng Surrealist của SurrealDB để hiển thị các node và mối quan hệ (relation) giữa các tài liệu và code.

### **2\. Triển khai kỹ thuật**

* **Tech Stack:** Sử dụng **Typer** (xây dựng CLI), **GitPython** (tương tác git), **Poetry** (quản lý dependency).  
* **Cơ sở dữ liệu (SurrealDB):**  
  * Đã xây dựng được khung sườn cho Graph: Tự động thêm/cập nhật node đồ thị và các quan hệ khi có commit mới.  
  * Query: SurrealQL  
  * Mô hình dữ liệu: Đã định nghĩa được các loại Node, Header và các loại Relation cơ bản gồm Contains, Parent of, References.  
* **Lưu trữ lịch sử:** Phần lớn lịch sử chat (đặc biệt là các phiên quan trọng) đã được lưu lại để phục vụ việc tra cứu và tái sử dụng context, cũng như theo dõi báo cáo các phiên về số token được sử dụng theo thời gian.

### **3\. Khó khăn** 

* **Rào cản công nghệ mới:** AI Agent gặp nhiều khó khăn ban đầu khi làm việc với GitPython và đặc biệt là SurrealDB, ví dụ như define cách đẩy dữ liệu vào cơ sở dữ liệu  
* **Vấn đề Chi phí:** Lượng token tiêu thụ quá lớn. Cần ít nhất **100 triệu token LLM** để hoàn thành trọn vẹn Epic 1\.  
* **Quy trình kiểm thử:** Hiện tại hệ thống của BMad dựa dẫm quá nhiều vào System Test tự động mà thiếu các bước cho người dùng (User Test) kiểm thử demo.  
* **Hạn chế của BMad:** BMad hiện tại mới chỉ đưa ra ràng buộc đầu vào bằng cách đưa ra hướng dẫn, chưa có cơ chế ràng buộc đầu ra chặt chẽ cho cấu trúc file để đảm bảo thuận lợi cho việc truy xuất dữ liệu sau này. Giải pháp dự kiến là tích hợp check format vào Git pre-commit.

### **4\. Những phát hiện mới**

* **Chế độ làm việc nhóm (Party Mode):** Việc cho các Agent tự tranh luận, trao đổi với nhau tạo ra nhiều góc nhìn đa chiều rất giá trị.  
* **Định hướng Framework (Agno):** Việc quản lý đa tác tử và quản lý bộ nhớ rất quan trọng, nên em thấy bước đi cuối cùng sẽ là implement được **Agno**, đây là hướng đi tiềm năng mong muốn của em để phát triển thành Đồ án tốt nghiệp chuyên sâu.  
* **Chiến lược "Observer Agent":**  
  * Em thấy việc cô lập một Agent đứng bên ngoài (không can thiệp trực tiếp vào context hiện có) rất có ích để giữ cái nhìn toàn cảnh.  
  * Có thể áp dụng chiến lược rẽ nhánh cho Agent này thực hiện các task quan trọng nhưng không nằm trong luồng chính, sau đó merge lại kết quả (tương tự cơ chế Git).

### **5\. Kế hoạch tiếp theo**

* Tiếp tục triển khai Epic 2 dựa trên nền tảng khung đã ổn định, gồm triển khai model vector embedding, triển khai server MCP.

## **BÁO CÁO NGÀY 10/12/2025**

### **1\. Cập nhật tiến độ tài liệu hóa và Thiết kế hệ thống**

* **Hoàn thiện sơ đồ (Diagram):** Em đã hoàn thành dự thảo các diagram cốt lõi để thầy xem trước. Trọng tâm là diagram thể hiện sự kết nối giữa các tài liệu hiện có với file gốc.  
* **Đánh giá tài liệu:**  
  * Hai tài liệu cốt lõi là **PRD (Product Requirements Document)** và **Architecture** đã được hoàn thiện sau quá trình brainstorm kỹ lưỡng.  
  * **Nhận xét:** Hệ thống phụ thuộc (dependency) giữa các tài liệu rất chằng chịt và phức tạp. Việc trực quan hóa giúp nhận diện rõ sự chồng chéo này.

### **2\. Thử nghiệm công nghệ và Quy trình (BMad \+ SurrealDB)**

* **Về cơ sở dữ liệu (SurrealDB):**  
  * Đang thử nghiệm SurrealDB kết hợp Surrealist.  
  * Kết quả: SurrealQL (ngôn ngữ query của riêng SurrealDB) hoạt động tốt và tiện lợi. Tuy nhiên, việc tích hợp qua GraphQL (ngôn ngữ query phổ biến hơn gặp lỗi liên tục, chưa ổn định.  
* **Về quy trình Agent (BMad \+ Gemini CLI):**  
  * Đang triển khai mô hình thử nghiệm: Sử dụng **BMad** và **Gemini CLI** kết hợp với một **Agent Orchestrator** bên ngoài (trên web Gemini).  
  * **Mục tiêu kiến trúc:** Hướng tới việc Orchestrator (sau này sẽ dùng framework Agno) hoạt động độc lập khỏi context, chỉ nhận báo cáo từ các Sub-agents. Con người sẽ chỉ làm việc với Orchestrator thay vì quản lý từng Sub-agent.  
  * **Trạng thái:** Đang thực hiện **Story 2, Epic 1**. Mục tiêu hiện tại là chạy thử nghiệm để hiểu luồng hoạt động (workflow) và cố gắng hoàn thành Epic 1 để visualize dữ liệu trên Surrealist.

### **3\. Đánh giá chuyên sâu về khung làm việc BMad (Case Study)** 

Sau khi áp dụng BMad vào một project phức tạp với nhiều công nghệ mới, em rút ra các đánh giá sau:

* **Điểm mạnh:**  
  * Thiết kế (Design phase) rất vững chắc (solid).  
  * Quy trình phát triển rõ ràng, có các template chuẩn.  
  * Hệ thống file index tương đối minh bạch.  
  * Tốc độ phát triển ban đầu cực nhanh, các agent tuân thủ tốt quy trình.  
  * Về cơ bản, tư duy của BMad trùng khớp với phương pháp ban đầu của em nhưng được chuẩn hóa chuyên nghiệp hơn.  
* **Điểm yếu và Thách thức:**  
  * **Chi phí và Tài nguyên:**   
    * Viết tài liệu: 3 đến 4 triệu token  
    * Viết code cho 1 story: 2 đến 3 triệu token cho task nhỏ, 22 triệu token cho task phức tạp  
    * Review code: 3 triệu token  
    * Lỗi vòng lặp kiểm thử vô tận: 25 triệu token  
    * Nguyên nhân: agent phải đọc đi đọc lại nhiều lần  
  * **Vấn đề ngữ cảnh (Context):**  
    * Cách index bằng file phẳng (CSV, YAML, MD) chưa khoa học bằng Database.  
    * Tình trạng "Lost in the Middle" xuất hiện do lịch sử chat quá dài. Agent chỉ đọc PRD một lần đầu và không cập nhật lại.  
    * Tài liệu thiếu tính "Động" (Dynamic), agent thường xuyên quên cập nhật ngược lại vào document sau khi code.  
  * **Chưa tối ưu hóa luồng:** Chưa nắm bắt triệt để các rule trong project\_context.md. Chưa dám thử nghiệm chế độ tự động hoàn toàn (Party mode/Yolo) vì rủi ro cao.  
* **Đề xuất giải pháp định hướng Graph:**  
  * Những điểm yếu trên chính là những vấn đề mà **Graph Database** có thể giải quyết, với điều kiện phương pháp thiết kế phải đủ thông minh.  
  * **Vấn đề cần giải quyết:** Việc chia nhỏ Story đến vô tận để tránh chat dài (trái ngược triết lý "one story at a time" của BMad) liệu có gây phân mảnh khó kiểm soát? Cần tìm điểm cân bằng giữa việc chia nhỏ task và giữ ngữ cảnh tổng thể.

**4\. Định hướng phát triển dự án tìm nhà trọ & Vấn đề bản quyền**

* **Tình trạng dự án cũ:** Việc tiếp tục phát triển dự án tìm nhà trọ với phương pháp cũ là không khả thi do hệ thống đã quá cồng kềnh.  
* **Lựa chọn giải pháp:**  
  * *Option 1:* Document lại toàn bộ theo BMad (Rủi ro: vẫn tồn tại các lỗi của BMad nêu trên).  
  * *Option 2 (Ưu tiên):* Thiết kế kiến trúc hoàn toàn mới, xây dựng bên trên các module phương pháp luận của BMad nhưng tách biệt hoàn toàn.  
* **Vấn đề Ethical/Open Source:** Em đang cân nhắc giữa việc đóng góp cho BMad hay tách nhánh (fork)/thiết kế lại thành một Open Source Project riêng. Xu hướng hiện tại là thiết kế lại để phù hợp với đồ án và khắc phục triệt để các hạn chế về bối cảnh.

**5\. Kế hoạch tiếp theo**

* Tập trung cao độ hoàn thiện nốt **Epic 1**.  
* Mục tiêu: Tìm ra các vấn đề phát sinh mới khi hệ thống vận hành trọn vẹn một chu trình để có dữ liệu đánh giá chính xác hơn.

## 

## **BÁO CÁO NGÀY 18/11/2025**

### **1\. Mở đầu về điều chỉnh**

* **Về mặt công nghệ:** Sau giai đoạn thử nghiệm với GitHub Copilot, em nhận thấy các hạn chế về khả năng tuân thủ quy tắc (System Prompt) và sự phụ thuộc vào hệ sinh thái đóng kín. Nhu cầu hiện tại của em là chuyển dịch từ mô hình Trợ lý sang mô hình Tự động để tăng cường khả năng tự động hóa và xử lý các tác vụ phức tạp mà không cần sự can thiệp liên tục của con người.  
* **Về mặt ứng dụng:** Thực hiện chuyển đổi kiến trúc (migration) ứng dụng tìm phòng trọ từ Google Cloud/Firebase sang Vercel và Supabase để tận dụng ưu thế của Serverless Functions và PostgreSQL, đồng thời chuẩn hóa quy trình phát triển phần mềm.

### **2\. Mục tiêu giai đoạn mới:**

* **Mục tiêu công nghệ (Dự án Hệ thống tri thức kép):**  
  1. Xây dựng hệ thống tri thức kép: Một môi trường phát triển phần mềm tích hợp, sử dụng Gemini CLI làm tác tử chính.  
  2. Triển khai SurrealDB kết hợp với MCP Server để thống nhất lưu trữ tài liệu, vector embeddings và quan hệ đồ thị trong một cơ sở dữ liệu duy nhất.  
  3. Áp dụng khung làm việc BMad (Breakthrough Method for Agile AI-Driven Development) để chuẩn hóa kỹ thuật Context Engineering.  
* **Mục tiêu ứng dụng:**  
  1. Hoàn tất việc chuyển đổi Frontend sang Vercel (React/Next.js) và Backend sang Vercel Functions/Supabase.  
  2. Chứng minh khả năng tự động hóa của AI thông qua việc xử lý các tác vụ migration phức tạp (ví dụ: chuyển đổi framework, sửa đổi configuration).

### **3\. Nội dung đã thực hiện (Giai đoạn chuyển giao và Đánh giá lại)**

* **Đánh giá quy trình cũ (Github Copilot \+ Hệ tri thức 3 tầng):**  
  * Ưu điểm: Hiệu quả cao trong việc quản lý code nội bộ IDE, dễ theo dõi tiến độ.  
  * Hạn chế: Hệ thống indexing cho tài liệu Markdown chưa tối ưu, gây tốn kém token và cửa sổ ngữ cảnh (context window). AI vẫn mang tính chất hỗ trợ hơn là thực thi, và chưa tuân thủ triệt để các System Prompt phức tạp.  
* **Kết quả thử nghiệm chuyển đổi với quy trình cũ và mô hình mới nhất:**  
  * Đã thực hiện chuyển đổi module từ Google Cloud sang Vercel \+ Supabase sử dụng Gemini 3.0 Pro, mới công bố ngày 18/11.  
  * Tốc độ: Hoàn thành trong 30 phút và sửa lỗi trong 1 tiếng, bao gồm: Refactor code sang FastAPI, setup cấu hình Vercel/Supabase, và chuyển đổi cơ chế kết nối cơ sở dữ liệu.  
  * Kết quả: thành công triển khai lên [nhaminhbach.vercel.app](http://nhaminhbach.vercel.app)   
  * Hạn chế: Vẫn chưa nắm vững được các chi tiết hệ thống, gặp lỗi về Transaction Pooling khi lựa chọn sai vùng, dẫn đến thời gian sửa lỗi kéo dài và tốn kém token.  
* **Kiến trúc ứng dụng mới:**  
  * **Frontend:** Chuyển từ (dự kiến) Firebase Hosting sang React trên Vercel.  
  * **Backend:** Chuyển từ Google Cloud Functions sang Vercel Functions (FastAPI).  
  * **Database:** Chuyển từ Google Cloud SQL (Postgres) sang Supabase (Postgres).

### **4\. Nội dung và kế hoạch thực hiện tiếp theo**

Kế hoạch sắp tới của em tập trung vào việc xây dựng Workflow mới có tên là Hệ thống tri thức kép, kết hợp giữa cơ sở dữ liệu đa mô hình và tác tử tự hành.

* **Giai đoạn 1: Xây dựng hạ tầng tri thức với SurrealDB & MCP**  
  * **Cơ sở dữ liệu:** Thay thế (dự kiến) Neo4j bằng SurrealDB. Đây là giải pháp 3 trong 1: lưu trữ tài liệu (như MongoDB), lưu Vector Embeddings (như Pinecone) và lưu quan hệ (như Neo4j).  
  * **Cơ chế truy vấn:** Sử dụng SurrealQL, ngôn ngữ truy vấn của SurrealDB, để hợp nhất Vector Search và Graph Traversal, giúp AI dễ dàng hiểu cú pháp và truy xuất dữ liệu hơn so với các ngôn ngữ truy vấn đồ thị phức tạp cũ.  
  * **Tích hợp:**   
    * Triển khai MCP Server để kết nối SurrealDB với các mô hình AI mà không cần cơ chế đồng bộ dữ liệu phức tạp.  
    * Xây dựng script python để tự động đồng bộ sang SurrealDB sau mỗi commit  
* **Giai đoạn 2: Triển khai Coding Agent tự chủ (Gemini CLI)**  
  * Chuyển từ Github Copilot sang Gemini CLI để tận dụng khả năng chạy ngầm (headless), tự động lặp lại (loop), sửa lỗi và commit code.  
  * Biến AI thành worker hoạt động trực tiếp trong Terminal, tương tác native với hệ điều hành và các công cụ dòng lệnh khác (Input/Output dưới dạng text stream).  
* **Giai đoạn 3: Chuẩn hóa quy trình với BMad**  
  * Thay thế các file Markdown tự do bằng cấu trúc dữ liệu chuẩn hóa của BMad. Các file tài liệu (Epic, Task) sẽ có các trường dữ liệu cụ thể (\#\# Status, \#\# Depends On, \#\# Acceptance Criteria) để script Python dễ dàng trích xuất và cập nhật vào SurrealDB.  
  * Nhúng cứng quy trình vào cấu trúc file để giảm tải việc phải dạy AI về quy trình trong mỗi lần prompt (tối ưu Context Engineering).  
* **Kế hoạch mở rộng:**  
  * Bổ sung kỹ năng cho Agent thông qua OpenSkills và kiến thức qua Context7.  
  * Mở rộng sang hệ thống Đa tác tử (Multi-Agent Systems) sử dụng Agno.  
  * Xây dựng hệ thống tự rút kinh nghiệm dựa trên nghiên cứu ReasoningBank.

**5\. Kết quả dự kiến**

* Một hệ thống tri thức kép hoàn chỉnh, nơi AI có thể tự động điều hướng, tra cứu tri thức từ SurrealDB và thực thi mã lệnh qua Gemini CLI.  
* Hoàn tất việc chuyển đổi hạ tầng ứng dụng sang Vercel và Supabase, sẵn sàng cho việc mở rộng tính năng tìm kiếm ngữ nghĩa.  
* Báo cáo đánh giá hiệu quả của việc áp dụng khung làm việc BMad so với quy trình Agile cũ trong phát triển phần mềm hỗ trợ bởi AI.

## **BÁO CÁO NGÀY 24/09/2025**

## Tên đề tài: Xây dựng Hệ thống Trợ lý AI Đa tác tử với Đồ thị Tri thức ứng dụng trong Quy trình Phát triển Phần mềm

**Case study:** *Phát triển ứng dụng tìm kiếm phòng trọ cho sinh viên và người thu nhập thấp.*

### **1\. Tính cấp thiết:**

* **Về mặt công nghệ:** Việc phát triển phần mềm bằng AI đang ngày càng phổ biến, tuy nhiên khả năng duy trì và quản lý ngữ cảnh của các công cụ hiện tại còn yếu, và thiếu khả năng tự chủ, tự cải thiện quy trình.  
* **Về mặt ứng dụng:** Đề tài sẽ được áp dụng để giải quyết một bài toán thực tế và cấp thiết: vấn đề tìm kiếm phòng trọ của sinh viên và người thu nhập thấp. Việc xây dựng một ứng dụng giải quyết vấn đề này là một case study tốt vì đòi hỏi xây dựng đầy đủ backend, frontend và pipeline dữ liệu, một bài toán đủ lớn để chứng minh năng lực của hệ thống AI.

### **2\. Mục tiêu của đề tài:**

* **Mục tiêu công nghệ:** Thiết kế và xây dựng một hệ thống trợ lý AI đa tác tử có khả năng tự động hóa các giai đoạn trong quy trình phát triển phần mềm, bao gồm việc triển khai kiến trúc Agentic RAG kết hợp Vector Search và Knowledge Graph Query để tối ưu hóa việc truy xuất và sử dụng kho tri thức của dự án. Từ đó đánh giá hiệu quả của hệ thống thông qua việc so sánh với phương pháp sử dụng các công cụ AI khác.  
* **Mục tiêu ứng dụng:** Xây dựng thành công một ứng dụng web tổng hợp và chuẩn hóa tin đăng phòng trọ từ nhiều nguồn (chủ yếu là Facebook) và cho phép người dùng tìm kiếm một cách thông minh theo bộ lọc hoặc theo ngữ nghĩa\*\*.\*\*

### **3\. Nội dung đã thực hiện (Giai đoạn 1: Thử nghiệm với AI Coding Agent)**

* **Kiến trúc hệ thống thử nghiệm:** Sử dụng AI Coding Agent, cụ thể là GitHub Copilot ở chế độ Agent để sinh code\*\*,\*\* với một Hệ thống Tri thức 3 tầng, quản lý bằng các file Markdown và liên kết qua backlink các file liên quan tương tự như Obsidian. Tầng 1 là System Prompt định nghĩa các quy tắc cốt lõi, tiêu chuẩn code, và quy trình làm việc. Tầng 2 (Dữ liệu dài hạn) là các tài liệu cần lưu trữ dài hạn như tech stack, database schema, kiến trúc hệ thống,... được kết nối qua backlink. Tầng 3 (Dữ liệu ngắn hạn) là các tài liệu vận hành lấy cảm hứng từ Scrum gồm Epic, Sprint, Task. Agent của Github Copilot tuân theo các quy tắc được đặt ra ở tầng 1 để truy xuất tri thức, và sử dụng công cụ tìm kiếm riêng và index riêng để tìm kiếm và bổ sung bối cảnh về tri thức và về code.  
* **Kết quả đạt được trên Case Study:** Hoàn thành pipeline từ bước cào dữ liệu từ các nhóm Facebook bằng Playwright đến xây dựng luồng xử lý sử dụng LLM chuyển đổi dữ liệu thô thành dữ liệu có cấu trúc để lưu trữ trên PostgreSQL; hoàn thành xây dựng khung Backend Serverless bằng Python trên Google Cloud Functions; đang trong quá trình hoàn thiện Frontend bằng React.  
* **Đánh giá quy trình hiện tại:** Ưu điểm là tốc độ phát triển tính năng rất nhanh, tri thức dự án được tích lũy và tái sử dụng, bám sát tầm nhìn sản phẩm. Hạn chế là agent khó tuân thủ triệt để các quy tắc khi dự án ngày càng lớn và lượng tri thức liên quan cũng ngày càng lớn theo, việc truy xuất tri thức còn thô sơ và chưa hiệu quả triệt để, bị giới hạn trong hệ sinh thái của GitHub Copilot, và vẫn đòi hỏi sự can thiệp, gỡ lỗi thủ công của con người.

### **4\. Nội dung và kế hoạch thực hiện tiếp theo**

* **Giai đoạn 2:** Thiết kế và xây dựng Hệ Đồ thị Tri thức để lưu trữ các tri thức có cấu trúc, và xây dựng công cụ hỗ để hỗ trợ Github Copilot Agent truy xuất tri thức trên Hệ Đồ thị Tri thức.  
* **Giai đoạn 3:** Thiết kế và xây dựng Hệ thống AI đa tác tử, gồm nhiều agent chuyên biệt như PlanningAgent, CodingAgent, TestingAgent, DebuggingAgent, và hệ thống Agentic RAG sử dụng kết hợp Hệ Đồ thị Tri thức và Cơ sở dữ liệu Vector làm nguồn tri thức để các agent có được ngữ cảnh đầy đủ và chính xác.  
* **Hoàn thiện** **song song trên Case Study:** Tiếp tục phát triển và hoàn thiện trang web tìm phòng trọ, bổ sung các chức năng ví dụ như tìm kiếm phòng trọ theo ngữ nghĩa. Liên tục ghi chú và đánh giá mức độ hiệu quả của hệ thống, quy trình mới được áp dụng.

### **5\. Nội dung công việc tuần tới**

* Hoàn thiện báo cáo chi tiết về hệ thống hiện tại, bao gồm ưu điểm, hạn chế cũng như bài học kinh nghiệm rút ra được.  
* Mô tả chi tiết về hướng đi khắc phục những hạn chế hiện tại sử dụng Hệ Đồ thị Tri thức, cụ thể hơn là sử dụng công nghệ của Neo4j để xây dựng Hệ thống Tri thức hoạt động hiệu quả hơn.