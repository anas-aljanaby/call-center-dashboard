from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pathlib import Path
import neuralspace as ns
from tempfile import NamedTemporaryFile
import asyncio
import json
import librosa
import soundfile as sf
import noisereduce as nr
import numpy as np
from pydantic import BaseModel
from typing import List, Dict, Optional
import openai

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

async def enhance_audio_file(input_path, output_path):
    """
    Enhance the audio quality of the input file
    """
    # Load the audio file
    audio, sr = librosa.load(input_path, sr=None)
    
    # Apply noise reduction
    noise_sample = audio[0:int(sr)]
    reduced_noise = nr.reduce_noise(
        y=audio,
        sr=sr,
        prop_decrease=0.75,
        n_std_thresh_stationary=1.5
    )
    
    # Enhance speech frequencies
    speech_enhanced = librosa.effects.preemphasis(reduced_noise, coef=0.97)
    
    # Normalize audio
    speech_enhanced = librosa.util.normalize(speech_enhanced)
    
    # Save the enhanced audio
    sf.write(output_path, speech_enhanced, sr)

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
        # Create temporary files for original and enhanced audio
        with NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file, \
             NamedTemporaryFile(delete=False, suffix='.wav') as enhanced_file:
            
            # Save original upload to temp file
            content = await file.read()
            temp_file.write(content)
            
            # Enhance the audio
            await enhance_audio_file(temp_file.name, enhanced_file.name)

            # Use the enhanced audio file for transcription
            config = {
                'file_transcription': {
                    'language_id': 'ar-sa',
                    'mode': 'advanced',
                },
                "speaker_diarization": {
                    "mode": "speakers",
                    "num_speakers" : 2,
                }
            }
            job_id = vai.transcribe(file=enhanced_file.name, config=config)
            result = vai.poll_until_complete(job_id)

            # Clean up temporary files
            os.unlink(temp_file.name)
            os.unlink(enhanced_file.name)

            if result.get('success'):
                return result['data']['result']['transcription']['segments']
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Transcription failed"
                )

    except Exception as e:
        # Clean up temporary files in case of error
        for path in [temp_file.name, enhanced_file.name]:
            if 'temp_file' in locals():
                try:
                    os.unlink(path)
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

# Add these new models at the top of the file
class LabelDefinition(BaseModel):
    name: str
    description: str

class Segment(BaseModel):
    startTime: float
    endTime: float
    text: str
    speaker: str
    channel: int
    label: Optional[str] = None

class LabelingRequest(BaseModel):
    segments: List[Segment]
    possible_labels: List[LabelDefinition]

@app.post("/api/label-segments")
async def label_segments(request: LabelingRequest):
    # Initialize OpenAI
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Prepare the conversation context for the LLM
    label_descriptions = "\n".join([
        f"- {label.name}: {label.description}"
        for label in request.possible_labels
    ])

    # Prepare the conversation text
    conversation = "\n".join([
        f"[{segment.speaker}]: {segment.text}"
        for segment in request.segments
    ])

    # Create the prompt for the LLM
    prompt = f"""
You are an AI assistant tasked with labeling segments of a customer service conversation.
The possible labels and their descriptions are:

{label_descriptions}

Here's the conversation:

{conversation}

For each segment, determine if it should have any of the defined labels. If a segment doesn't match any label criteria, leave it unlabeled.
Provide the response as a JSON array where each element contains the segment index and the assigned label (or null if no label applies).
Only respond with the JSON array, no additional text.
"""
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a conversation analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )

        # Clean up the response
        labels = response.choices[0].message.content
        labels = labels.strip('`').replace('```json\n', '').replace('\n```', '').replace("json", "")
        print(labels)
        label_data = json.loads(labels)

        # Update the segments with their labels
        for label_item in label_data:
            segment_index = label_item["segment_index"]
            if segment_index < len(request.segments):
                request.segments[segment_index].label = label_item["label"]

        return {
            "segments": [segment.dict() for segment in request.segments]
        }

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing OpenAI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error labeling segments: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
