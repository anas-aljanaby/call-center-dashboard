import { supabase } from './supabase';
import { ProcessingSettings } from '../contexts/SettingsContext';
import { transcribeWithSettings, analyzeEventsWithSettings, summarizeWithSettings } from './processingService';

interface UploadResult {
  fileId: string;
  publicUrl: string;
  segments?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    speaker?: string;
  }>;
  key_events?: string[];
  error?: string;
}

export async function uploadAudioFile(
  file: File,
  settings: ProcessingSettings,
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
    const { error: uploadError } = await supabase.storage
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

    if (settings.transcriptionEnabled) {
      onProgress?.('transcribing');
      const transcriptionResult = await transcribeWithSettings(file, settings);
      
      onProgress?.('summarizing');
      let eventsResult = { key_events: [] };
      let summaryResult = { summary: '' };
      
      if (settings.keyEventsEnabled) {
        eventsResult = await analyzeEventsWithSettings(
          transcriptionResult.segments,
          settings
        );
      }
      
      if (settings.summaryEnabled) {
        summaryResult = await summarizeWithSettings(
          transcriptionResult.segments,
          settings
        );
      }

      // Update database with all results
      await supabase
        .from('audio_files')
        .update({
          transcription: transcriptionResult.segments,
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
    }

    // If transcription is not enabled, mark as ready
    await supabase
      .from('audio_files')
      .update({ status: 'ready' })
      .eq('id', dbData.id);

    onProgress?.('ready');

    return {
      fileId: dbData.id,
      publicUrl
    };

  } catch (error) {
    console.error('Upload error:', error);
    
    onProgress?.('failed');
    return {
      fileId: '',
      publicUrl: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
} 