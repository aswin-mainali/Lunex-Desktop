from fastapi import APIRouter
from ..memory import list_memory, add_memory
from ..models import MemoryCreate

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("")
def get_memory():
    return list_memory()

@router.post("")
def create_memory(payload: MemoryCreate):
    return add_memory(payload.title, payload.content, payload.tags)
