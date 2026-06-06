from .database import get_connection

def list_memory() -> list[dict]:
    with get_connection() as conn:
        return [dict(row) for row in conn.execute("SELECT * FROM memory_items ORDER BY created_at DESC LIMIT 100")]

def add_memory(title: str, content: str, tags: str = "") -> dict:
    with get_connection() as conn:
        cur = conn.execute("INSERT INTO memory_items(title, content, tags) VALUES (?, ?, ?)", (title, content, tags))
        conn.commit()
        row = conn.execute("SELECT * FROM memory_items WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
