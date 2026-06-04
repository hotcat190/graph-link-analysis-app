# Demo for a graph link analysis app

## Features
- UI Interactions: Selecting, deselecting, dragging, zooming, panning
- Search: Search for nodes by label
- Highlighting: Highlight matched nodes and edges
- Fading: Fade out non-matched nodes and edges

See docs/features.md for more details and planned features.

## Technology
- Frontend: ReactJS (Vite), Cytoscape.js (Graph Rendering), TailwindCSS, Axios.
- Backend: FastAPI (Python).
- Database: Neo4j (Graph Database) + Bolt Protocol.
- Deployment/Infra: Docker & Docker Compose.

See docs/architecture.md for more details and planned changes.

## Building and Running
Run `docker-compose up --d` to start the application.

Access the UI application at http://localhost:5173.

Optionally, start only the backend and database services with `docker compose up --d api db` and do the following steps to start the frontend locally:
1. Create a `.env` file in `/frontend/` and put `VITE_API_URL=http://localhost:8000`
2. Run the following commands:
```
cd frontend
npm install
npm run dev
```

Run `docker-compose stop` to stop the application.

## Code structure

The project is currently continuously evolving, see `docs/current_project_understanding.md` for more details.

The backend is exposed on port 8000: `http://localhost:8000`

The Neo4j database is configured as follows:
- User: `neo4j`
- Password: `password`
- UI: `http://localhost:7474`
- Bolt Protocol: `bolt://db:7687`


