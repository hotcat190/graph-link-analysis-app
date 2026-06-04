# Neo4j Developer Seeding Commands

Use these commands to seed test data directly into the running Neo4j database using the CLI inside the `link_analysis_api` container.

## 1. Seed a Large Scale-Free Graph (Reset Mode)
To create a new case named "Vụ án lớn mẫu" with 2500 nodes and 6000 edges using scale-free topology (preferential attachment):

```bash
docker exec -it link_analysis_api python cli/main.py dev seed -n "Vụ án lớn mẫu" --nodes 2500 --edges 6000 --topology scale-free
```

## 2. Seed a Clustered Graph (Reset Mode)
To create a new case named "Vụ án phân cụm" with 1000 nodes and 3000 edges using clustered topology (90% intra-cluster, 10% inter-cluster connections):

```bash
docker exec -it link_analysis_api python cli/main.py dev seed -n "Vụ án phân cụm" --nodes 1000 --edges 3000 --topology clustered
```

## 3. Append to an Existing Graph
To append 500 nodes and 1200 edges to an existing case named "Vụ án lớn mẫu" without deleting the existing nodes and relationships:

```bash
docker exec -it link_analysis_api python cli/main.py dev seed -n "Vụ án lớn mẫu" --nodes 500 --edges 1200 --topology scale-free --append
```

## 4. Seed with a Custom Case ID
To seed or append to a case with a specific custom ID:

```bash
docker exec -it link_analysis_api python cli/main.py dev seed -n "Vụ án định danh" --case-id "my-custom-case-123" --nodes 100 --edges 250
```

---

## Command Options Reference
Run this command to print the full options list:
```bash
docker exec -it link_analysis_api python cli/main.py dev seed --help
```

- `-n, --name TEXT`: Name of the case (required).
- `--case-id TEXT`: Unique ID for the case (optional). If not specified, the tool automatically resolves or creates one.
- `--nodes INTEGER`: Number of nodes to seed (default: 500).
- `--edges INTEGER`: Number of edges to seed (default: 1500).
- `--topology TEXT`: Graph topology: `scale-free`, `clustered`, or `random` (default: `scale-free`).
- `-a, --append`: If provided, appends the generated nodes/edges to the existing case instead of deleting it.
