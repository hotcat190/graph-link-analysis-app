File này mô tả thiết kế cho ứng dụng graph-link-analysis, dựa trên các yêu cầu tính năng trong file features.md

# 1. Tầng Giao diện (Frontend Layer)

Nhiệm vụ của tầng này là render hàng ngàn Node/Edge mượt mà và xử lý các sự kiện tương tác vật lý (kéo, thả, zoom).

    Framework cốt lõi: Một thư viện xây dựng giao diện dựa trên component như React là lựa chọn rất lý tưởng. Nó giúp bạn dễ dàng đóng gói cái "Canvas bản đồ" thành một component độc lập và các bảng thông tin (Property Panel) thành các component vệ tinh.

    Thư viện Trực quan hóa Đồ thị (Graph Visualization): 

        Cytoscape.js: Cực kỳ mạnh mẽ, chuyên dụng cho phân tích mạng lưới khoa học/trinh thám, hỗ trợ sẵn các thuật toán tìm đường đi ngắn nhất trên client.

# 2. Tầng Logic & API (Backend Layer)

Tầng này đóng vai trò trung chuyển, truy vấn dữ liệu từ Neo4j và chạy các thuật toán phân tích mạng lưới.

* **Framework**: FastAPI (Python) để đảm bảo tốc độ phản hồi nhanh, tự động sinh tài liệu Swagger UI, dễ dàng kết nối với driver Neo4j.
* **Cấu trúc mã nguồn Backend**:
    * `backend/src/main.py`: Khởi chạy ứng dụng, cấu hình CORS, xử lý vòng đời ứng dụng (lifespan events), đăng ký các routes chính.
    * `backend/src/database.py`: Khởi tạo và quản lý kết nối (Neo4j Driver instance), cung cấp session helper.
    * `backend/src/schemas.py`: Định nghĩa các Pydantic Models để validate dữ liệu đầu vào/đầu ra của các API.
    * `backend/src/routes/cases.py`: Chứa logic xử lý các endpoint liên quan đến Vụ án (Cases) và Đồ thị của vụ án.
* **Danh sách API Endpoints**:
    * `GET /api/cases`: Lấy danh sách tất cả các vụ án (Case) gồm: `id`, `name`, `description`, `createdAt`.
    * `POST /api/cases`: Tạo vụ án mới. Query parameter `seed: bool = False` để tùy chọn sinh dữ liệu mẫu (demo graph) riêng cho vụ án này.
    * `PATCH /api/cases/{case_id}`: Cập nhật thông tin tiêu đề (`name`) và mô tả (`description`) của vụ án.
    * `DELETE /api/cases/{case_id}`: Xóa vụ án cùng tất cả các Node/Edge đồ thị thuộc vụ án đó.
    * `GET /api/cases/{case_id}/graph`: Trả về toàn bộ dữ liệu đồ thị (Nodes & Edges) thuộc về vụ án cụ thể dưới định dạng Cytoscape JSON.

# 3. Tầng Dữ liệu (Database Layer)

* **Cơ sở dữ liệu Đồ thị (Graph Database)**: Sử dụng **Neo4j 5-Community Edition** để lưu trữ toàn bộ cấu trúc đồ thị (Nodes & Edges).
* **Giải pháp phân tách Vụ án (Case Isolation)**: 
    * Do hạn chế của phiên bản **Neo4j Community Edition** (chỉ hỗ trợ duy nhất 1 database hoạt động đồng thời, không thể tạo database vật lý riêng biệt cho từng vụ án giống như bản Enterprise), hệ thống sẽ sử dụng phương án **phân tách bằng thuộc tính (`caseId` property)** kết hợp với Node quản lý vụ án độc lập.
    * **Chi tiết cấu trúc**:
    * **Node Vụ án (`:Case`)**: Lưu trữ thông tin metadata của vụ án, cấu trúc: `(:Case {id: string, name: string, description: string, createdAt: datetime})`.
    * **Các Node đồ thị (ví dụ: `:Person`, `:Phone`, `:Bank`...)**: Mỗi node thuộc một vụ án bắt buộc phải mang thuộc tính `caseId` lưu ID của vụ án đó.
    * **Các Quan hệ (Edges)**: Mỗi quan hệ nối giữa hai node cũng sẽ mang thuộc tính `caseId` tương tự để phục vụ việc lọc và truy vấn nhanh.
    * **Lý do lựa chọn**:
    * Tránh hiện tượng **Supernode** (Nút siêu kết nối) làm giảm hiệu năng nếu liên kết trực tiếp tất cả các node đồ thị vào node `:Case` qua quan hệ `[:BELONGS_TO]`.
    * Dễ dàng lập chỉ mục (Index) trên trường `caseId` để tối ưu tốc độ tìm kiếm.
    * Xóa nhanh toàn bộ vụ án bằng câu lệnh Cypher đơn giản: `MATCH (n {caseId: $caseId}) DETACH DELETE n` (và xóa node `:Case` tương ứng).
* **Lưu trữ Metadata bổ sung**: Ở giai đoạn hiện tại, toàn bộ thông tin Case metadata được lưu trực tiếp trên Neo4j bằng node `:Case` để đơn giản hóa kiến trúc. Trong tương lai, nếu có nhu cầu quản lý tài khoản người dùng, phân quyền truy cập, metadata này có thể được tách ra một SQL database (ví dụ: PostgreSQL hoặc SQLite) để quản lý riêng biệt.

4. Thiết kế mở rộng cho tương lai (Future-Proofing)

Mặc dù ở bản demo ta chưa cần code phần này, nhưng kiến trúc nên chừa sẵn "đường lùi" cho các tác vụ nặng.
Khi mạng lưới vụ án lên tới hàng trăm ngàn Node, việc chạy thuật toán Phân cụm (Clustering) có thể tốn vài phút. Lúc đó, ta không thể để API block chờ đợi. Thiết kế nên hướng đến việc sử dụng một Message Queue (như RabbitMQ) để tiếp nhận yêu cầu phân tích, sau đó giao cho các background worker (những service chạy ngầm) xử lý. Khi xử lý xong, kết quả sẽ được đẩy ngược lại cho Frontend.

Ứng dụng sẽ được triển khai trên Docker Compose nhằm mục đích dễ dàng quản lý và triển khai.