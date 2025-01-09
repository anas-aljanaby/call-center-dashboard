"use client";

import { useState, useEffect } from 'react';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { BrainCircuit } from 'lucide-react';
import UploadedAudioList from './UploadedAudioList';
import { useAudioFiles } from '../hooks/useAudioFiles';
import { AudioFile } from '../types/audio';

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
          </div>
        )}
      </div>
    </div>
  );
} 