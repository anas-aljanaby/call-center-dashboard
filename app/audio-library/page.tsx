"use client";
import { useState, useEffect } from 'react';
import { BiUpload, BiFile } from 'react-icons/bi';
import { uploadAudioFile } from '../lib/fileUpload';
import { fetchUserAudioFiles, type AudioFile } from '../lib/audioFiles';
import { useAudioFiles } from '../hooks/useAudioFiles';

const AudioSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div>
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded mt-2" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export default function AudioLibraryPage() {
  const [isDragging, setIsDragging] = useState(false);
  const { audioFiles, isLoading, uploadFiles, refreshFiles } = useAudioFiles();

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
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
    <div className="p-6 min-h-screen w-full bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Audio Library</h1>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors bg-white
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <BiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">Drag and drop audio files here, or</p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              className="hidden"
              accept="audio/*"
              multiple
              onChange={handleFileSelect}
            />
            <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
              browse files
            </span>
          </label>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Uploaded Files</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <AudioSkeleton />
            ) : (
              <>
                {audioFiles.map(file => (
                  <div key={file.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BiFile className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(file.status)}`}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {audioFiles.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No files uploaded yet
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
