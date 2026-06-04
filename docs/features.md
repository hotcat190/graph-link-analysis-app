# Yêu cầu tính năng (Features Checklist)

## 1. Quản lý Vụ án (Workspace Management)
- [ ] **Không gian làm việc độc lập (Case Workspace)**
  - [ ] Cho phép tạo vụ án (Case) mới hoặc chọn vụ án hiện có.
  - [ ] Dữ liệu đồ thị giữa các vụ án phải hoàn toàn độc lập.
- [ ] **Import dữ liệu mẫu (Sample Import)**
  - [ ] Hỗ trợ nạp file tĩnh (JSON/CSV) chứa sẵn danh sách Node và Edge để demo nhanh.

## 2. Trực quan hóa Mạng lưới (Graph Visualization)
- [x] **Biểu diễn trực quan (Visual Representation)**
  - [x] Hiển thị đồ thị trên Canvas 2D.
  - [x] Phân loại Node bằng màu sắc/icon theo thuộc tính `type` (Ví dụ: Nghi phạm = Đỏ, Tài khoản ngân hàng = Vàng).
- [x] **Tương tác vật lý (Physical Interaction)**
  - [x] Hỗ trợ kéo thả (Drag & Drop) Node để gom nhóm thủ công.
  - [x] Tự động sắp xếp vị trí Node sử dụng thuật toán Force-directed layout để tránh chồng chéo.
- [x] **Điều hướng Canvas (Canvas Navigation)**
  - [x] Cho phép Zoom in, Zoom out và Pan (kéo di chuyển bản đồ).
- [x] **Bảng thông tin chi tiết (Property Panel)**
  - [x] Click vào Node: Hiển thị thuộc tính chi tiết (Tên, CCCD, Địa chỉ,...).
  - [x] Click vào Edge: Hiển thị thuộc tính quan hệ (Số tiền chuyển, Thời gian, Thời lượng cuộc gọi,...).

## 3. Tìm kiếm & Lọc (Search & Filter)
- [ ] **Tìm kiếm toàn văn (Full-text Search)**
  - [ ] Tìm kiếm Node theo Tên, Số điện thoại, Biển số xe,... (Hiện tại mới chỉ tìm kiếm theo `label`).
  - [x] Focus và highlight Node kết quả trên đồ thị.
- [ ] **Lọc theo loại (Type Filtering)**
  - [ ] Ẩn/hiện danh mục Node/Edge cụ thể (Ví dụ: Chỉ hiện giao dịch chuyển tiền, ẩn liên lạc điện thoại).
- [ ] **Lọc theo ngưỡng (Threshold Filtering)**
  - [ ] Lọc các quan hệ (Edge) có trọng số cao (Ví dụ: Giao dịch > 100M VNĐ, thời lượng gọi > 10 phút).

## 4. Phân tích Trinh thám (Link Analysis & Intelligence)
- [ ] **Truy vết đường đi ngắn nhất (Shortest Path)**
  - [ ] Chọn 2 Node bất kỳ và tự động tính toán, highlight đường đi kết nối ngắn nhất giữa chúng (Ví dụ: A -> Gọi điện cho C -> C chuyển tiền cho B).
- [ ] **Xác định trọng tâm/Nút thắt (Centrality/High-Alert)**
  - [ ] Tự động phát hiện và highlight các Node có nhiều liên kết nhất (Node trung tâm, kẻ chủ mưu hoặc trung gian).
- [ ] **Phân cụm tự động (Clustering/Community Detection)**
  - [ ] Gom các Node có liên kết dày đặc thành các nhóm (băng nhóm, đường dây) bằng thuật toán phát hiện cộng đồng.

## 5. Làm giàu dữ liệu tự động (Data Enrichment / Transform)
- [ ] **Làm giàu dữ liệu tự động (Transform Feature) - [Priority: Low]**
  - [ ] Hỗ trợ gọi các dịch vụ bên ngoài (DNS lookup, WHOIS, Geolocation, v.v.) để tự động làm giàu thông tin cho một Node được chọn trên Canvas.
  - [ ] Tự động tạo và liên kết các thực thể (Node) mới và mối quan hệ (Edge) mới vào cơ sở dữ liệu Neo4j.
  - [ ] Lưu vết lịch sử chạy transform (Audit Log) để theo dõi và phục vụ công tác đối soát.

## 6. AI Investigator [Priority: Low]
