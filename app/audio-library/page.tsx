"use client";
import { useState, useEffect } from 'react';
import { BiUpload, BiFile } from 'react-icons/bi';

interface AudioFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'processing' | 'ready' | 'failed';
  path?: string;
}

interface ServerAudioFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  status: 'processing' | 'ready' | 'failed';
  path: string;
}

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
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing files when component mounts
  useEffect(() => {
    const loadExistingFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) throw new Error('Failed to load files');
        const data: ServerAudioFile[] = await response.json();
        
        const formattedFiles: AudioFile[] = data.map(file => ({
          id: file.id,
          name: file.originalName,
          size: formatFileSize(file.size),
          uploadDate: new Date(file.uploadDate).toLocaleDateString(),
          status: file.status,
          path: file.path
        }));

        setAudioFiles(formattedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFiles();
  }, []);

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
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Filter out duplicates before creating new audio files
    const newFiles = files.filter(file => !audioFiles.some(
      existingFile => existingFile.name === file.name && existingFile.status === 'ready'
    ));

    // If no new files after filtering duplicates, return early
    if (newFiles.length === 0) return;

    const newAudioFiles: AudioFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      uploadDate: new Date().toLocaleDateString(),
      status: 'processing'
    }));

    setAudioFiles(prev => [...prev, ...newAudioFiles]);

    // Upload each file
    for (const [index, file] of newFiles.entries()) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const uploadedFile: ServerAudioFile = await response.json();

        // Update the status of the uploaded file
        setAudioFiles(prev => prev.map(audioFile => 
          audioFile.id === newAudioFiles[index].id
            ? {
                ...audioFile,
                status: 'ready',
                path: uploadedFile.path
              }
            : audioFile
        ));
      } catch (error) {
        setAudioFiles(prev => prev.map(audioFile => 
          audioFile.id === newAudioFiles[index].id
            ? { ...audioFile, status: 'failed' }
            : audioFile
        ));
        console.error('Error uploading file:', error);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 min-h-screen w-full bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Audio Library</h1>
        
        {/* Upload Area */}
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

        {/* Files List */}
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
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{file.uploadDate}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        file.status === 'ready' ? 'bg-green-100 text-green-800' :
                        file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
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
