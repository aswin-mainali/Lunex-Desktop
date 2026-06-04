from __future__ import annotations

import re
import webbrowser
from dataclasses import dataclass
from urllib.parse import urlparse

@dataclass(frozen=True)
class WebsiteResult:
    status: str
    message: str
    url: str | None = None

class WebsiteService:
    APPROVED_SITES: dict[str, str] = {
        "google": "https://www.google.com",
        "youtube": "https://www.youtube.com",
        "gmail": "https://mail.google.com",
        "github": "https://github.com",
        "chatgpt": "https://chatgpt.com",
        "openai": "https://openai.com",
        "localhost backend docs": "http://127.0.0.1:8787/docs",
        "backend docs": "http://127.0.0.1:8787/docs",
    }

    def open_approved_website(self, target: str) -> WebsiteResult:
        normalized = self._normalize_target(target)
        url = self.APPROVED_SITES.get(normalized)
        if not url and self._looks_like_url(normalized):
            url = normalized if "://" in normalized else f"https://{normalized}"
        if not url or not self._is_safe_url(url):
            return WebsiteResult("blocked", "This website is not approved for safe opening yet.", normalized)
        try:
            webbrowser.open(url, new=2)
        except webbrowser.Error as exc:
            return WebsiteResult("error", f"Unable to open website: {exc}", url)
        label = self._display_label(normalized, url)
        return WebsiteResult("success", f"Opening {label}.", url)

    def _normalize_target(self, target: str) -> str:
        text = target.lower().strip()
        for prefix in ("open website", "open site", "open"):
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        return " ".join(text.split())

    def _looks_like_url(self, target: str) -> bool:
        return target.startswith(("http://", "https://")) or bool(re.fullmatch(r"[a-z0-9.-]+\.[a-z]{2,}(/.*)?", target))

    def _is_safe_url(self, url: str) -> bool:
        parsed = urlparse(url)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)

    def _display_label(self, normalized: str, url: str) -> str:
        for name, approved_url in self.APPROVED_SITES.items():
            if approved_url == url:
                return name.title()
        return url
