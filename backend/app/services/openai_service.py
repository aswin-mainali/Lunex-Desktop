import os
from pathlib import Path

class ServiceResult(dict):
    pass

class OpenAIService:
    def __init__(self) -> None:
        self.api_key = self._load_api_key()
        self.model = os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini")

    @property
    def has_api_key(self) -> bool:
        return bool(self.api_key)

    def answer(self, prompt: str) -> ServiceResult:
        if not self.has_api_key:
            return ServiceResult(
                mocked=True,
                source="fallback",
                message="OpenAI API key is not configured. Add OPENAI_API_KEY in backend/.env to enable AI answers.",
            )
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        response = client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": "You are Lunex, a concise local Windows desktop assistant. Be helpful, safe, and clear."},
                {"role": "user", "content": prompt},
            ],
        )
        return ServiceResult(mocked=False, source="openai", message=response.output_text)

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
