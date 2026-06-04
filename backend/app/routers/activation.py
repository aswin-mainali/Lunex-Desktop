from fastapi import APIRouter, Request
from ..activation import activation_manager, detect_wake_phrase_text
from ..database import get_connection
from ..models import ActivationStatus, WakeCheckResponse
from ..settings import update_settings

router = APIRouter(prefix="/activation", tags=["activation"])

def log(event_type: str, state: str, details: str = ""):
    with get_connection() as conn:
        conn.execute("INSERT INTO activation_events(event_type, state, details) VALUES (?, ?, ?)", (event_type, state, details))
        conn.commit()

def status_payload():
    return ActivationStatus(
        state=activation_manager.state,
        current_state=activation_manager.state,
        wake_listening=activation_manager.wake_listening,
        wake_enabled=activation_manager.wake_listening,
        clap_listening=activation_manager.clap_listening,
        clap_enabled=activation_manager.clap_listening,
        last_event=activation_manager.last_event or "none",
        warning=activation_manager.warning,
    )

@router.post("/check-wake", response_model=WakeCheckResponse)
async def check_wake(request: Request):
    transcript = ""
    mock = False
    message = None
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        data = await request.json()
        transcript = str(data.get("transcript", ""))
    elif "multipart/form-data" in content_type:
        # First-version fallback: audio wake chunks require browser speech recognition or future STT.
        await request.form()
        mock = True
        message = "Wake audio chunk received; no local transcription provider is configured for this fallback."
    detected, phrase = detect_wake_phrase_text(transcript)
    if detected and activation_manager.wake_listening:
        activation_manager.wake("wake_phrase")
        log("wake", "detected", phrase or "wake phrase")
    return WakeCheckResponse(wake_detected=detected and activation_manager.wake_listening, phrase=phrase, transcript=transcript, mock=mock, message=message)

@router.post("/wake/start")
def wake_start():
    activation_manager.start_wake(); update_settings({"wake_phrase_enabled": True, "wake_enabled": True}); log("wake", "on")
    return status_payload()

@router.post("/wake/stop")
def wake_stop():
    activation_manager.stop_wake(); update_settings({"wake_phrase_enabled": False, "wake_enabled": False}); log("wake", "off")
    return status_payload()

@router.post("/wake/simulate")
def wake_simulate():
    activation_manager.wake("wake_phrase"); log("wake", "detected", "simulated Hey Lunex")
    return status_payload()

@router.post("/clap/start")
def clap_start():
    activation_manager.start_clap(); update_settings({"double_clap_enabled": True, "clap_enabled": True}); log("clap", "on")
    return status_payload()

@router.post("/clap/stop")
def clap_stop():
    activation_manager.stop_clap(); update_settings({"double_clap_enabled": False, "clap_enabled": False}); log("clap", "off")
    return status_payload()

@router.post("/clap/simulate")
def clap_simulate():
    activation_manager.wake("double_clap"); log("clap", "detected", "simulated double clap")
    return status_payload()

@router.get("/status", response_model=ActivationStatus)
def activation_status():
    return status_payload()
