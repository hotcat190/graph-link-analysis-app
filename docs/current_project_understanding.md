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

### 3. Frontend Visualization & UI (Decision Pending Transition)
- **Current Framework**: React 19, TailwindCSS, and **Cytoscape.js** (2D Canvas rendering).
- **Target Scale Constraint**: 10,000+ nodes and 30,000+ edges.
- **Strategic Transition to Sigma.js/Graphology (WebGL)**:
  - *Current Status*: Cytoscape.js is functional for the MVP phase, but it cannot render the target scale (will freeze above 2,000 nodes due to CPU rendering limitations of Canvas 2D).
  - *Decision*: Transitioning frontend rendering to **Sigma.js / Graphology** immediately is necessary to avoid building extensive Cytoscape styling and interaction logic that will be discarded.
  - *Tradeoffs*: Sigma.js offers superior performance (handles 50k+ nodes at 60fps) but requires custom WebGL shaders for advanced nodes/badges/borders styling, lacks native compound nodes (must manage collapsing logic manually in `graphology` state), and requires manual implementation of node/edge interactive editing tools.
  - *Mechanism*: Detailed documentation on how Graphology, Sigma.js, and ForceAtlas2 Web Workers work together is located at [sigma_graphology_worker_mechanism.md](file:///d:/dev/graph-link-analysis-app/docs/sigma_graphology_worker_mechanism.md).

## Developer Tooling & CLI
- **Seed CLI Utility**: Located in [main.py](file:///d:/dev/graph-link-analysis-app/backend/src/cli/main.py) and [dev.py](file:///d:/dev/graph-link-analysis-app/backend/src/cli/commands/dev.py).
  - Can be executed from `backend/` using: `python src/cli/main.py dev seed -n <case_name> --nodes <count> --edges <count> --topology <scale-free|clustered|random> [--append]`
  - Supports `--append` to add to an existing case, or defaults to resetting the case data.
  - Automatically generates realistic Vietnamese names for Person entities, valid phone numbers, bank accounts, and company names.
  - Builds relationship types based on target and source node types (e.g., `SOHUU`, `GOIDIEN`, `CHUYENTIEN`, `RUATIEN`, `CODONG`).
  - Implements optimized bulk creation using Cypher `UNWIND` batches grouped by node label and relationship signature.


