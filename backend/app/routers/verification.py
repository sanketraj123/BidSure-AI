from fastapi import APIRouter
from app.sandbox.mock_api import verify_all

router = APIRouter()

@router.post("/sandbox")
def sandbox_verify(extracted: dict):
    return {"synthetic": True, "results": verify_all(extracted)}
