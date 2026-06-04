from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import health, commands, activation, audio, memory, settings

app = FastAPI(title="Lunex Local AI Command System", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:1420", "http://127.0.0.1:1420", "tauri://localhost"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    init_db()
    print("Lunex backend online. OPENAI_API_KEY is optional; missing keys return safe mock responses.")

app.include_router(health.router)
app.include_router(commands.router)
app.include_router(activation.router)
app.include_router(audio.router)
app.include_router(memory.router)
app.include_router(settings.router)
