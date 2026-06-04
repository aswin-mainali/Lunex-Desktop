# Command schema

`POST /commands/route`

```json
{ "command": "open calculator", "confirmed": false, "source": "text_command" }
```

Intents: `open_app`, `open_website`, `web_search`, `file_search`, `summarize_document`, `system_status`, `create_note`, `create_task`, `create_reminder`, `unknown`.

## Safe local actions

Approved app examples:
- `open calculator`
- `open notepad`
- `open paint`
- `open command prompt`
- `open powershell`
- `open file explorer`
- `open settings`

Approved website examples:
- `open google`
- `open youtube`
- `open github`
- `open chatgpt`
- `open openai`
- `open backend docs`

Unapproved apps are blocked. Only `http` and `https` URLs are eligible for website opening.

Task/reminder commands create local SQLite tasks only. They do not create calendar events, send notifications, edit files, or contact external services.

`POST /activation/check-wake`

```json
{ "transcript": "Hey Lunex" }
```

Returns whether a wake phrase was detected. Wake detection only activates listening mode when wake listening is enabled; it never routes or executes a command.
