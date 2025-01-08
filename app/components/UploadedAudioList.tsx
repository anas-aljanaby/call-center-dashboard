"use client";

import { useEffect, useState } from 'react';
import { BiFile } from 'react-icons/bi';
import { useAudioFiles } from '../hooks/useAudioFiles';

interface UploadedAudioListProps {
  onSelect: (file: AudioFile) => void;
}

const UploadedAudioList: React.FC<UploadedAudioListProps> = ({ onSelect }) => {
  const { audioFiles, isLoading, error, refreshFiles } = useAudioFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFileId(file.id);
    onSelect(file);
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
                  className={`p-3 rounded-lg border transition-colors cursor-pointer relative
                    ${selectedFileId === file.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center gap-2">
                    <BiFile className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(file.status)}`}>
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </span>
                  </div>
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