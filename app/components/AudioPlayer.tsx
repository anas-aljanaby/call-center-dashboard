"use client";

import React from 'react';
import { BiPlay, BiPause } from 'react-icons/bi';

interface AudioPlayerProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  duration,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 py-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isPlaying ? <BiPause size={20} /> : <BiPlay size={20} />}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="text-xs text-gray-600 min-w-[60px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 