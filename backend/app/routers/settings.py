from fastapi import APIRouter
from ..models import SettingUpdate
from ..settings import get_settings, update_settings

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
def read_settings():
    return get_settings()

@router.post("")
def save_settings(payload: SettingUpdate):
    return update_settings(payload.settings)
