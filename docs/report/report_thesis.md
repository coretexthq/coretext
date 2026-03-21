## **BÁO CÁO NGÀY 18/03/2026**

1. Tìm dự án mẫu
* Không có dự án nào đủ chất lượng để dùng thử


## **BIÊN BẢN NGÀY 09/03/2026**

1. **Nội dung**
* Số liệu mà không đi kèm phân tích, so sánh là chưa đủ, không có ý nghĩa.
* Cần tập trung nhiều hơn vào định tính, so sánh kết quả của 2 phương pháp kĩ hơn, từng tài liệu trung gian được sinh ra, từng bước sinh code, từng lỗi sai.
* Cần phải chạy lại từng bước xem sai ở đâu. So sánh, phân tích xem tại sao.
* Cần so sánh xem việc sử dụng thêm đồ thị tri thức có bổ sung thêm được thông tin nào có ích không hay có đầy đủ các yêu cầu của tài liệu ban đầu không.
* Nếu có can thiệp của con người để code chạy được thì ghi lại rõ.
* Cần đính kèm thêm hình ảnh Đồ thị tri thức với các node được thêm vào thế nào, cấu trúc thế nào.
2. **Kế hoạch tuần tới**
* So sánh lại nội dung đã làm. Đặc biệt, so sánh xem sản phẩm của 2 phương pháp thì phương pháp nào đúng đến bước nào, có đúng ở bước nào mà phương pháp còn lại sai không.
* Tìm kiếm dự án mẫu có sẵn, có kèm tài liệu chi tiết và code chạy được để sao chép lại bằng 2 phương pháp.


## **BÁO CÁO NGÀY 06/03/2026**

1. **Đánh giá lại sản phẩm cũ**
* Spec Driven Development Methodology của BMAD: Chi tiết và đủ dùng nhưng cồng kềnh và lỗi thời
* Sản phầm từ Project III: Đạt được kỳ vọng tối thiểu về kiến trúc, về khả năng thay thế truy xuất tài liệu phẳng, về cải thiện hiệu suất sử dụng token. Hạn chế: chưa tự động hóa được hoàn toàn, kiến trúc chưa được tối ưu cho perfomance
2. **Kế hoạch kỳ tới**
* Tìm kiếm và thử nghiệm các công cụ phục vụ methodology tích hợp sâu hơn với công cụ hiện có (Github, Gemini CLI) và có tính tùy biến cao hơn, linh hoạt hơn, như github/spec-kit, gemini-cli-extension/conductor, tuy vẫn tiếp tục phát triển thêm từ các điểm mạnh của BMAD
* Cải thiện kiến trúc: 
  * Chuyển từ phương pháp xây dựng trước template để sử dụng lại (hiện tại với BMAD) sang xây dựng trước cấu trúc truy vấn để sử dụng lại
  * Cải thiện performance thuật toán tạo và tìm embedding vector 
  * Thiết kế và áp dụng riêng lại phần truy vấn đồ thị bằng ngôn ngữ Rust và tích hợp sâu hơn vào bên trong SurrealDB để cải thiện tốc độ
* Không chỉ tập trung cho Gemini CLI mà mở rộng thí nghiệm đến các công cụ CLI khác như Claude Code CLI, Codex CLI
* Xây dựng quy trình tự động hóa cao hơn (với Github Actions)
3. **Kế hoạch tuần tới**
* Nghiên cứu và báo cáo lại để so sánh các methodology mới hơn với BMAD
* Nghiên cứu về ngôn ngữ lập trình Rust