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

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEURALSPACE_API_KEY = os.getenv('NEURALSPACE_API_KEY')
if not NEURALSPACE_API_KEY:
    raise ValueError("NEURALSPACE_API_KEY environment variable is not set")

vai = ns.VoiceAI(api_key=NEURALSPACE_API_KEY)

async def enhance_audio_file(input_path, output_path):
    """
    Enhance the audio quality of the input file
    """
    audio, sr = librosa.load(input_path, sr=None)
    
    noise_sample = audio[0:int(sr)]
    reduced_noise = nr.reduce_noise(
        y=audio,
        sr=sr,
        prop_decrease=0.75,
        n_std_thresh_stationary=1.5
    )
    
    speech_enhanced = librosa.effects.preemphasis(reduced_noise, coef=0.97)
    speech_enhanced = librosa.util.normalize(speech_enhanced)
    sf.write(output_path, speech_enhanced, sr)

@app.post("/api/transcribe-dummy")
async def transcribe_audio_dummy(file: UploadFile):
    """
    Dummy endpoint that returns mock transcription data from dummy.json for testing
    """
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
        with NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file, \
             NamedTemporaryFile(delete=False, suffix='.wav') as enhanced_file:
            
            content = await file.read()
            temp_file.write(content)
            
            await enhance_audio_file(temp_file.name, enhanced_file.name)

            config = {
                'file_transcription': {
                    'language_id': 'ar-sa',
                    'mode': 'advanced',
                },
                "speaker_diarization": {
                    "mode": "speakers",
                    "num_speakers" : 2,
                },
                "sentiment_detect": True
            }
            job_id = vai.transcribe(file=enhanced_file.name, config=config)
            result = vai.poll_until_complete(job_id)

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
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    label_descriptions = "\n".join([
        f"- {label.name}: {label.description}"
        for label in request.possible_labels
    ])

    for i, segment in enumerate(request.segments):
        prompt = f"""
You are an AI assistant tasked with labeling a segment of a customer service conversation.
The possible labels and their descriptions are:

{label_descriptions}

Here's the segment:
[{segment.speaker}]: {segment.text}

Determine if this segment should have any of the defined labels. If the segment doesn't match any label criteria, respond with null.
Be very conservative in your labeling. Don't assign any label unless it's very clear that this segment matches the label criteria.
Provide the response as a single JSON object with format: {{"label": "label_name"}} or {{"label": null}}
Only respond with the JSON object, no additional text.
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a conversation analysis assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100
            )

            label_json = response.choices[0].message.content
            label_json = label_json.strip('`').replace('```json\n', '').replace('\n```', '').replace("json", "")
            label_data = json.loads(label_json)
            
            request.segments[i].label = label_data["label"]

        except json.JSONDecodeError as e:
            print(f"Error parsing OpenAI response for segment {i}: {str(e)}")
            request.segments[i].label = None
        except Exception as e:
            print(f"Error processing segment {i}: {str(e)}")
            request.segments[i].label = None

    return {
        "segments": [segment.dict() for segment in request.segments]
    }

class TranscriptSegment(BaseModel):
    startTime: float
    endTime: float
    text: str
    speaker: Optional[str] = None
    channel: Optional[int] = None
    checklist_item: Optional[str] = None

class ChecklistRequest(BaseModel):
    segments: List[TranscriptSegment]
    checklist: List[str]

@app.post("/api/analyze-checklist")
async def analyze_checklist(request: ChecklistRequest):
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    # Prepare the segments text with numbers
    numbered_segments = "\n".join([
        f"{i+1}. {segment.text}"
        for i, segment in enumerate(request.segments)
    ])
    
    # Prepare the checklist items
    checklist_items = "\n".join([
        f"- {item}" for item in request.checklist
    ])
    
    prompt = f"""
    Given these conversation segments:
    {numbered_segments}
    
    And this checklist:
    {checklist_items}
    
    For each segment number, determine if it fulfills any of the checklist items.
    Only match segments that clearly fulfill the checklist item.
    Respond in JSON format like this:
    {{
        "matches": [
            {{"segment": 1, "checklist_item": "Greet Customer"}},
            {{"segment": 3, "checklist_item": "Gather Relevant Information"}}
        ]
    }}
    Only include segments that match a checklist item.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a conversation analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        
        # Update the original segments with checklist items
        segment_matches = {match["segment"]: match["checklist_item"] 
                         for match in result["matches"]}
        
        for i, segment in enumerate(request.segments):
            if i + 1 in segment_matches:
                segment.checklist_item = segment_matches[i + 1]
        
        return {"segments": [segment.dict() for segment in request.segments]}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing segments: {str(e)}"
        )

class ConversationSegment(BaseModel):
    startTime: float
    endTime: float
    text: str
    speaker: str
    channel: int
    checklist_item: Optional[str] = None

class ConversationRequest(BaseModel):
    segments: List[ConversationSegment]

@app.post("/api/analyze-events")
async def analyze_events(request: ConversationRequest):
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    # Prepare the conversation flow
    conversation = "\n".join([
        f"[{segment.speaker}]: {segment.text}"
        for segment in request.segments
    ])
    
    prompt = """
    Analyze this customer service conversation and identify key events that occurred.
    Focus on important actions, requests, or decisions made during the conversation.
    
    For each event:
    1. Clearly indicate who took the action (Agent or Customer)
    2. Describe the specific event or action
    3. Include any relevant details or outcomes
    
    Format your response as a JSON array of events like this:
    {
        "events": [
            "Customer explained they were charged incorrectly and requested a refund",
            "Agent verified the transaction details in the system",
            "Agent approved a refund of 50 AED"
        ]
    }
    
    Conversation:
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a conversation analysis assistant specialized in Arabic customer service interactions."},
                {"role": "user", "content": prompt + conversation}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing conversation events: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
