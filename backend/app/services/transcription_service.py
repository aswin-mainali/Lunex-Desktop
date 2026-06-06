import io
import os
from pathlib import Path

class ServiceResult(dict):
    pass

class TranscriptionService:
    def __init__(self) -> None:
        self.api_key = self._load_api_key()
        self.model = os.getenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-4o-mini-transcribe")

    @property
    def has_api_key(self) -> bool:
        return bool(self.api_key)

    def transcribe(self, audio_bytes: bytes | None, filename: str | None = None) -> ServiceResult:
        if not self.has_api_key:
            return ServiceResult(
                mocked=True,
                mock=True,
                transcript="",
                message="Real transcription requires OPENAI_API_KEY. No transcript was generated.",
            )
        if not audio_bytes:
            return ServiceResult(mocked=False, mock=False, transcript="", message="No audio was received.")
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename or "lunex-audio.webm"
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        result = client.audio.transcriptions.create(model=self.model, file=audio_file)
        transcript = getattr(result, "text", "") or ""
        return ServiceResult(mocked=False, mock=False, transcript=transcript.strip(), message=None)

    def _load_api_key(self) -> str | None:
        if os.getenv("OPENAI_API_KEY"):
            return os.getenv("OPENAI_API_KEY")
        env_path = Path.cwd() / ".env"
        if not env_path.exists() and Path.cwd().name != "backend":
            env_path = Path.cwd() / "backend" / ".env"
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                if line.strip().startswith("OPENAI_API_KEY="):
                    value = line.split("=", 1)[1].strip().strip('"').strip("'")
                    return value or None
        return None
