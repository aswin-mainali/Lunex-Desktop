from .activation import activation_manager

class AudioService:
    def transcribe_bytes(self, data: bytes | None, filename: str | None = None) -> dict[str, str | bool]:
        activation_manager.begin_transcribing()
        # Real audio transcription is delegated to TranscriptionService; this layer stays safe if audio packages are absent.
        transcript = "Mock transcription: remind me to check my bills tonight"
        activation_manager.detect_wake_phrase(transcript)
        return {
            "transcript": transcript,
            "mocked": True,
            "mock": True,
            "activation_state": activation_manager.state,
            "message": "Mock transcription used because no API key is configured.",
        }

    def analyze_clap_peaks(self, peaks: list[float]) -> bool:
        return activation_manager.detect_double_clap(peaks)
