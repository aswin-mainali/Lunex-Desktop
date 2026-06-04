import os

class ServiceResult(dict):
    pass

class OpenAIPlaceholderMixin:
    @property
    def has_api_key(self) -> bool:
        return bool(os.getenv("OPENAI_API_KEY"))

    def mock(self, message: str) -> ServiceResult:
        return ServiceResult(mocked=True, message=message, warning="OPENAI_API_KEY is missing; returning safe mock data.")

class TranscriptionService(OpenAIPlaceholderMixin):
    def transcribe(self, audio_bytes: bytes | None) -> ServiceResult:
        if not self.has_api_key:
            return self.mock("Mock transcription: summarize my day")
        return ServiceResult(mocked=False, message="Transcription integration point ready.")
