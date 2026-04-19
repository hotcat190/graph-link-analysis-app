File này nêu các yêu cầu cho ứng dụng graph-link-analysis của tôi

1. Quản lý Vụ án (Workspace Management)

    Không gian làm việc độc lập: Cho phép người dùng chọn hoặc tạo một "Case" (Vụ án) mới. Dữ liệu của mỗi vụ án là một đồ thị (Graph) hoàn toàn tách biệt.

    Import dữ liệu mẫu: Hỗ trợ nạp một file dữ liệu tĩnh (ví dụ: JSON hoặc CSV) chứa sẵn danh sách Node và Edge để có thể demo ngay lập tức mà không cần nhập tay từng dữ liệu.

2. Trực quan hóa Mạng lưới (Graph Visualization)

    Biểu diễn trực quan: Hiển thị mạng lưới trên một Canvas 2D. Các Node nên được phân loại bằng màu sắc hoặc icon (VD: Node "Nghi phạm" màu đỏ, "Tài khoản ngân hàng" màu vàng).

    Tương tác vật lý: Người dùng có thể kéo thả (Drag & Drop) các Node để gom nhóm thủ công. Hệ thống tự động áp dụng lực đẩy/hút (Force-directed layout) để các Node không đè lên nhau.

    Điều hướng: Zoom in, Zoom out và Pan (kéo di chuyển) toàn bộ bản đồ.

    Bảng thông tin chi tiết (Property Panel): Khi click vào một Node hoặc Edge, một bảng thông tin bên cạnh sẽ hiện ra chi tiết (VD: Click vào Node người sẽ hiện Tên, CCCD, Địa chỉ; Click vào Edge chuyển tiền sẽ hiện Số tiền, Thời gian).

3. Tìm kiếm & Lọc (Search & Filter)

    Tìm kiếm toàn văn (Full-text Search): Gõ tên, số điện thoại hoặc biển số xe để ngay lập tức focus và highlight (làm nổi bật) Node đó trên đồ thị.

    Lọc theo loại (Type Filtering): Cho phép ẩn/hiện các loại Node hoặc Edge cụ thể (VD: "Chỉ hiển thị các mối quan hệ Chuyển tiền", ẩn bớt các mối quan hệ "Gọi điện" để đồ thị bớt rối).

    Lọc theo ngưỡng (Threshold Filtering): Lọc các Edge có trọng số cao (VD: Chỉ hiện các giao dịch trên 100 triệu VNĐ, hoặc các cuộc gọi kéo dài hơn 10 phút).

4. Phân tích Trinh thám (Link Analysis & Intelligence)

Đây là phần tạo ra giá trị lớn nhất cho ứng dụng của bạn:

    Truy vết đường đi ngắn nhất (Shortest Path): Chọn 2 Node bất kỳ (VD: Nghi phạm A và Quan chức B), ứng dụng sẽ tự động tính toán và highlight con đường ngắn nhất kết nối 2 người này (Ví dụ: A -> Gọi điện cho C -> C chuyển tiền cho B).

    Xác định Nút thắt/Trọng tâm (Centrality/High-Alert): Hệ thống tự động highlight các "Node trung tâm" - những Node có nhiều liên kết nhất. (VD: Một số điện thoại rác liên lạc với rất nhiều nghi phạm trong mạng lưới, báo hiệu đây có thể là kẻ chủ mưu hoặc người trung gian).

    Phân cụm tự động (Clustering/Community Detection): Tự động gom các Node có liên kết chằng chịt với nhau thành các nhóm (Community), giúp điều tra viên phát hiện ra một "băng đảng" hoặc "đường dây" ẩn giấu trong một mạng lưới lớn.