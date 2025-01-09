import { supabase } from './supabase';

interface UploadResult {
  fileId: string;
  publicUrl: string;
  segments?: any[];
  key_events?: string[];
  error?: string;
}

export async function uploadAudioFile(
  file: File,
  onProgress?: (status: 'processing' | 'transcribing' | 'summarizing' | 'ready' | 'failed') => void
): Promise<UploadResult> {
  try {
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session || authError) {
      throw new Error('User not authenticated');
    }

    onProgress?.('processing');

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    // Insert record into database
    const { data: dbData, error: dbError } = await supabase
      .from('audio_files')
      .insert([{
        file_name: file.name,
        file_url: publicUrl,
        customer_id: session.user.id,
        transcription: null,
        status: 'processing',
        summary: null,
        key_events: []
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // Start transcription
    onProgress?.('transcribing');
    // Update status in database
    await supabase
      .from('audio_files')
      .update({ status: 'transcribing' })
      .eq('id', dbData.id);

    const response = await fetch('http://localhost:8000/api/transcribe-dummy', {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        formData.append('file', file, 'audio.mp3');
        return formData;
      })()
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const transcriptionResult = await response.json();

    // Update transcription in database
    await supabase
      .from('audio_files')
      .update({
        transcription: transcriptionResult.segments,
        status: 'summarizing'
      })
      .eq('id', dbData.id);

    onProgress?.('summarizing');

    // Get key events
    const eventsResponse = await fetch('http://localhost:8000/api/analyze-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ segments: transcriptionResult.segments }),
    });

    if (!eventsResponse.ok) {
      throw new Error(`Events analysis failed: ${eventsResponse.statusText}`);
    }

    const eventsResult = await eventsResponse.json();

    // Start summarization
    const summaryResponse = await fetch('http://localhost:8000/api/summarize-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ segments: transcriptionResult.segments }),
    });

    if (!summaryResponse.ok) {
      throw new Error(`Summarization failed: ${summaryResponse.statusText}`);
    }

    const summaryResult = await summaryResponse.json();

    // Update summary and key events in database with final ready status
    await supabase
      .from('audio_files')
      .update({
        summary: summaryResult.summary,
        key_events: eventsResult.key_events,
        status: 'ready'
      })
      .eq('id', dbData.id);

    onProgress?.('ready');

    return {
      fileId: dbData.id,
      publicUrl,
      segments: transcriptionResult.segments,
      key_events: eventsResult.key_events
    };

  } catch (error) {
    console.error('Upload error:', error);
    
    // If we have a file ID, update its status to failed in the database
    if (dbData?.id) {
      await supabase
        .from('audio_files')
        .update({ status: 'failed' })
        .eq('id', dbData.id);
    }
    
    onProgress?.('failed');
    return {
      fileId: '',
      publicUrl: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
} 