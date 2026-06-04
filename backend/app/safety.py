LOW_RISK = {"open_app", "open_website", "web_search", "file_search", "summarize_document", "system_status", "unknown"}
MEDIUM_KEYWORDS = ("create folder", "create note", "rename")
HIGH_KEYWORDS = ("move file", "move files", "edit document", "run script")
CRITICAL_KEYWORDS = ("delete", "send email", "payment", "pay ", "install", "security settings", "disable firewall")

def classify_safety(command: str, intent: str) -> str:
    text = command.lower()
    if any(word in text for word in CRITICAL_KEYWORDS):
        return "critical"
    if any(word in text for word in HIGH_KEYWORDS):
        return "high"
    if intent == "create_note" or any(word in text for word in MEDIUM_KEYWORDS):
        return "medium"
    return "low"
