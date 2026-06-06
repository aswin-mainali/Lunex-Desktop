from .activation import activation_manager
from .services.transcription_service import TranscriptionService

class AudioService:
    def transcribe_bytes(self, data: bytes | None, filename: str | None = None) -> dict[str, str | bool | None]:
        activation_manager.begin_transcribing()
        result = TranscriptionService().transcribe(data, filename)
        transcript = str(result.get("transcript", ""))
        if transcript:
            activation_manager.detect_wake_phrase(transcript)
        return {
            "transcript": transcript,
            "mocked": bool(result.get("mocked", False)),
            "mock": bool(result.get("mock", result.get("mocked", False))),
            "activation_state": activation_manager.state,
            "message": result.get("message"),
        }

    def analyze_clap_peaks(self, peaks: list[float]) -> bool:
        return activation_manager.detect_double_clap(peaks)
