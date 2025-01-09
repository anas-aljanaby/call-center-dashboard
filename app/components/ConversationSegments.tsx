import React from 'react';
import { BiPlay } from 'react-icons/bi';
import { Segment } from '../types/audio';

interface ConversationSegmentsProps {
  segments: Segment[];
}

const ConversationSegments: React.FC<ConversationSegmentsProps> = ({ segments = [] }) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Ensure segments is an array
  const safeSegments = Array.isArray(segments) ? segments : [];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {safeSegments.map((segment, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {formatTime(segment.startTime)}
                </span>
                <span className="font-medium text-gray-500">
                  {segment.speaker === 'Speaker 1' ? 'Agent' : 'Customer'}
                </span>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900 bg-white shadow-sm border border-gray-200"
              >
                <BiPlay size={20} />
              </button>
            </div>

            <div className="relative bg-gray-50 hover:bg-gray-100 transition-colors w-full">
              <div 
                className={`absolute left-0 top-0 w-1 h-full ${
                  segment.speaker === 'Speaker 1' ? 'bg-blue-500' : 'bg-green-500'
                }`}
              />
              <div className="p-3 pl-4">
                <p className="text-gray-700">{segment.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationSegments; 