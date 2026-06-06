import os
import subprocess
from dataclasses import dataclass

@dataclass(frozen=True)
class LaunchResult:
    status: str
    message: str
    target: str | None = None

class SystemService:
    APPROVED_APPS: dict[str, tuple[str, list[str]]] = {
        "calculator": ("Calculator", ["calc.exe"]),
        "calc": ("Calculator", ["calc.exe"]),
        "notepad": ("Notepad", ["notepad.exe"]),
        "paint": ("Paint", ["mspaint.exe"]),
        "mspaint": ("Paint", ["mspaint.exe"]),
        "cmd": ("Command Prompt", ["cmd.exe"]),
        "command prompt": ("Command Prompt", ["cmd.exe"]),
        "powershell": ("PowerShell", ["powershell.exe"]),
        "file explorer": ("File Explorer", ["explorer.exe"]),
        "explorer": ("File Explorer", ["explorer.exe"]),
        "settings": ("Settings", ["cmd.exe", "/c", "start", "", "ms-settings:"]),
    }

    def open_approved_app(self, app_name: str) -> LaunchResult:
        normalized = self._normalize_app_name(app_name)
        approved = self.APPROVED_APPS.get(normalized)
        if not approved:
            return LaunchResult("blocked", "This app is not approved for safe launch yet.", normalized or app_name)
        display_name, command = approved
        if os.name != "nt":
            return LaunchResult("unsupported", f"{display_name} launch is only available on Windows in this v1 build.", display_name)
        try:
            subprocess.Popen(command, shell=False, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except OSError as exc:
            return LaunchResult("error", f"Unable to open {display_name}: {exc}", display_name)
        return LaunchResult("success", f"Opening {display_name}.", display_name)

    def status(self) -> dict[str, str | bool]:
        return {"mocked": False, "message": "Backend online; SQLite configured; destructive actions disabled."}

    def _normalize_app_name(self, app_name: str) -> str:
        text = app_name.lower().strip()
        for prefix in ("open app", "open application", "open"):
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        return " ".join(text.split())
