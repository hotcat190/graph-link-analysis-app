File này mô tả thiết kế cho ứng dụng graph-link-analysis, dựa trên các yêu cầu tính năng trong file features.md

1. Tầng Giao diện (Frontend Layer)

Nhiệm vụ của tầng này là render hàng ngàn Node/Edge mượt mà và xử lý các sự kiện tương tác vật lý (kéo, thả, zoom).

    Framework cốt lõi: Một thư viện xây dựng giao diện dựa trên component như React là lựa chọn rất lý tưởng. Nó giúp bạn dễ dàng đóng gói cái "Canvas bản đồ" thành một component độc lập và các bảng thông tin (Property Panel) thành các component vệ tinh.

    Thư viện Trực quan hóa Đồ thị (Graph Visualization): 

        Cytoscape.js: Cực kỳ mạnh mẽ, chuyên dụng cho phân tích mạng lưới khoa học/trinh thám, hỗ trợ sẵn các thuật toán tìm đường đi ngắn nhất trên client.

2. Tầng Logic & API (Backend Layer)

Tầng này đóng vai trò trung chuyển, truy vấn dữ liệu và chạy các thuật toán phân tích mạng lưới.

    Framework: FastAPI (Python) do tính dễ viết
    Kiến trúc API: Thiết kế theo chuẩn RESTful để Frontend lấy dữ liệu (VD: GET /cases/{case_id}/graph).

3. Tầng Dữ liệu (Database Layer)

    Đề xuất tối ưu: Sử dụng Graph Database (Cơ sở dữ liệu Đồ thị), tiêu biểu nhất là Neo4j do sự phù hợp với yêu cầu của ứng dụng.

    Lưu trữ Metadata: Có thể kết hợp thêm một Database nhỏ khác (như SQLite cho demo, hoặc PostgreSQL/MongoDB sau này) chỉ để lưu thông tin về tài khoản người dùng và tên các Vụ án.

4. Thiết kế mở rộng cho tương lai (Future-Proofing)

Mặc dù ở bản demo ta chưa cần code phần này, nhưng kiến trúc nên chừa sẵn "đường lùi" cho các tác vụ nặng.
Khi mạng lưới vụ án lên tới hàng trăm ngàn Node, việc chạy thuật toán Phân cụm (Clustering) có thể tốn vài phút. Lúc đó, ta không thể để API block chờ đợi. Thiết kế nên hướng đến việc sử dụng một Message Queue (như RabbitMQ) để tiếp nhận yêu cầu phân tích, sau đó giao cho các background worker (những service chạy ngầm) xử lý. Khi xử lý xong, kết quả sẽ được đẩy ngược lại cho Frontend.

Ứng dụng sẽ được triển khai trên Docker Compose nhằm mục đích dễ dàng quản lý và triển khai.