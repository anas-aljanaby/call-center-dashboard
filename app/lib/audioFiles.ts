import { supabase } from './supabase';
import { AudioFile } from '../types/audio';

export async function fetchUserAudioFiles(): Promise<{
  files: AudioFile[];
  error?: string;
}> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session || authError) {
      throw new Error('User not authenticated');
    }

    const { data: files, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('customer_id', session.user.id)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    const transformedFiles = files?.map(file => ({
      ...file,
      status: file.status || 'ready'
    })) || [];

    return { files: transformedFiles };

  } catch (error) {
    console.error('Error loading files:', error);
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Failed to load files'
    };
  }
} 