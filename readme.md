# Demo for a graph link analysis app

## Features
- UI Interactions: Selecting, deselecting, dragging, zooming, panning
- Search: Search for nodes by label
- Highlighting: Highlight matched nodes and edges
- Fading: Fade out non-matched nodes and edges


## Technology
- Frontend: ReactJS (Vite), Cytoscape.js (Graph Rendering), TailwindCSS, Axios.
- Backend: FastAPI (Python).
- Database: Neo4j (Graph Database) + Bolt Protocol.
- Deployment/Infra: Docker & Docker Compose.

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
### Frontend
- `src/App.jsx`: The main application screen.
- `src/index.css`: The index CSS file.
- `src/components/`: Holds components such as `PropertyPanel`, `NetworkGraph`.
- `src/hooks/`: Holds React hooks such as `useCytoscape`, `useGraphData`, `useGraphSearch`.
- `src/utils/`: Holds utils functions such as calculating the PropertyPanel position for a node.
- `src/styles/`: Holds styles/css files. Currently only contains `cytoscapeStyles.js`

### Backend
Currently only contains `src/main.py` which is the main service.

On start-up, the backend seeds a static graph data to the DB by deleting data from the last session and creating new data.

An endpoint `GET /api/graph` is provided that will return this static graph data.

The backend is exposed on port 8000: `http://localhost:8000`

### Database
The Neo4j database is configured as follows:
- User: `neo4j`
- Password: `password`
- UI: `http://localhost:7474`
- Bolt Protocol: `bolt://db:7687`


