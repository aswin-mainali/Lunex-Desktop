import os

class ServiceResult(dict):
    pass

class OpenAIPlaceholderMixin:
    @property
    def has_api_key(self) -> bool:
        return bool(os.getenv("OPENAI_API_KEY"))

    def mock(self, message: str) -> ServiceResult:
        return ServiceResult(mocked=True, message=message, warning="OPENAI_API_KEY is missing; returning safe mock data.")

class FileService(OpenAIPlaceholderMixin):
    def search_files(self, query: str) -> ServiceResult:
        return self.mock(f"Mock file search for: {query}")
