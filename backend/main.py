from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pathlib import Path
import neuralspace as ns
from tempfile import NamedTemporaryFile
import asyncio
import json

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Neural Space API key
NEURALSPACE_API_KEY = os.getenv('NEURALSPACE_API_KEY')
if not NEURALSPACE_API_KEY:
    raise ValueError("NEURALSPACE_API_KEY environment variable is not set")

vai = ns.VoiceAI(api_key=NEURALSPACE_API_KEY)

@app.post("/api/transcribe-dummy")
async def transcribe_audio_dummy(file: UploadFile):
    """
    Dummy endpoint that returns mock transcription data from dummy.json for testing
    """
    # Get the directory containing the current script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dummy_file_path = os.path.join(current_dir, "dummy.json")

    with open(dummy_file_path, 'r') as f:
        dummy_response = json.load(f)

    return dummy_response

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile):
    """
    Endpoint to transcribe audio files and return both full transcription and word timestamps
    """
    allowed_extensions = {'.mp3', '.wav', '.m4a', '.flac', '.ogg'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Supported formats: {', '.join(allowed_extensions)}"
        )

    try:
        with NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        config = {
            'file_transcription': {
                'language_id': 'en',
                'mode': 'advanced',
            },
            "speaker_diarization": {
                "mode": "speakers",
                "num_speakers" : 2,
            }
        }
        job_id = vai.transcribe(file=temp_file_path, config=config)
        result = vai.poll_until_complete(job_id)

        os.unlink(temp_file_path)

        if result.get('success'):
            return result['data']['result']['transcription']['segments']
        else:
            raise HTTPException(
                status_code=500,
                detail="Transcription failed"
            )

    except Exception as e:
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio file: {str(e)}"
        )

@app.get("/api/transcription/{job_id}")
async def get_transcription_status(job_id: str):
    """
    Endpoint to check the status of a transcription job
    """
    try:
        result = vai.get_job_status(job_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching job status: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
