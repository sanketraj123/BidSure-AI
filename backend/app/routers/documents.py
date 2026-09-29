from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pathlib import Path
from uuid import uuid4
import json
from app.services.pdf_service import extract_pdf_text
from app.services.extraction_service import extract_fields
from app.services.compliance_engine import DEFAULT_REQUIREMENTS
from app.db import save_upload, recent_uploads

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("bidder")
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")
    if document_type not in {"bidder", "tender", "evidence"}:
        raise HTTPException(400, "document_type must be bidder, tender, or evidence.")
    file_id = str(uuid4())
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    path = UPLOAD_DIR / f"{file_id}_{safe_name}"
    path.write_bytes(await file.read())
    text = extract_pdf_text(path)
    extracted = extract_fields(text)
    save_upload(file_id, file.filename, document_type, json.dumps(extracted))
    response = {
        "file_id": file_id,
        "filename": file.filename,
        "document_type": document_type,
        "text_preview": text[:1500],
        "extracted": extracted
    }
    if document_type == "tender":
        response["requirements"] = DEFAULT_REQUIREMENTS
        response["total_requirements"] = len(DEFAULT_REQUIREMENTS)
    return response

@router.get("/recent")
def get_recent_uploads():
    return {"items": recent_uploads()}
