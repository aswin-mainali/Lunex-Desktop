import sqlite3
from pathlib import Path
from typing import Any
from .config import get_config

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "database" / "schema.sql"

def get_db_path() -> Path:
    config = get_config()
    path = config.resolved_database_path
    path.parent.mkdir(parents=True, exist_ok=True)
    return path

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        seed_defaults(conn)

def seed_defaults(conn: sqlite3.Connection) -> None:
    defaults: dict[str, Any] = {
        "privacy_mode": False,
        "wake_phrase_enabled": False,
        "double_clap_enabled": False,
        "push_to_talk_enabled": True,
        "microphone_device": "Default microphone",
        "openai_api_key_placeholder": "Set OPENAI_API_KEY in backend/.env",
        "folders": "Documents, Desktop, Downloads",
        "appearance_theme": "Lunex Dark",
        "local_memory_enabled": True,
    }
    for key, value in defaults.items():
        conn.execute("INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)", (key, str(value).lower() if isinstance(value, bool) else str(value)))
