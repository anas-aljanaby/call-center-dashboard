"use client";

import { useEffect, useState, useRef } from 'react';
import { BiFile, BiDotsVertical, BiTrash, BiRefresh } from 'react-icons/bi';
import { useAudioFiles } from '../hooks/useAudioFiles';
import { AudioFile } from '../types/audio';
import { useSettings } from '../contexts/SettingsContext';

interface UploadedAudioListProps {
  onSelect: (file: AudioFile) => void;
  selectedFileId?: string | null;
}

const AudioItemSkeleton = () => (
  <div className="p-3 rounded-lg border border-gray-200 animate-pulse">
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="w-4 h-4 bg-gray-200 rounded mt-0.5 flex-shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="flex justify-between items-end mt-auto pt-2">
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

const UploadedAudioList: React.FC<UploadedAudioListProps> = ({ onSelect, selectedFileId }) => {
  const { audioFiles, isLoading, error, refreshFiles, deleteFile, deletingFiles, reprocessFile } = useAudioFiles();
  const { settings } = useSettings();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleFileSelect = (file: AudioFile) => {
    onSelect(file);
  };

  const handleDeleteClick = async (fileId: string) => {
    try {
      await deleteFile(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Optionally show an error message to the user
    }
    setMenuOpenId(null);
  };

  const handleReprocessClick = async (file: AudioFile) => {
    try {
      setMenuOpenId(null);
      await reprocessFile(file, settings);
    } catch (error) {
      console.error('Error reprocessing file:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusStyle = (status: AudioFile['status']) => {
    const styles = {
      ready: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      transcribing: 'bg-blue-100 text-blue-800',
      summarizing: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.failed;
  };

  return (
    <div className="flex flex-col h-80">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Audio Files</h3>
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        <div className="space-y-2 p-2">
          {isLoading ? (
            <>
              <AudioItemSkeleton />
              <AudioItemSkeleton />
              <AudioItemSkeleton />
            </>
          ) : error ? (
            <div className="text-sm text-red-500 p-2">{error}</div>
          ) : (
            <>
              {audioFiles.map(file => (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer relative group
                    ${selectedFileId === file.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'}
                    ${deletingFiles.has(file.id) ? 'opacity-50' : ''}`}
                  onClick={() => !deletingFiles.has(file.id) && handleFileSelect(file)}
                >
                  <div className="flex flex-col h-full ">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 min-w-0 flex-1 pr-4">
                        <BiFile className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                          {file.file_name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === file.id ? null : file.id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1 flex-shrink-0"
                      >
                        <BiDotsVertical className="text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto pt-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </p>
                      {file.status !== 'ready' && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(file.status)}`}>
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {menuOpenId === file.id && !deletingFiles.has(file.id) && (
                    <div 
                      ref={menuRef}
                      className="absolute top-0 right-0 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 mt-8"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReprocessClick(file);
                        }}
                        className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                        disabled={file.status !== 'ready' && file.status !== 'failed'}
                      >
                        <BiRefresh />
                        Reprocess
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(file.id);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                        disabled={deletingFiles.has(file.id)}
                      >
                        <BiTrash />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {audioFiles.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No audio files uploaded
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadedAudioList; 