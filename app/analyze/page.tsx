"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AudioFile, Segment } from '../types/audio';
import ConversationTimeline from '../components/ConversationTimeline';
import CallDetails from '../components/CallDetails';
import ConversationSegments from '../components/ConversationSegments';
import AudioPlayer from '../components/AudioPlayer';
import Sidebar from '../components/Sidebar';
import { useAudioFiles } from '../hooks/useAudioFiles';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [keyEvents, setKeyEvents] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { audioFiles } = useAudioFiles();

  useEffect(() => {
    if (!selectedFile && audioFiles.length > 0) {
      const firstReadyFile = audioFiles.find(file => file.status === 'ready');
      if (firstReadyFile) {
        handleFileSelect(firstReadyFile);
      }
    }
  }, [audioFiles, selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      // Set audio URL
      audioRef.current = new Audio(selectedFile.file_url);

      // Set transcription data if available
      if (selectedFile.transcription) {
        try {
          const parsedTranscription = typeof selectedFile.transcription === 'string'
            ? JSON.parse(selectedFile.transcription)
            : selectedFile.transcription;
          setSegments(parsedTranscription);
        } catch (error) {
          console.error('Error parsing transcription:', error);
          setSegments([]);
        }
      }

      // Set key events if available
      if (selectedFile.key_events) {
        setKeyEvents(selectedFile.key_events);
      }

      // Set summary if available
      if (selectedFile.summary) {
        setSummary(selectedFile.summary);
      }

      // Audio event listeners
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [selectedFile]);

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFile(file);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFile?.id}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="h-full flex flex-col bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <ConversationTimeline segments={segments} duration={duration} />
              <div className="w-full px-4">
                <AudioPlayer
                  duration={duration}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden mt-4 border-t border-gray-200">
            <div className="h-[calc(100vh-300px)]">
              <CallDetails keyEvents={keyEvents} summary={summary} />
            </div>
            <div className="flex-1 pl-3 border-l border-gray-200 ml-2 h-[calc(100vh-300px)]">
              <ConversationSegments segments={segments} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
