import { useState, useCallback, useEffect } from 'react';
import { AudioFile } from '../types/audio';
import { uploadAudioFile } from '../lib/fileUpload';
import { fetchUserAudioFiles } from '../lib/audioFiles';
import { supabase } from '../lib/supabase';

export function useAudioFiles() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      // Update local state
      setAudioFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
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
    deleteFile
  };
} 