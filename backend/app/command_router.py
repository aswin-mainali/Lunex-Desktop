from .safety import classify_safety

class CommandRouter:
    def classify_intent(self, command: str) -> str:
        text = command.lower().strip()
        text = text.removeprefix("lunex,").removeprefix("lunex").strip()
        if self._is_reminder(text):
            return "create_reminder"
        if self._is_task(text):
            return "create_task"
        if text.startswith("open ") and any(tld in text for tld in (".com", ".org", ".net", "http", "www.")):
            return "open_website"
        if text.startswith("open "):
            return "open_app"
        if text.startswith("search ") or "web search" in text or "google" in text:
            return "web_search"
        if "find" in text and ("file" in text or "folder" in text or "project" in text):
            return "file_search"
        if "summarize" in text and ("document" in text or "file" in text or "pdf" in text):
            return "summarize_document"
        if "status" in text or "system" in text:
            return "system_status"
        if "note" in text or "remember" in text:
            return "create_note"
        return "unknown"

    def route(self, command: str, confirmed: bool = False) -> dict[str, str | bool]:
        intent = self.classify_intent(command)
        safety = classify_safety(command, intent)
        if safety == "critical":
            return self._response(command, intent, safety, "blocked", "Blocked for safety. Lunex v1 does not perform critical or destructive actions.", False)
        if safety in {"medium", "high"} and intent not in {"create_task", "create_reminder"} and not confirmed:
            return self._response(command, intent, safety, "confirmation_required", f"This {safety}-risk command requires confirmation before Lunex can prepare a safe mock action.", True)
        return self._response(command, intent, safety, "success", self._mock_action(intent, command), False)

    def _is_task(self, text: str) -> bool:
        return text.startswith(("add task", "add a task", "create task", "create a task"))

    def _is_reminder(self, text: str) -> bool:
        return text.startswith(("remind me", "create reminder", "create a reminder", "lunex remind me"))

    def _mock_action(self, intent: str, command: str) -> str:
        responses = {
            "open_app": "Prepared a safe app-open request. Real process launching is intentionally not enabled in v1.",
            "open_website": "Prepared a safe website-open request. Browser automation is mocked in v1.",
            "web_search": "Mock web search result: Lunex can route this query once a web provider is configured.",
            "file_search": "Mock file search result: local indexing is planned; no files were opened or changed.",
            "summarize_document": "Mock summary: document parsing service is scaffolded and awaits file ingestion.",
            "system_status": "System status: backend online, local database reachable, safety router active.",
            "create_note": "Mock note creation confirmed. No document was edited by the command router.",
            "create_task": "Task command recognized. Lunex will store a local task only.",
            "create_reminder": "Reminder command recognized. Lunex will store a local reminder only.",
            "unknown": "I can route Windows commands, searches, notes, summaries, tasks, reminders, and safe system checks. Try a more specific request.",
        }
        return responses.get(intent, f"Lunex received: {command}")

    def _response(self, command: str, intent: str, safety: str, status: str, response: str, requires_confirmation: bool) -> dict[str, str | bool]:
        state = "blocked" if status == "blocked" else "confirmation_required" if requires_confirmation else "complete"
        return {"command": command, "intent": intent, "safety_level": safety, "status": status, "response": response, "requires_confirmation": requires_confirmation, "activation_state": state}
