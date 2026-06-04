# Command schema

`POST /commands/route`

```json
{ "command": "remind me to submit my assignment tomorrow", "confirmed": false, "source": "text_command" }
```

Intents: `open_app`, `open_website`, `web_search`, `file_search`, `summarize_document`, `system_status`, `create_note`, `create_task`, `create_reminder`, `unknown`.

Task/reminder commands create local SQLite tasks only. They do not create calendar events, send notifications, edit files, or contact external services.
