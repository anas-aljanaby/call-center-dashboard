"use client";

import { useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BrainCircuit } from 'lucide-react';
import UploadedAudioList from './UploadedAudioList';
import { AudioFile } from '../types/audio';
import { useSettings } from '../contexts/SettingsContext';


interface SidebarProps {
  onFileSelect: (file: AudioFile) => void;
  selectedFileId?: string | null;
}

export default function Sidebar({ onFileSelect, selectedFileId }: SidebarProps) {
  const { settings, updateSettings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`relative flex flex-col h-screen transition-all duration-300 bg-white shadow-lg border-r border-gray-200 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 bg-white rounded-full p-1 shadow-md border border-gray-200 z-10"
      >
        {isCollapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
      </button>

      {!isCollapsed ? (
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BrainCircuit size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                Audio Transcription
              </h2>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Audio Files List */}
              <div className="space-y-2">
                <UploadedAudioList 
                  onSelect={onFileSelect}
                  selectedFileId={selectedFileId}
                />
              </div>

              {/* Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Settings</span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                {/* Model Selection Group */}
                <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                    <select
                      value={settings.aiModel}
                      onChange={(e) => updateSettings({ aiModel: e.target.value as 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4o-mini' })}
                      className="block w-full pl-3 text-gray-700 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transcription Model</label>
                    <select
                      value={settings.transcriptionModel}
                      onChange={(e) => updateSettings({ transcriptionModel: e.target.value as 'real' | 'dummy' })}
                      className="block w-full pl-3 text-gray-700 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="real">Real Transcription</option>
                      <option value="dummy">Dummy Transcription</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={settings.languageId}
                      onChange={(e) => updateSettings({ languageId: e.target.value as 'ar-ir' | 'ar' })}
                      className="block w-full text-gray-700 pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="ar-ir">ar-ir</option>
                      <option value="ar">ar</option>
                    </select>
                  </div>
                </div>

                {/* Toggle Options Group */}
                <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Sentiment Detection
                    </label>
                    <button
                      role="switch"
                      aria-checked={settings.sentimentDetect}
                      onClick={() => updateSettings({ sentimentDetect: !settings.sentimentDetect })}
                      className={`${
                        settings.sentimentDetect ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.sentimentDetect ? 'translate-x-4' : 'translate-x-0'
                        } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Enable Transcription
                    </label>
                    <button
                      role="switch"
                      aria-checked={settings.transcriptionEnabled}
                      onClick={() => updateSettings({ transcriptionEnabled: !settings.transcriptionEnabled })}
                      className={`${
                        settings.transcriptionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.transcriptionEnabled ? 'translate-x-4' : 'translate-x-0'
                        } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Enable Summary
                    </label>
                    <button
                      role="switch"
                      aria-checked={settings.summaryEnabled}
                      onClick={() => updateSettings({ summaryEnabled: !settings.summaryEnabled })}
                      className={`${
                        settings.summaryEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.summaryEnabled ? 'translate-x-4' : 'translate-x-0'
                        } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Enable Key Events
                    </label>
                    <button
                      role="switch"
                      aria-checked={settings.keyEventsEnabled}
                      onClick={() => updateSettings({ keyEventsEnabled: !settings.keyEventsEnabled })}
                      className={`${
                        settings.keyEventsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          settings.keyEventsEnabled ? 'translate-x-4' : 'translate-x-0'
                        } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <BrainCircuit size={24} className="text-blue-600" />
          <div className="h-px w-8 bg-gray-200 mt-4" />
        </div>
      )}
    </div>
  );
} 