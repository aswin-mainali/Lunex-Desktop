# Lunex Desktop

Lunex is a Windows-first local AI command system foundation built with Tauri v2, React, TypeScript, Python FastAPI, and SQLite. The first dashboard uses a clean dark cyan HUD aesthetic with a left navigation rail, central AI core, waveform, bottom command bar, right-side Modules/Recent Files/Tasks panels, and a small sidebar System Status widget.

## Run backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787
```

## Run desktop
```powershell
cd apps\desktop
npm install
npm run tauri
```

## Features working in v1
- FastAPI backend on port 8787.
- SQLite tables for command history, memory items, settings, tasks, and activation events.
- Text command input routed to `/commands/route`.
- Command intent classification and safety levels.
- Critical commands are blocked; medium/high-risk commands require confirmation.
- Settings persist in SQLite.
- Command history appears in Command Center, not on the dashboard.
- Push-to-talk button records audio when browser permissions are available and calls `/audio/transcribe`.
- Wake phrase and double-clap toggles call activation endpoints and clearly show ON/OFF state.
- OpenAI service layer is optional and safe without an API key.

## Mocked or placeholder in v1
- OpenAI completion, transcription, web search, file search, document summary, and TTS return safe mock output when no API key is present.
- Wake phrase detection checks transcribed text for `Hey Lunex`.
- Double clap is backend amplitude-peak logic with cooldown and is isolated so microphone package failures cannot crash the app.
- TTS is a text-only placeholder.

## Activation flow
`idle -> wake_detected -> listening -> transcribing -> thinking -> confirmation_required OR responding -> complete -> idle`

Wake phrase and double clap only enter listening mode. They never execute commands directly.

## Troubleshooting
See `docs/setup.md` for exact setup steps and troubleshooting. Use npm scripts for Tauri; do not depend on `cargo tauri dev`.
