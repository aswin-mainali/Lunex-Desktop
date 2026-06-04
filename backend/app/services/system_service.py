import os

class ServiceResult(dict):
    pass

class OpenAIPlaceholderMixin:
    @property
    def has_api_key(self) -> bool:
        return bool(os.getenv("OPENAI_API_KEY"))

    def mock(self, message: str) -> ServiceResult:
        return ServiceResult(mocked=True, message=message, warning="OPENAI_API_KEY is missing; returning safe mock data.")

class SystemService(OpenAIPlaceholderMixin):
    def status(self) -> ServiceResult:
        return ServiceResult(mocked=False, message="Backend online; SQLite configured; destructive actions disabled.")
