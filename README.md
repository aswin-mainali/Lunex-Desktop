# Lunex Desktop

Lunex is a Windows-first local AI command system foundation built with Tauri v2, React, TypeScript, Python FastAPI, and SQLite. The dashboard keeps the dark cyan HUD style with a left navigation rail, central reactive AI core, voice-reactive waveform, bottom command bar, right-side Modules/Recent Files/Tasks panels, and a small sidebar System Status widget.

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
- Reactive AI core states for idle, wake detected, listening, transcribing, thinking, responding, double clap, confirmation required, blocked, and error.
- Voice-reactive waveform that simulates amplitude for idle/listening/transcribing/thinking/responding/clap/blocked states.
- Text command input routed to `/commands/route`.
- Command intent classification and safety levels.
- Critical commands are blocked; medium/high-risk commands still require confirmation except local task/reminder creation, which is allowed because it is non-destructive.
- Real local task/reminder CRUD through `/tasks`, the dashboard Tasks panel, and the Tasks page.
- Reminder/task text commands such as `remind me to submit my assignment tomorrow` create SQLite tasks.
- Push-to-talk records audio when browser permissions are available, calls `/audio/transcribe`, routes the transcript, and refreshes tasks immediately.
- Recent Files no longer shows fake examples. It shows an empty state until the user connects folders in Settings.
- Settings persist wake phrase, double-clap, push-to-talk, folder placeholder, local memory, and local task/reminder storage toggles.
- OpenAI service layer is optional and safe without an API key.

## Mocked or placeholder in v1
- OpenAI completion, transcription, web search, file search, document summary, and TTS return safe mock output when no API key is present.
- Wake phrase detection checks transcribed text for `Hey Lunex`, and simulate endpoints are available for development.
- Double clap is backend amplitude-peak logic with cooldown plus a simulate endpoint; frontend animation shows two shockwaves and sharp waveform peaks.
- Folder connection is a Settings placeholder. Lunex does not scan user files automatically.
- TTS is a text-only placeholder.

## Voice task creation flow
1. Click the microphone button.
2. Lunex enters `listening`, then `transcribing`.
3. Backend returns a real transcript when available or a clear mock transcript when no API key is configured.
4. The transcript is routed to `/commands/route` with source `voice_command`.
5. Task/reminder commands create a local SQLite task and refresh the dashboard Tasks panel.

## Activation flow
`idle -> wake_detected -> listening -> transcribing -> thinking -> confirmation_required OR responding -> complete -> idle`

Wake phrase and double clap only enter listening mode. They never execute commands directly.

## Troubleshooting
See `docs/setup.md` for exact setup steps and troubleshooting. Use npm scripts for Tauri; do not depend on `cargo tauri dev`.
