import { useState, useCallback, useEffect } from 'react';
import { AudioFile } from '../types/audio';
import { uploadAudioFile } from '../lib/fileUpload';
import { fetchUserAudioFiles } from '../lib/audioFiles';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

export function useAudioFiles() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const refreshFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { files, error } = await fetchUserAudioFiles();
    
    if (error) {
      console.error('Error loading files:', error);
      setError(error);
    } else {
      setAudioFiles(files);
    }
    
    setIsLoading(false);
  }, []);

  const deleteFile = async (fileId: string) => {
    try {
      // Optimistically update UI
      setDeletingFiles(prev => new Set(prev).add(fileId));
      
      // First get the file details to get the filename
      const { data: fileData, error: fetchError } = await supabase
        .from('audio_files')
        .select('file_url')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Extract filename from the URL
      const fileUrl = new URL(fileData.file_url);
      const filePath = fileUrl.pathname.split('/').pop();

      if (!filePath) {
        throw new Error('Could not extract filename from URL');
      }

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('audio-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete the record from the database
      const { error: dbError } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Update local state
      setAudioFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      // Revert optimistic update on error
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      throw error;
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const uploadFiles = async (files: File[]) => {
    const newFiles = files.filter(file => !audioFiles.some(
      existingFile => existingFile.file_name === file.name && existingFile.status === 'ready'
    ));

    if (newFiles.length === 0) return;

    // Add placeholder entries for new files immediately
    setAudioFiles(prev => [
      ...newFiles.map(file => ({
        id: `temp-${Date.now()}-${file.name}`,
        file_name: file.name,
        file_url: '',
        uploaded_at: new Date().toISOString(),
        size: file.size,
        status: 'processing' as const
      })),
      ...prev
    ]);

    for (const file of newFiles) {
      const result = await uploadAudioFile(file, (status) => {
        setAudioFiles(prev => prev.map(audioFile => 
          audioFile.file_name === file.name
            ? { ...audioFile, status }
            : audioFile
        ));
      });

      if (!result.error) {
        // Update the file entry with the actual data
        setAudioFiles(prev => prev.map(audioFile => 
          audioFile.file_name === file.name
            ? {
                ...audioFile,
                id: result.fileId,
                file_url: result.publicUrl,
                status: 'ready'
              }
            : audioFile
        ));
      } else {
        // Remove the temporary entry if upload failed
        setAudioFiles(prev => prev.filter(
          audioFile => audioFile.file_name !== file.name
        ));
      }
    }
  };

  const deleteAllFiles = async () => {
    try {
      // Get all file IDs and URLs
      const fileIds = audioFiles.map(file => file.id);
      
      // Get all file paths from URLs
      const filePaths = audioFiles
        .map(file => {
          try {
            const url = new URL(file.file_url);
            return url.pathname.split('/').pop();
          } catch (e) {
            console.error('Error extracting file path:', e);
            return null;
          }
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        // Delete all files from storage
        const { error: storageError } = await supabase.storage
          .from('audio-files')
          .remove(filePaths);

        if (storageError) throw storageError;
      }

      // Delete all records from the database
      const { error: dbError } = await supabase
        .from('audio_files')
        .delete()
        .in('id', fileIds);

      if (dbError) throw dbError;

      // Update local state
      setAudioFiles([]);
    } catch (error) {
      console.error('Error deleting all files:', error);
      throw error;
    }
  };

  const reprocessFile = async (file: AudioFile) => {
    try {
      // Update status to processing
      const { error: updateError } = await supabase
        .from('audio_files')
        .update({ status: 'processing' })
        .eq('id', file.id);

      if (updateError) throw updateError;

      // Optimistically update UI
      setAudioFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' } : f
      ));

      // Get the file from storage
      const { data: fileData } = await supabase.storage
        .from('audio-files')
        .download(file.file_url.split('/').pop() || '');

      if (!fileData) {
        throw new Error('Could not download file');
      }

      // Create a File object from the blob
      const audioFile = new File([fileData], file.file_name, {
        type: 'audio/mpeg'
      });

      // Update status to transcribing
      await supabase
        .from('audio_files')
        .update({ status: 'transcribing' })
        .eq('id', file.id);

      // Update UI to show transcribing
      setAudioFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'transcribing' } : f
      ));

      // Start transcription
      const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', audioFile, 'audio.mp3');
          return formData;
        })()
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const transcriptionResult = await response.json();

      // Update status to summarizing
      await supabase
        .from('audio_files')
        .update({
          transcription: transcriptionResult.segments,
          status: 'summarizing'
        })
        .eq('id', file.id);

      // Update UI to show summarizing
      setAudioFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'summarizing',
          transcription: transcriptionResult.segments 
        } : f
      ));

      // Get key events
      const eventsResponse = await fetch(`${API_BASE_URL}/api/analyze-events`, {
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

      // Get summary
      const summaryResponse = await fetch(`${API_BASE_URL}/api/summarize-conversation`, {
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

      // Update final data in database
      await supabase
        .from('audio_files')
        .update({
          transcription: transcriptionResult.segments,
          key_events: eventsResult.key_events,
          summary: summaryResult.summary,
          status: 'ready'
        })
        .eq('id', file.id);

      // Update UI with final data
      setAudioFiles(prev => prev.map(f => 
        f.id === file.id ? {
          ...f,
          status: 'ready',
          transcription: transcriptionResult.segments,
          key_events: eventsResult.key_events,
          summary: summaryResult.summary
        } : f
      ));

    } catch (error) {
      console.error('Reprocess error:', error);
      
      // Update status to failed
      await supabase
        .from('audio_files')
        .update({ status: 'failed' })
        .eq('id', file.id);

      // Update UI to show failed status
      setAudioFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'failed' } : f
      ));

      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  return {
    audioFiles,
    isLoading,
    error,
    uploadFiles,
    refreshFiles,
    deleteFile,
    deleteAllFiles,
    deletingFiles,
    reprocessFile
  };
} 