from functools import lru_cache
from pathlib import Path
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppConfig(BaseSettings):
    app_name: str = "Lunex"
    database_path: str = "backend/database/lunex.sqlite3"
    openai_api_key: str | None = None
    wake_phrase: str = "hey lunex"
    model_config = SettingsConfigDict(env_file=".env", env_prefix="LUNEX_", extra="ignore")

    @property
    def resolved_database_path(self) -> Path:
        path = Path(self.database_path)
        return path if path.is_absolute() else Path.cwd().parent / path if Path.cwd().name == "backend" else Path.cwd() / path

@lru_cache
def get_config() -> AppConfig:
    return AppConfig(openai_api_key=os.getenv("OPENAI_API_KEY"))
