"use client";

import { useEffect, useState, useRef } from 'react';
import { BiFile, BiDotsVertical, BiTrash } from 'react-icons/bi';
import { useAudioFiles } from '../hooks/useAudioFiles';
import { AudioFile } from '../types/audio';

interface UploadedAudioListProps {
  onSelect: (file: AudioFile) => void;
}

const UploadedAudioList: React.FC<UploadedAudioListProps> = ({ onSelect }) => {
  const { audioFiles, isLoading, error, refreshFiles, deleteFile } = useAudioFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
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
    setSelectedFileId(file.id);
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
    <div className="flex flex-col h-96">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Uploaded Audio Files</h3>
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="text-sm text-gray-500 p-2">Loading...</div>
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
                      : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-start gap-2">
                    <BiFile className="text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === file.id ? null : file.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity -mt-1"
                    >
                      <BiDotsVertical className="text-gray-500" />
                    </button>
                    {menuOpenId === file.id && (
                      <div 
                        ref={menuRef}
                        className="absolute top-0 right-0 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 mt-8"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(file.id);
                          }}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <BiTrash />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {file.status !== 'ready' && (
                    <div className="absolute bottom-1.5 right-2">
                      <span className={`px-1 py-0.5 text-xs rounded-full ${getStatusStyle(file.status)}`}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
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