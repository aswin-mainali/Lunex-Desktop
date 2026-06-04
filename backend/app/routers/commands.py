from fastapi import APIRouter
from ..command_router import CommandRouter
from ..database import get_connection
from ..models import CommandRequest, CommandResponse
from ..activation import activation_manager

router = APIRouter(prefix="/commands", tags=["commands"])
command_router = CommandRouter()

@router.post("/route", response_model=CommandResponse)
def route_command(payload: CommandRequest):
    activation_manager.begin_thinking()
    result = command_router.route(payload.command, payload.confirmed)
    with get_connection() as conn:
        conn.execute("INSERT INTO command_history(command_text, intent, safety_level, status, response) VALUES (?, ?, ?, ?, ?)", (payload.command, result["intent"], result["safety_level"], result["status"], result["response"]))
        conn.commit()
    if not result["requires_confirmation"]:
        activation_manager.complete()
    return result

@router.get("/history")
def history():
    with get_connection() as conn:
        return [dict(row) for row in conn.execute("SELECT * FROM command_history ORDER BY created_at DESC LIMIT 100")]
