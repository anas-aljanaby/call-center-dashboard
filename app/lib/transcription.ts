import { supabase } from './supabase';
import { Segment } from '../types/audio';
import { API_BASE_URL } from '../config/api';

interface TranscriptionResult {
  segments: Segment[];
  error?: string;
}

export async function transcribeAudioFile(
  file: File | Blob,
  fileId: string,
  onProgress?: (status: 'pending' | 'completed' | 'failed') => void
): Promise<TranscriptionResult> {
  try {
    onProgress?.('pending');

    // Create form data with the audio file
    const formData = new FormData();
    formData.append('file', file, 'audio.mp3');

    // Start transcription
    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.segments || result.segments.length === 0) {
      throw new Error('No transcription segments received');
    }

    // Update database with transcription
    const { error: updateError } = await supabase
      .from('audio_files')
      .update({
        transcription: result.segments,
        transcription_status: 'completed'
      })
      .eq('id', fileId);

    if (updateError) throw updateError;

    onProgress?.('completed');
    return { segments: result.segments };

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Update database with failed status
    await supabase
      .from('audio_files')
      .update({
        transcription_status: 'failed'
      })
      .eq('id', fileId);

    onProgress?.('failed');
    return {
      segments: [],
      error: error instanceof Error ? error.message : 'Transcription failed'
    };
  }
} 

export async function summarizeTranscription(
    segments: Segment[],
    fileId: string,
    onProgress?: (status: 'pending' | 'completed' | 'failed') => void
  ) {
    try {
      onProgress?.('pending');
  
      const response = await fetch('http://localhost:8000/api/summarize-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ segments }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const result = await response.json();
  
      // Update database with summary
      const { error: updateError } = await supabase
        .from('audio_files')
        .update({
          summary: result.summary,
          summarization_status: 'completed'
        })
        .eq('id', fileId);
  
      if (updateError) throw updateError;
  
      onProgress?.('completed');
      return { summary: result.summary };
  
    } catch (error) {
      console.error('Summarization error:', error);
      
      // Update database with failed status
      await supabase
        .from('audio_files')
        .update({
          summarization_status: 'failed'
        })
        .eq('id', fileId);
  
      onProgress?.('failed');
      return {
        summary: '',
        error: error instanceof Error ? error.message : 'Summarization failed'
      };
    }
  }