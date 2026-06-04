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
- Real safe Windows app launching for an allowlist: Calculator, Notepad, Paint, Command Prompt, PowerShell, File Explorer, and Settings.
- Real safe website opening for approved names such as Google, YouTube, Gmail, GitHub, ChatGPT, OpenAI, and backend docs, plus safe http/https URLs.
- Frontend microphone service for permission requests, push-to-talk recording, amplitude metering, wake listening, and double-clap detection.
- Wake phrase detection with browser speech recognition when available, plus a backend `/activation/check-wake` endpoint that checks transcripts for `hey lunex`, `hello lunex`, or `lunex`.
- Double clap detection with the Web Audio API: two amplitude peaks within 250-900 ms activate listening mode, with a cooldown to ignore repeated triggers.
- Browser SpeechSynthesis voice responses when `tts_enabled` is ON.
- Text command input routed to `/commands/route`.
- Critical commands are blocked; medium/high-risk commands still require confirmation except local task/reminder creation, which is allowed because it is non-destructive.
- Real local task/reminder CRUD through `/tasks`, the dashboard Tasks panel, and the Tasks page.
- Push-to-talk records audio when browser permissions are available, calls `/audio/transcribe`, routes the transcript, speaks the response when TTS is enabled, and refreshes tasks immediately.
- Recent Files shows an empty state until the user connects folders in Settings.
- Settings persist wake phrase, double-clap, push-to-talk, TTS, folder placeholder, local memory, and local task/reminder storage toggles.
- OpenAI service layer is optional and safe without an API key.

## Mocked or placeholder in v1
- OpenAI completion, transcription, web search, file search, document summary, and backend TTS return safe mock output when no API key is present.
- `/audio/transcribe` returns a development mock transcript with `mock: true` / `mocked: true` and a clear message when no transcription provider is configured.
- Wake phrase detection is real only when the Tauri WebView exposes Web Speech API. If unsupported, Lunex shows an honest unsupported message and recommends push-to-talk or clap activation.
- Folder connection is a Settings placeholder. Lunex does not scan user files automatically.

## Safe local actions
- `open calculator`, `open notepad`, `open paint`, `open command prompt`, `open powershell`, `open file explorer`, and `open settings` launch only strict allowlisted Windows commands with `subprocess.Popen(..., shell=False)`.
- Unapproved apps such as `open chrome` are blocked.
- `open youtube`, `open github`, `open chatgpt`, `open google`, and safe `http`/`https` URLs use Python `webbrowser.open`.
- Unsafe URL schemes such as `file:`, `javascript:`, `cmd:`, or PowerShell-like targets are blocked.

## Voice task creation flow
1. Click the microphone button.
2. Lunex requests microphone permission and enters `listening`.
3. Click again to stop recording; Lunex enters `transcribing`.
4. Backend returns a real transcript when available or a clear mock transcript when no API key is configured.
5. The transcript is routed to `/commands/route` with source `voice_command`.
6. Task/reminder commands create a local SQLite task and refresh the dashboard Tasks panel.
7. If TTS is enabled, Lunex speaks the command response with browser speech synthesis.

## Activation flow
`idle -> wake_detected OR clap_detected -> listening -> transcribing -> thinking -> responding -> complete -> idle`

Wake phrase and double clap only enter listening mode. They never execute commands directly.

## Troubleshooting
See `docs/setup.md` for exact setup steps and troubleshooting. Use npm scripts for Tauri; do not depend on `cargo tauri dev`.
