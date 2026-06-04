from fastapi import APIRouter, HTTPException

from ..models import TaskCreate, TaskUpdate
from ..tasks import create_task, delete_task, list_tasks, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("")
def read_tasks(status: str | None = None):
    return list_tasks(status)

@router.post("")
def add_task(payload: TaskCreate):
    try:
        return create_task(payload.title, payload.notes, payload.due_date, payload.due_time, payload.source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.patch("/{task_id}")
def patch_task(task_id: int, payload: TaskUpdate):
    task = update_task(task_id, payload.model_dump(exclude_unset=True))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}")
def remove_task(task_id: int):
    if not delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True, "id": task_id}
