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

export default function Sidebar() {
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
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
      // Here you can handle the transcription result, perhaps by passing it up to a parent component
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 border-r border-gray-200">
      <h2 className="text-xl font-bold mb-4">Audio Transcription</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Audio File
          </label>
          <input
            type="file"
            accept=".mp3,.wav,.m4a,.flac,.ogg"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleTranscribe}
          disabled={!file || isTranscribing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${!file || isTranscribing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {file && (
          <div className="text-sm text-gray-600">
            Selected file: {file.name}
          </div>
        )}
      </div>
    </div>
  );
} 