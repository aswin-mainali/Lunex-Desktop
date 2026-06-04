# Lunex setup

## Requirements
- Windows 10/11 recommended.
- Python 3.11+.
- Node.js 20+ and npm.
- Rust toolchain and WebView2 for Tauri v2.

## Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787
```

## Desktop
```powershell
cd apps\desktop
npm install
npm run tauri
```
Use the npm Tauri CLI only; do not start this app with `cargo tauri dev`.

## What is real in v1
- FastAPI service on port 8787.
- SQLite schema and persistence for settings, memory, command history, tasks, and activation events.
- Command router with intent, safety classification, approved Windows app launching, and approved website opening.
- React dashboard, settings, command history, and tasks pages.
- Push-to-talk UI that records browser audio when available and posts to `/audio/transcribe`.
- Wake and clap toggles that request microphone permission, update backend activation state, and drive reactive orb/waveform animation.
- Local task/reminder CRUD with SQLite persistence and command-router creation from text or voice transcripts.
- Empty Recent Files state until folders are explicitly connected in Settings.


## Safe local actions
- Approved apps are launched through a strict backend allowlist and `subprocess.Popen(..., shell=False)` on Windows.
- Approved websites and safe `http`/`https` URLs are opened with Python `webbrowser.open`.
- Unapproved apps and unsafe URL schemes are blocked.

## What is mocked or placeholder
- OpenAI responses, transcription, web search, file search, document summaries, and TTS all return safe mock responses when `OPENAI_API_KEY` is missing.
- Wake phrase detection uses browser speech recognition when available and checks transcripts through `/activation/check-wake`; `/activation/wake/simulate` can trigger the visual flow in development.
- Double-clap detection is implemented in the frontend with the Web Audio API: two peaks within 250-900 ms trigger listening mode; `/activation/clap/simulate` can trigger the visual flow in development.
- Voice responses use browser SpeechSynthesis when `tts_enabled` is ON; the backend TTS service remains a non-blocking placeholder.
- File indexing is not implemented and Lunex does not scan folders automatically.

## Wake phrase and double clap safety
Wake phrase and double clap only move Lunex into `listening` mode. They never call `/commands/route` and never execute a command directly.

## Troubleshooting
- Backend offline: confirm `uvicorn app.main:app --reload --port 8787` is running.
- Missing API key: expected; Lunex returns mock data and does not crash.
- Vite watch issues: `vite.config.ts` ignores `src-tauri/target`, `node_modules`, and `.git`.
- Icons: bundling is disabled in v1 so dev mode avoids missing icon errors.
