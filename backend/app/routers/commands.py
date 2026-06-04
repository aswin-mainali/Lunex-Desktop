from fastapi import APIRouter
from ..command_router import CommandRouter
from ..database import get_connection
from ..models import CommandRequest, CommandResponse
from ..activation import activation_manager
from ..tasks import create_task, parse_task_command

router = APIRouter(prefix="/commands", tags=["commands"])
command_router = CommandRouter()

@router.post("/route", response_model=CommandResponse)
def route_command(payload: CommandRequest):
    activation_manager.begin_thinking()
    result = command_router.route(payload.command, payload.confirmed)
    task = None
    if result["intent"] in {"create_task", "create_reminder"} and result["status"] == "success":
        parsed = parse_task_command(payload.command)
        if not parsed["title"]:
            result["status"] = "clarification_required"
            result["response"] = "What should I call this task or reminder?"
            result["requires_confirmation"] = False
            result["activation_state"] = "responding"
        else:
            source = payload.source or "text_command"
            task = create_task(str(parsed["title"]), "Created from Lunex command router.", parsed["due_date"], parsed["due_time"], source)
            due = " without a specific time" if not parsed["due_date"] and not parsed["due_time"] else ""
            result["response"] = f"Added task: {task['title']}{due}."
            result["task"] = task
    with get_connection() as conn:
        conn.execute("INSERT INTO command_history(command_text, intent, safety_level, status, response) VALUES (?, ?, ?, ?, ?)", (payload.command, result["intent"], result["safety_level"], result["status"], result["response"]))
        conn.commit()
    if result.get("activation_state") == "blocked":
        activation_manager.state = "blocked"
    elif not result["requires_confirmation"]:
        activation_manager.complete()
    return result

@router.get("/history")
def history():
    with get_connection() as conn:
        return [dict(row) for row in conn.execute("SELECT * FROM command_history ORDER BY created_at DESC LIMIT 100")]
