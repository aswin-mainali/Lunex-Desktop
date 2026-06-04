import threading, time
from dataclasses import dataclass
from .config import get_config

WAKE_PHRASES = ("hey lunex", "hello lunex", "lunex")

def detect_wake_phrase_text(transcript: str) -> tuple[bool, str | None]:
    text = transcript.lower()
    for phrase in WAKE_PHRASES:
        if phrase in text:
            return True, phrase
    return False, None

@dataclass
class ActivationManager:
    state: str = "idle"
    wake_listening: bool = False
    clap_listening: bool = False
    last_event: str | None = None
    warning: str | None = None
    _cooldown_until: float = 0.0

    def start_wake(self) -> None:
        self.wake_listening = True
        self.last_event = "wake_listening_on"
        self.state = "idle"
        self.warning = "Wake detection uses placeholder chunk transcription in v1. Wake phrase only enters listening mode."

    def stop_wake(self) -> None:
        self.wake_listening = False
        self.last_event = "wake_listening_off"
        self.state = "idle"

    def start_clap(self) -> None:
        self.clap_listening = True
        self.last_event = "clap_listening_on"
        self.state = "idle"
        self.warning = "Double-clap detection uses amplitude peaks when optional microphone packages are available."

    def stop_clap(self) -> None:
        self.clap_listening = False
        self.last_event = "clap_listening_off"
        self.state = "idle"

    def detect_wake_phrase(self, transcript: str) -> bool:
        if self.wake_listening and get_config().wake_phrase in transcript.lower():
            self.wake("wake_phrase")
            return True
        return False

    def detect_double_clap(self, peaks: list[float], threshold: float = 0.72) -> bool:
        now = time.time()
        if not self.clap_listening or now < self._cooldown_until:
            return False
        strong = [p for p in peaks if p >= threshold]
        if len(strong) >= 2:
            self.wake("double_clap")
            self._cooldown_until = now + 2.0
            return True
        return False

    def wake(self, source: str) -> None:
        # Critical rule: wake sources only enter listening mode. They never route commands.
        self.state = "listening"
        self.last_event = f"wake_detected:{source}"

    def begin_transcribing(self) -> None:
        self.state = "transcribing"

    def begin_thinking(self) -> None:
        self.state = "thinking"

    def complete(self) -> None:
        self.state = "idle"
        self.last_event = "complete"

activation_manager = ActivationManager()
