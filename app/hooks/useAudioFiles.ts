import { useState, useCallback, useEffect } from 'react';
import { AudioFile } from '../types/audio';
import { uploadAudioFile } from '../lib/fileUpload';
import { fetchUserAudioFiles } from '../lib/audioFiles';
import { supabase } from '../lib/supabase';

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
    deletingFiles
  };
} 