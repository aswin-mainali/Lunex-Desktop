from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any


TASK_PREFIXES = (
    "lunex",
    "remind me to",
    "remind me",
    "create a reminder to",
    "create reminder to",
    "create a reminder",
    "create reminder",
    "create task to",
    "create task",
    "add a task to",
    "add task to",
    "add a task",
    "add task",
)
TIME_PATTERN = re.compile(r"\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", re.IGNORECASE)
DATE_WORDS = {
    "today": 0,
    "tonight": 0,
    "tomorrow": 1,
}


def list_tasks(status: str | None = None) -> list[dict[str, Any]]:
    from .database import get_connection

    query = "SELECT * FROM tasks"
    params: tuple[Any, ...] = ()
    if status:
        query += " WHERE status = ?"
        params = (status,)
    query += " ORDER BY COALESCE(due_date, '9999-12-31'), COALESCE(due_time, '23:59'), created_at DESC"
    with get_connection() as conn:
        return [dict(row) for row in conn.execute(query, params)]


def create_task(title: str, notes: str = "", due_date: str | None = None, due_time: str | None = None, source: str = "manual") -> dict[str, Any]:
    from .database import get_connection

    cleaned_title = title.strip()
    if not cleaned_title:
        raise ValueError("Task title is required")
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO tasks(title, notes, due_date, due_time, status, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (cleaned_title, notes.strip(), due_date, due_time, source),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


def update_task(task_id: int, values: dict[str, Any]) -> dict[str, Any] | None:
    from .database import get_connection

    allowed = {"title", "notes", "due_date", "due_time", "status", "source"}
    updates = {key: value for key, value in values.items() if key in allowed}
    if not updates:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return dict(row) if row else None
    assignments = ", ".join(f"{key} = ?" for key in updates)
    params = [*updates.values(), task_id]
    with get_connection() as conn:
        conn.execute(f"UPDATE tasks SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", params)
        conn.commit()
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None


def delete_task(task_id: int) -> bool:
    from .database import get_connection

    with get_connection() as conn:
        cur = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return cur.rowcount > 0


def parse_task_command(command: str) -> dict[str, str | None]:
    text = command.strip().rstrip(".")
    lowered = text.lower().strip()
    changed = True
    while changed:
        changed = False
        for prefix in TASK_PREFIXES:
            if lowered.startswith(prefix):
                text = text[len(prefix):].strip(" ,:.-")
                lowered = text.lower()
                changed = True
                break
    due_date = _extract_due_date(lowered)
    due_time = _extract_due_time(lowered)
    title = _remove_due_phrases(text)
    title = re.sub(r"\s+", " ", title).strip(" ,:.-")
    return {"title": title, "due_date": due_date, "due_time": due_time}


def _extract_due_date(lowered: str) -> str | None:
    today = datetime.now().date()
    for word, offset in DATE_WORDS.items():
        if re.search(rf"\b{word}\b", lowered):
            return (today + timedelta(days=offset)).isoformat()
    if "on friday" in lowered:
        days_ahead = (4 - today.weekday()) % 7 or 7
        return (today + timedelta(days=days_ahead)).isoformat()
    if "on the first" in lowered:
        first = today.replace(day=1)
        if today.day >= 1:
            month = today.month + 1
            year = today.year + (month > 12)
            month = 1 if month > 12 else month
            first = first.replace(year=year, month=month)
        return first.isoformat()
    return None


def _extract_due_time(lowered: str) -> str | None:
    match = TIME_PATTERN.search(lowered)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2) or "0")
        suffix = match.group(3).lower()
        if suffix == "pm" and hour != 12:
            hour += 12
        if suffix == "am" and hour == 12:
            hour = 0
        return f"{hour:02d}:{minute:02d}"
    if "tonight" in lowered:
        return "20:00"
    return None


def _remove_due_phrases(text: str) -> str:
    cleaned = TIME_PATTERN.sub("", text)
    cleaned = re.sub(r"\b(today|tonight|tomorrow)\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bon friday\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bon the first\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(at|on)\s*$", "", cleaned, flags=re.IGNORECASE)
    return cleaned
