import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()

# uploads/ sits next to app.py
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def find_uploaded_file(file_id: str) -> Optional[Path]:
    """Return the saved file for this file_id, if it exists."""
    matches = list(UPLOAD_DIR.glob(f"{file_id}_*"))
    if matches:
        return matches[0]
    return None


@router.post("/api/upload")
async def upload_configuration(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was provided.")

    file_id = f"file_{uuid.uuid4().hex[:8]}"
    destination = UPLOAD_DIR / f"{file_id}_{file.filename}"

    contents = await file.read()
    destination.write_bytes(contents)

    return {
        "success": True,
        "file_id": file_id,
        "filename": file.filename,
        "message": "Configuration uploaded successfully",
    }
