from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.audit import router as audit_router
from routes.graph import router as graph_router
from routes.remediate import router as remediate_router
from routes.upload import router as upload_router

app = FastAPI(
    title="SIH 2026 Network Security Compliance Auditor API",
    description="API integration layer that connects the React frontend with future engines.",
)

# Allow local React apps (Create React App, Vite, etc.) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(audit_router)
app.include_router(graph_router)
app.include_router(remediate_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend is reachable",
    }
