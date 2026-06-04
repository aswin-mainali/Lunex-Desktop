from pydantic import BaseModel, Field
from typing import Any, Literal

TaskStatus = Literal["pending", "completed", "cancelled"]
TaskSource = Literal["manual", "text_command", "voice_command"]

class CommandRequest(BaseModel):
    command: str = Field(..., min_length=1)
    confirmed: bool = False
    source: TaskSource | None = None

class CommandResponse(BaseModel):
    command: str
    intent: str
    safety_level: str
    status: str
    response: str
    requires_confirmation: bool = False
    activation_state: str = "complete"
    task: dict[str, Any] | None = None

class MemoryCreate(BaseModel):
    title: str
    content: str
    tags: str = ""

class SettingUpdate(BaseModel):
    settings: dict[str, Any]

class ActivationStatus(BaseModel):
    state: str
    wake_listening: bool
    clap_listening: bool
    current_state: str
    wake_enabled: bool
    clap_enabled: bool
    last_event: str | None = None
    warning: str | None = None

class TranscriptionResponse(BaseModel):
    transcript: str
    mocked: bool
    activation_state: str
    message: str | None = None

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    notes: str = ""
    due_date: str | None = None
    due_time: str | None = None
    source: TaskSource = "manual"

class TaskUpdate(BaseModel):
    title: str | None = None
    notes: str | None = None
    due_date: str | None = None
    due_time: str | None = None
    status: TaskStatus | None = None
    source: TaskSource | None = None
