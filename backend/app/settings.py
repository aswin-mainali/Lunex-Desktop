from .database import get_connection

def get_settings() -> dict[str, str]:
    with get_connection() as conn:
        return {row["key"]: row["value"] for row in conn.execute("SELECT key, value FROM settings ORDER BY key")}

def update_settings(values: dict) -> dict[str, str]:
    with get_connection() as conn:
        for key, value in values.items():
            conn.execute("INSERT INTO settings(key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP", (key, str(value).lower() if isinstance(value, bool) else str(value)))
        conn.commit()
    return get_settings()
