import React from 'react';

interface Segment {
  startTime: number;
  endTime: number;
  text: string;
  speaker: string;
  channel: number;
}

interface ConversationTimelineProps {
  segments: Segment[];
  duration: number;
}

const ConversationTimeline: React.FC<ConversationTimelineProps> = ({ segments, duration }) => {
  const PIXELS_PER_SECOND = 40;
  const totalWidth = duration * PIXELS_PER_SECOND;

  const getSegmentWidth = (start: number, end: number) => {
    return (end - start) * PIXELS_PER_SECOND;
  };

  const getSegmentLeft = (start: number) => {
    return start * PIXELS_PER_SECOND;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="relative h-40 bg-gray-50 rounded-lg overflow-x-auto shadow-inner">
        <div className="absolute top-0 h-full" style={{ width: `${totalWidth}px` }}>
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/2 border-b border-gray-200 flex items-center px-4">
              <span className="text-sm font-medium text-gray-700">Speaker 1</span>
            </div>
            <div className="h-1/2 flex items-center px-4">
              <span className="text-sm font-medium text-gray-700">Speaker 0</span>
            </div>
          </div>
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`absolute h-14 ${
                segment.speaker === 'Speaker 1' ? 'top-4' : 'bottom-4'
              }`}
              style={{
                left: `${getSegmentLeft(segment.startTime)}px`,
                width: `${getSegmentWidth(segment.startTime, segment.endTime)}px`,
              }}
            >
              <div
                className={`h-full ${
                  segment.speaker === 'Speaker 1' ? 'bg-blue-200 hover:bg-blue-300' : 'bg-green-200 hover:bg-green-300'
                } rounded-lg p-2 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* Removed text and timestamps */}
              </div>
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-6 border-t border-gray-200">
            {Array.from({ length: duration + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-2 border-l border-gray-300"
                style={{ left: `${i * PIXELS_PER_SECOND}px` }}
              >
                <div className="absolute -left-3 top-2 text-xs text-gray-500">
                  {i}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTimeline; 