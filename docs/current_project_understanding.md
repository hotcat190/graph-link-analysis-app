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

### 3. Frontend Visualization & UI (Cytoscape.js & Graphology Experiment)
- **Current Framework**: React 19, TailwindCSS, and **Cytoscape.js** (2D Canvas rendering).
- **New Direction / Experiment**:
  - *Decision*: Experiment with **Graphology** and **Sigma.js** as an alternative rendering engine, driven by the discovery of `graphology-neo4j`.
  - *Rationale*: The `graphology-neo4j` library provides direct mapping of Neo4j Cypher query results into Graphology state data structure (using `cypherToGraph`), simplifying graph hydration.
  - *Target Scale Constraint*: Small datasets (~100 nodes) for initial testing, with potential WebGL performance advantages from Sigma.js for future scaling.
  - *Approach*: Implement an **Engine Switcher** on the UI to allow switching rendering between Cytoscape.js and Sigma.js + Graphology, allowing side-by-side evaluation of UX, visual styling, and development complexity.

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



