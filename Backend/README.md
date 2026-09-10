# SIH 2026 Backend — API Integration Layer

This backend is the **API integration layer** for the project:

**AI-Driven Multi-Vendor Network Security Compliance Auditor**

It exposes FastAPI endpoints so the React frontend can upload configuration files, request an audit, fetch graph data, and request remediation. The actual audit, graph, vendor-parser, and AI engine[...]

## Project structure

```
backend/
├── app.py
├── routes/
│   ├── upload.py
│   ├── audit.py
│   ├── graph.py
│   └── remediate.py
├── uploads/
├── requirements.txt
└── README.md
```

## Installation

From the `backend` folder:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
pip install -r requirements.txt
```

macOS / Linux:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

## Start the server

From the `backend` folder:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Check that the backend is reachable |
| POST | `/api/upload` | Upload a configuration file |
| POST | `/api/audit` | Accept an audit request for an uploaded file |
| GET | `/api/graph/{audit_id}` | Return mock graph data for an audit |
| POST | `/api/remediate` | Return a mock remediation recommendation |

### GET `/api/health`

Response:

```json
{
  "status": "ok",
  "message": "Backend is reachable"
}
```

### POST `/api/upload`

Send `multipart/form-data` with a file field named `file`.

The file is saved in `uploads/`. It is **not** parsed or analyzed.

Example response:

```json
{
  "success": true,
  "file_id": "file_123",
  "filename": "router_config.txt",
  "message": "Configuration uploaded successfully"
}
```

### POST `/api/audit`

Request body:

```json
{
  "file_id": "file_123"
}
```

The backend checks that the uploaded file exists. The real audit engine is not implemented yet.

Example response:

```json
{
  "success": true,
  "audit_id": "audit_123",
  "file_id": "file_123",
  "status": "completed",
  "message": "Audit completed successfully"
}
```

If `file_id` is missing: `400`. If the file is not found: `404`.

### GET `/api/graph/{audit_id}`

Example: `/api/graph/audit_123`

Mock graph response (replace later with the real graph engine):

```json
{
  "success": true,
  "audit_id": "audit_123",
  "nodes": [
    {
      "id": "router_1",
      "label": "Cisco Router",
      "type": "device"
    }
  ],
  "edges": []
}
```

### POST `/api/remediate`

Request body:

```json
{
  "audit_id": "audit_123",
  "finding_id": "SSH-001"
}
```

Example response:

```json
{
  "success": true,
  "audit_id": "audit_123",
  "finding_id": "SSH-001",
  "recommendation": "Enable secure SSH configuration",
  "status": "recommended"
}
```

If `audit_id` or `finding_id` is missing/empty: `400`.

## How the React frontend will communicate

1. Run this API on `http://127.0.0.1:8000`.
2. CORS is enabled for common local React URLs:
   - `http://localhost:3000` (Create React App)
   - `http://localhost:5173` (Vite)
3. Frontend calls (example with `fetch`):

```javascript
const API_BASE = "http://127.0.0.1:8000";

// Health
await fetch(`${API_BASE}/api/health`);

// Upload
const formData = new FormData();
formData.append("file", selectedFile);
await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });

// Audit
await fetch(`${API_BASE}/api/audit`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ file_id: fileId }),
});

// Graph
await fetch(`${API_BASE}/api/graph/${auditId}`);

// Remediate
await fetch(`${API_BASE}/api/remediate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ audit_id: auditId, finding_id: "SSH-001" }),
});
```

Typical flow: **upload file → audit with `file_id` → graph with `audit_id` → remediate with `audit_id` and `finding_id`**.
