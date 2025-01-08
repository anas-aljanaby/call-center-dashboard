"use client";

import { useState, useEffect } from 'react';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { BrainCircuit } from 'lucide-react';
import UploadedAudioList from './UploadedAudioList';
import { useAudioFiles } from '../hooks/useAudioFiles';

interface Segment {
  text: string;
  startTime: number;
  endTime: number;
  speaker: string;
  channel: number;
}

interface SidebarProps {
  onFileSelect: (file: AudioFile) => void;
}

export default function Sidebar({ onFileSelect }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { uploadFiles, isLoading, error } = useAudioFiles();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      await uploadFiles([selectedFile]);
    } catch (err) {
      console.error('Error processing file:', err);
    }
  };

  return (
    <div className={`relative transition-all duration-300 bg-white shadow-lg border-r border-gray-200 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 bg-white rounded-full p-1 shadow-md border border-gray-200 z-10"
      >
        {isCollapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
      </button>

      <div className={`h-screen overflow-y-auto ${isCollapsed ? 'px-2 py-4' : 'p-6'}`}>
        {!isCollapsed ? (
          <div className={`transition-opacity duration-300 ${isCollapsed 
            ? 'opacity-0 invisible w-0' : 'opacity-100 visible w-full delay-150'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 whitespace-nowrap">
              Audio Transcription
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Audio File
                </label>
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.flac,.ogg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    transition-all duration-200"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                
                {isLoading && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Processing audio...</span>
                  </div>
                )}
              </div>

              <UploadedAudioList 
                onSelect={(file) => {
                  onFileSelect(file);
                }}
              />
            </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center space-y-6 transition-all duration-300 ${
            isCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible w-0 delay-150'
          }`}>
            <div className="flex flex-col items-center gap-2 mt-4">
              <BrainCircuit size={24} className="text-gray-600" />
              <div className="h-px w-8 bg-gray-200" />
            </div>
            
            <button
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              title="Upload Audio"
            >
              <BiUpload size={20} />
            </button>
            
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.flac,.ogg"
              onChange={handleFileChange}
              className="hidden"
            />

            {isLoading && (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 