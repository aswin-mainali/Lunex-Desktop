from .safety import classify_safety
from .services.openai_service import OpenAIService
from .services.system_service import SystemService
from .services.website_service import WebsiteService

class CommandRouter:
    WEBSITE_NAMES = {"google", "youtube", "gmail", "github", "chatgpt", "openai", "backend docs", "localhost backend docs"}
    WEB_SEARCH_MARKERS = ("search the web", "web search", "latest", "today", "look up", "find latest", "current", "news", "weather")

    def __init__(self) -> None:
        self.system_service = SystemService()
        self.website_service = WebsiteService()
        self.openai_service = OpenAIService()

    def classify_intent(self, command: str) -> str:
        text = self._strip_lunex(command)
        if self._is_reminder(text):
            return "create_reminder"
        if self._is_task(text):
            return "create_task"
        if text.startswith("open ") and self._is_website_target(text.removeprefix("open ").strip()):
            return "open_website"
        if text.startswith(("open website ", "open site ")):
            return "open_website"
        if text.startswith("open "):
            return "open_app"
        if self._is_web_search(text):
            return "web_search"
        if "find" in text and ("file" in text or "folder" in text or "project" in text):
            return "file_search"
        if "summarize" in text and ("document" in text or "file" in text or "pdf" in text):
            return "summarize_document"
        if "status" in text or "system" in text:
            return "system_status"
        if "note" in text or "remember" in text:
            return "create_note"
        return "general_ai"

    def route(self, command: str, confirmed: bool = False) -> dict[str, str | bool]:
        intent = self.classify_intent(command)
        safety = classify_safety(command, intent)
        if safety == "critical":
            return self._response(command, intent, safety, "blocked", "Blocked for safety. Lunex v1 does not perform critical or destructive actions.", False, "safety", True)
        if safety in {"medium", "high"} and intent not in {"create_task", "create_reminder"} and not confirmed:
            return self._response(command, intent, safety, "confirmation_required", f"This {safety}-risk command requires confirmation before Lunex can prepare a safe action.", True, "safety", True)
        if intent == "open_app":
            return self._route_app(command)
        if intent == "open_website":
            return self._route_website(command)
        if intent == "general_ai":
            return self._route_general_ai(command)
        if intent == "web_search":
            return self._response(command, intent, "low", "not_configured", "Web search is not configured yet. OpenAI API answering is available for general knowledge, but live web search needs the web search service.", False, "fallback", True)
        return self._response(command, intent, safety, "success", self._safe_action(intent, command), False, "local", intent in {"file_search", "summarize_document", "create_note"})

    def _route_app(self, command: str) -> dict[str, str | bool]:
        result = self.system_service.open_approved_app(self._strip_lunex(command))
        safety = "low" if result.status == "success" else "critical" if result.status == "blocked" else "low"
        return self._response(command, "open_app", safety, result.status, result.message, False, "local", False)

    def _route_website(self, command: str) -> dict[str, str | bool]:
        result = self.website_service.open_approved_website(self._strip_lunex(command))
        safety = "low" if result.status == "success" else "critical" if result.status == "blocked" else "low"
        return self._response(command, "open_website", safety, result.status, result.message, False, "local", False)

    def _route_general_ai(self, command: str) -> dict[str, str | bool]:
        result = self.openai_service.answer(command)
        return self._response(command, "general_ai", "low", "success" if not result.get("mocked") else "not_configured", str(result["message"]), False, str(result.get("source", "openai")), bool(result.get("mocked", False)))

    def _strip_lunex(self, command: str) -> str:
        text = command.lower().strip()
        return text.removeprefix("lunex,").removeprefix("lunex").strip()

    def _is_task(self, text: str) -> bool:
        return text.startswith(("add task", "add a task", "create task", "create a task"))

    def _is_reminder(self, text: str) -> bool:
        return text.startswith(("remind me", "create reminder", "create a reminder", "add reminder", "add a reminder", "lunex remind me"))

    def _is_website_target(self, target: str) -> bool:
        return target in self.WEBSITE_NAMES or any(token in target for token in (".com", ".org", ".net", "http://", "https://", "www."))

    def _is_web_search(self, text: str) -> bool:
        return text.startswith("search ") or any(marker in text for marker in self.WEB_SEARCH_MARKERS)

    def _safe_action(self, intent: str, command: str) -> str:
        responses = {
            "file_search": "Mock file search result: local indexing is planned; no files were opened or changed.",
            "summarize_document": "Mock summary: document parsing service is scaffolded and awaits file ingestion.",
            "system_status": "System status: backend online, local database reachable, safety router active.",
            "create_note": "Mock note creation confirmed. No document was edited by the command router.",
            "create_task": "Task command recognized. Lunex will store a local task only.",
            "create_reminder": "Reminder command recognized. Lunex will store a local reminder only.",
        }
        return responses.get(intent, f"Lunex received: {command}")

    def _response(self, command: str, intent: str, safety: str, status: str, response: str, requires_confirmation: bool, source: str, mocked: bool) -> dict[str, str | bool]:
        state = "blocked" if status == "blocked" else "confirmation_required" if requires_confirmation else "complete"
        return {"command": command, "intent": intent, "safety_level": safety, "status": status, "response": response, "requires_confirmation": requires_confirmation, "activation_state": state, "source": source, "mocked": mocked}
