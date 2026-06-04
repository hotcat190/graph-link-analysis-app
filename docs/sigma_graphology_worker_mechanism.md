# Nguyên lý Hoạt động: Graphology + ForceAtlas2 Web Worker + Sigma.js

Tài liệu này giải thích chi tiết cơ chế hoạt động bất đồng bộ và đồng bộ dữ liệu giữa ba thành phần chính khi xử lý đồ thị quy mô lớn: **Graphology** (Quản lý trạng thái), **ForceAtlas2 Web Worker** (Tính toán giải thuật off-thread), và **Sigma.js** (Render WebGL hiệu năng cao).

---

## 1. Vai trò của từng thành phần

```
+-----------------------------------------------------------------------------------+
| Trình duyệt (Browser Main Thread)                                                 |
|                                                                                   |
|  +------------------+  1. Đọc dữ liệu & sự kiện   +----------------------------+  |
|  |    Graphology    | ==========================> |          Sigma.js          |  |
|  |  (State Manager)  | <========================= |      (WebGL Renderer)      |  |
|  +------------------+   4. Cập nhật vị trí x, y   +----------------------------+  |
|         ||                                                                        |
|         || 2. postMessage (Cấu trúc đồ thị)                                       |
|         || 3. postMessage (Tọa độ x, y mới liên tục)                              |
|         \/                                                                        |
+-----------------------------------------------------------------------------------+
          ||
          || (Giao tiếp liên luồng - Thread Boundary)
          \/
+-----------------------------------------------------------------------------------+
| Web Worker Thread (Chạy nền)                                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                      ForceAtlas2 Layout Calculation Loop                    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 1.1. Graphology: Bộ não quản lý Trạng thái đồ thị (Graph State Manager)
* **Bản chất**: Là một thư viện JavaScript lưu trữ cấu trúc đồ thị trong bộ nhớ (In-memory Graph Representation).
* **Nhiệm vụ**:
  * Lưu trữ danh sách Nodes, Edges và các thuộc tính đi kèm (Attributes) như nhãn (label), loại (type), màu sắc, kích thước, và đặc biệt là tọa độ (`x`, `y`).
  * Quản lý danh sách kề (Adjacency List) để tối ưu hóa việc tìm kiếm hàng xóm và duyệt đồ thị.
  * Cung cấp cơ chế **Event-driven (Emitter)**. Khi một thuộc tính của Node hoặc Edge thay đổi (ví dụ: cập nhật tọa độ `x`, `y`), Graphology sẽ phát ra một sự kiện (event) để thông báo cho các bên quan tâm (như Sigma.js).

### 1.2. ForceAtlas2 Web Worker: Động cơ vật lý chạy ngầm (Off-thread Physics Engine)
* **Bản chất**: ForceAtlas2 là giải thuật sắp xếp đồ thị theo mô hình lực cơ học (Force-directed layout). Node đẩy nhau (repulsion) như nam châm cùng cực, Edge kéo nhau (attraction) như lò xo.
* **Nhiệm vụ**:
  * Web Worker là một luồng chạy ngầm (Background Thread) độc lập với Main UI Thread của trình duyệt.
  * Chịu trách nhiệm thực hiện các phép toán vật lý cực kỳ nặng để tính toán tọa độ `x`, `y` cho hàng chục ngàn node.
  * Do chạy trên Worker, các vòng lặp tính toán khổng lồ này sẽ **không làm đơ/lag giao diện** của người dùng.

### 1.3. Sigma.js: Bộ xử lý hiển thị WebGL (GPU Renderer)
* **Bản chất**: Là thư viện render đồ thị sử dụng WebGL (card màn hình GPU) thay vì Canvas 2D truyền thống.
* **Nhiệm vụ**:
  * Sigma.js lắng nghe sự thay đổi trạng thái từ Graphology.
  * Nhận tọa độ `x`, `y` từ Graphology, nạp trực tiếp vào WebGL buffers và ra lệnh cho GPU vẽ lại toàn bộ đồ thị ở tốc độ 60 FPS.
  * Bắt các sự kiện tương tác của người dùng (zoom, pan, drag node) và chuyển dịch tọa độ camera.

---

## 2. Quy trình đồng bộ dữ liệu (Step-by-Step Lifecycle)

Quy trình hoạt động phối hợp giữa ba thành phần diễn ra theo các bước tuần tự sau:

### Bước 1: Khởi tạo và Load dữ liệu ban đầu
1. Frontend nhận dữ liệu đồ thị từ Neo4j Backend (dưới dạng danh sách nodes/edges).
2. Frontend khởi tạo một instance **Graphology** trống và nạp dữ liệu này vào:
   ```javascript
   import Graph from 'graphology';
   const graph = new Graph();
   graph.import(neo4jData); // Mỗi node cần có tọa độ x, y ngẫu nhiên ban đầu
   ```
3. Frontend khởi tạo **Sigma.js** liên kết với instance `graph` này và gắn vào một thẻ `div` container:
   ```javascript
   import Sigma from 'sigma';
   const renderer = new Sigma(graph, container);
   ```

### Bước 2: Kích hoạt Web Worker để chạy Layout
1. Chúng ta khởi chạy ForceAtlas2 dưới dạng Worker bằng cách sử dụng module hỗ trợ sẵn của Graphology:
   ```javascript
   import FA2Layout from 'graphology-layout-forceatlas2/worker';
   const layout = new FA2Layout(graph, { settings: { gravity: 1 } });
   layout.start(); // Khởi chạy luồng Worker ngầm
   ```
2. Lúc này, thư viện tự động đóng gói cấu trúc đồ thị (chỉ gửi danh sách các node, liên kết edge và tọa độ hiện tại) chuyển qua Worker bằng cơ chế `postMessage` của trình duyệt.

### Bước 3: Vòng lặp tính toán và Phản hồi (Calculations & Updates Loop)
1. **Bên trong Web Worker**: 
   * Thuật toán ForceAtlas2 chạy một vòng lặp vô hạn (hoặc giới hạn số lượt chạy) để cập nhật tọa độ:
     * Tính lực đẩy giữa các node: $O(N^2)$ hoặc $O(N \log N)$ với Barnes-Hut.
     * Tính lực hút dọc theo các edge: $O(M)$.
     * Cộng dồn vector lực để tìm tọa độ `x`, `y` mới cho mỗi node.
2. **Gửi dữ liệu về Main Thread**:
   * Định kỳ (sau vài mili-giây hoặc sau mỗi frame tính toán), Web Worker gửi một mảng chứa tọa độ `[id, x, y]` mới của tất cả các node quay trở lại Main Thread qua `postMessage`.
3. **Cập nhật Graphology State**:
   * Trình lắng nghe sự kiện trên Main Thread nhận dữ liệu tọa độ mới, duyệt qua mảng và gọi hàm cập nhật trực tiếp lên các node trong Graphology:
     ```javascript
     graph.setNodeAttribute(nodeId, 'x', newX);
     graph.setNodeAttribute(nodeId, 'y', newY);
     ```
   * *Lưu ý*: Việc cập nhật này diễn ra rất nhanh vì chỉ thay đổi thuộc tính số của đối tượng JS trong bộ nhớ.

### Bước 4: Vẽ lại màn hình bằng WebGL (WebGL Redraw)
1. Mỗi khi thuộc tính `x`, `y` của node trong Graphology thay đổi, Graphology phát ra sự kiện nội bộ `nodeAttributesUpdated`.
2. Sigma.js đã lắng nghe sự kiện này từ trước. Khi nhận tín hiệu, Sigma.js sẽ tự động:
   * Cập nhật lại mảng tọa độ trong WebGL vertex buffer.
   * Gọi hàm `requestAnimationFrame` của trình duyệt để yêu cầu GPU vẽ lại frame mới.
3. Người dùng sẽ nhìn thấy các node trên màn hình chuyển động mượt mà, tự động giãn cách ra cho đến khi đồ thị đạt trạng thái cân bằng (lực triệt tiêu lẫn nhau).

### Bước 5: Người dùng kéo thả Node thủ công (Manual Drag & Drop)
1. Khi người dùng bấm giữ và kéo một node trên canvas:
   * Sigma.js phát hiện sự kiện kéo thả chuột, chuyển đổi tọa độ pixel của chuột thành tọa độ thế giới (world coordinates) của đồ thị.
   * Sigma.js trực tiếp ghi đè tọa độ này vào Graphology:
     ```javascript
     graph.setNodeAttribute(draggedNodeId, 'x', mouseX);
     graph.setNodeAttribute(draggedNodeId, 'y', mouseY);
     ```
2. Nếu Web Worker vẫn đang chạy (`layout.start()`):
   * Worker sẽ nhận được thông báo tọa độ node bị kéo đã thay đổi.
   * Giải thuật FA2 sẽ coi node này là một vật thể bị ghim (pinned node) tại vị trí chuột, các node xung quanh sẽ tự động co giãn theo vị trí mới này trong luồng tính toán ngầm tiếp theo.
3. Khi người dùng thả chuột, vị trí mới được cố định và lưu lại.

---

## 3. Tại sao mô hình này tối ưu cho 10,000 Nodes / 30,000 Edges?

1. **Không nghẽn Main Thread**: Main Thread chỉ làm nhiệm vụ nhận tọa độ đã được tính sẵn từ Worker và chuyển cho GPU vẽ. Luồng xử lý giao diện của trình duyệt hoàn toàn rảnh tay để phản hồi các tương tác zoom/pan/click của người dùng mà không bị khựng (freeze).
2. **WebGL Batching**: Sigma.js gom toàn bộ dữ liệu vẽ nodes và edges thành các batches lớn để gửi lên GPU một lần, tận dụng khả năng tính toán song song hàng ngàn luồng của GPU để vẽ đồ thị trong vài micro-giây.
3. **Khớp nối State hoàn hảo**: Graphology đóng vai trò như một Single Source of Truth ở Frontend. Cả Web Worker (đầu vào/đầu ra tính toán) và Sigma.js (đầu ra hiển thị) đều giao tiếp thông qua Graphology, tránh việc dữ liệu bị đồng bộ lệch pha (race conditions).
