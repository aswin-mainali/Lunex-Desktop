from fastapi import APIRouter, File, UploadFile
from ..audio import AudioService
from ..models import TranscriptionResponse

router = APIRouter(prefix="/audio", tags=["audio"])
audio_service = AudioService()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile | None = File(default=None)):
    data = await file.read() if file else None
    result = audio_service.transcribe_bytes(data, file.filename if file else None)
    return result
