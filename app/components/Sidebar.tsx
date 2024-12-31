"use client";

import { useState } from 'react';

interface TranscriptionResponse {
  success: boolean;
  data: {
    full_text: string;
    timestamps: Array<{
      text: string;
      start: number;
      end: number;
    }>;
    job_id: string;
  };
}

interface SidebarProps {
  onFileSelect: (audioUrl: string) => void;
}

export default function Sidebar({ onFileSelect }: SidebarProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create object URL for audio playback
      const audioUrl = URL.createObjectURL(selectedFile);
      // Pass this URL up to parent component
      onFileSelect(audioUrl);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select an audio file first');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/transcribe-dummy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result: TranscriptionResponse = await response.json();
      console.log('Transcription result:', result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="w-72 h-screen bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
          </div>

          <button
            onClick={handleTranscribe}
            disabled={!file || isTranscribing}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold
              transition-all duration-200 shadow-sm
              ${!file || isTranscribing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
          >
            {isTranscribing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transcribing...
              </span>
            ) : 'Transcribe'}
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {file && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">
                Selected file: {file.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 