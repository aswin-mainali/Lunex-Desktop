from fastapi import APIRouter
from ..activation import activation_manager
from ..database import get_connection
from ..models import ActivationStatus
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

@router.post("/wake/start")
def wake_start():
    activation_manager.start_wake(); update_settings({"wake_phrase_enabled": True}); log("wake", "on")
    return status_payload()

@router.post("/wake/stop")
def wake_stop():
    activation_manager.stop_wake(); update_settings({"wake_phrase_enabled": False}); log("wake", "off")
    return status_payload()

@router.post("/wake/simulate")
def wake_simulate():
    activation_manager.wake("wake_phrase"); log("wake", "detected", "simulated Hey Lunex")
    return status_payload()

@router.post("/clap/start")
def clap_start():
    activation_manager.start_clap(); update_settings({"double_clap_enabled": True}); log("clap", "on")
    return status_payload()

@router.post("/clap/stop")
def clap_stop():
    activation_manager.stop_clap(); update_settings({"double_clap_enabled": False}); log("clap", "off")
    return status_payload()

@router.post("/clap/simulate")
def clap_simulate():
    activation_manager.wake("double_clap"); log("clap", "detected", "simulated double clap")
    return status_payload()

@router.get("/status", response_model=ActivationStatus)
def activation_status():
    return status_payload()
