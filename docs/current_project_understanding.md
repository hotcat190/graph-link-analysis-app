# Current Project Understanding - Graph Link Analysis App

Graph Link Analysis App (also referred to as Nexus Link Analysis) is a visual investigation tool designed to explore and analyze entity relationship graphs for crime investigations, fraud detection, and threat intelligence.

## Core Architecture

### 1. Database & Case Isolation
- **Database**: Neo4j 5 (Community Edition).
- **Case Isolation**: Since Neo4j Community Edition does not support running multiple concurrent database instances, the application implements case isolation using a `caseId` property.
  - A metadata node `(:Case {id: string, name: string, description: string, createdAt: datetime})` defines each workspace.
  - All data nodes (e.g. `:Person`, `:Phone`, `:Bank`, `:Company`) and relationships (e.g. `[:SOHUU]`, `[:GOIDIEN]`, `[:CHUYENTIEN]`) carry a `caseId` attribute linking them to a specific case.
  - Database indexes are created on `caseId` for all entity types (e.g., `Person`, `Phone`, `Bank`, `Company`) to optimize retrieval performance.

### 2. Backend API
- **Framework**: FastAPI (Python) with Neo4j Python Driver.
- **Endpoints**:
  - `GET /api/cases`: Retrieve cases.
  - `POST /api/cases?seed=true`: Create a case with optional mock seed data.
  - `PATCH /api/cases/{case_id}`: Edit case details.
  - `DELETE /api/cases/{case_id}`: Delete a case and clean up all associated nodes/edges bearing its `caseId`.
  - `GET /api/cases/{case_id}/graph`: Fetch graph data for Cytoscape.js formatted as JSON.

### 3. Frontend Visualization & UI (Cytoscape.js & Graphology Integration)
- **Current Framework**: React 19, TailwindCSS, and **Cytoscape.js** (2D Canvas rendering).
- **Engine Switcher**: Successfully implemented a toggle button in the Header to switch dynamically between **Cytoscape (2D)** and **Sigma.js (WebGL)** rendering.
- **Client-Side Bolt Connection**: Browser connects directly to Neo4j via Bolt protocol (`bolt://localhost:7687`) from the client-side utilizing `graphology-neo4j`'s `cypherToGraph` for direct query hydration.
- **WebGL Shader Program Type Resolution**:
  - *Technical Issue*: Sigma.js reserves the `type` node/edge attribute to determine the WebGL program (shader) to use (e.g. `'circle'`, `'arrow'`). When hydrated from Neo4j, nodes have properties like `type: 'person'` or `type: 'phone'`. Sigma's constructor immediately throws a `could not find a suitable program for node type "person"` crash.
  - *Resolution*: Pass baseline `nodeReducer` and `edgeReducer` directly inside the `new Sigma(...)` constructor options that override the visual type to `'circle'` and `'arrow'`. During subsequent rendering cycles, the reducers dynamic settings are updated to maintain color mapping (Person = Blue, Phone = Orange, Company = Purple, Bank = Green) and selections. Since the Graphology graph attributes themselves are not mutated, functions retrieving node properties (like detail panels) still get the correct semantic `type`.
- **ForceAtlas2 Layout Stabilization & Convergence**:
  - *Problem*: Nodes exhibit continuous wobbly movement and take too long to stabilize because the ForceAtlas2 physics solver runs endlessly on a separate Web Worker thread.
  - *Resolution*: Configured optimized settings (`gravity: 0.2` and `slowDown: 10`) to reduce compression forces and dampen node velocities. Implemented an auto-stop timer that stops the worker 4 seconds after mount or manual reset.
- **Node Drag-and-Drop (Single & Multi-Node)**:
  - *Interaction*: Single node dragging is implemented by listening to `downNode`, `moveBody`, and `upNode`/`upStage` events.
  - *Multi-Node*: Shift-clicking nodes toggles their inclusion in a multi-selected Set. Dragging any selected node moves all selected nodes together by the drag delta.
  - *Worker Synchronization*: Since the layout worker's internal matrix doesn't automatically synchronize attributes updated on the main thread, the layout solver is stopped during drag. Moved nodes are marked with `fixed: true`. When dragging ends, the layout is restarted briefly (3 seconds) to let other nodes adapt to the new positions, and then stopped again.
- **Rectangle Box Selection**:
  - *Interaction*: Shift-drag on the background stage draws a dashed bounding box overlay.
  - *Logic*: Real-time coordinate checking translates graph coordinates to viewport coordinates using `renderer.graphToViewport`. Nodes within the rectangle boundaries are dynamically highlighted and selected.
- **Floating Controls Panel**:
  - *Interface*: A glassmorphic overlay containing controls for zooming (In/Out/Center), manual layout Play/Pause toggle (with state indicator), layout re-run/reset (slight randomization + run for 4s), and "Unpin All" to clear `fixed: true` on all nodes.
- **Property Panel Multi-Selection support**:
  - *Interface*: Detects if selected data is an array and renders a clean, tag-labeled list of all selected nodes instead of details for a single node.
- **Docker Workflow constraint**:
  - Since the `./frontend` container builds without a mapped volume directory, any local changes to frontend files require rebuilding the container via `docker compose up -d --build web` to take effect.

## Developer Tooling & CLI
- **Seed CLI Utility**: Located in [main.py](file:///d:/dev/graph-link-analysis-app/backend/src/cli/main.py) and [dev.py](file:///d:/dev/graph-link-analysis-app/backend/src/cli/commands/dev.py).
  - Can be executed from `backend/` using: `python src/cli/main.py dev seed -n <case_name> --nodes <count> --edges <count> --topology <scale-free|clustered|random> [--append]`
  - Supports `--append` to add to an existing case, or defaults to resetting the case data.
  - Automatically generates realistic Vietnamese names for Person entities, valid phone numbers, bank accounts, and company names.
  - Builds relationship types based on target and source node types (e.g., `SOHUU`, `GOIDIEN`, `CHUYENTIEN`, `RUATIEN`, `CODONG`).
  - Implements optimized bulk creation using Cypher `UNWIND` batches grouped by node label and relationship signature.

## 4. Future Features (Planned)
- **Transform (Data Enrichment) Feature [Priority: Low]**:
  - Hỗ trợ làm giàu thông tin đồ thị bằng cách gọi các dịch vụ bên ngoài (DNS lookup, WHOIS, Geolocation, v.v.) từ các Node đã chọn trên Canvas.
  - Khác biệt triển khai: OGI sử dụng RDBMS (PostgreSQL/SQLite) với các bảng `entities` và `edges` riêng biệt. Ứng dụng này sử dụng **Neo4j** (LPG - Labeled Property Graph), cho phép lưu trữ Node và Edge trực tiếp dưới dạng cấu trúc đồ thị tự nhiên của cơ sở dữ liệu.
  - Cô lập Workspace: Các Node và Edge mới được tạo ra từ transform phải được gán thuộc tính `caseId` tương ứng để đảm bảo tính cô lập giữa các vụ án.



