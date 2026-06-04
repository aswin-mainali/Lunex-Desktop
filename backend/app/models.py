from pydantic import BaseModel, Field
from typing import Any

class CommandRequest(BaseModel):
    command: str = Field(..., min_length=1)
    confirmed: bool = False

class CommandResponse(BaseModel):
    command: str
    intent: str
    safety_level: str
    status: str
    response: str
    requires_confirmation: bool = False
    activation_state: str = "complete"

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
    last_event: str | None = None
    warning: str | None = None

class TranscriptionResponse(BaseModel):
    transcript: str
    mocked: bool
    activation_state: str
