from fastapi import APIRouter
from ..database import get_db_path

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok", "app": "Lunex", "database": str(get_db_path()), "openai_required": False}
