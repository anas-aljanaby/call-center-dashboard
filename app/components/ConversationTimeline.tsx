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
  const PIXELS_PER_SECOND = 20;
  const totalWidth = duration * PIXELS_PER_SECOND;

  const getSegmentWidth = (start: number, end: number) => {
    return (end - start) * PIXELS_PER_SECOND;
  };

  const getSegmentLeft = (start: number) => {
    return start * PIXELS_PER_SECOND;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="relative h-40 bg-gray-50 rounded-lg overflow-x-auto shadow-inner flex">
        <div className="flex flex-col justify-center items-start p-4">
          <div className="h-1/2 flex items-center">
            <span className="text-sm font-medium" style={{ color: 'blue' }}>Speaker 1</span>
          </div>
          <div className="h-1/2 flex items-center">
            <span className="text-sm font-medium" style={{ color: 'green' }}>Speaker 0</span>
          </div>
        </div>
        <div className="relative h-full flex-1" style={{ width: `${totalWidth}px` }}>
          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300"></div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300" style={{ top: 'calc(50% + 10px)' }}></div>
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`absolute h-2 ${
                segment.speaker === 'Speaker 1' ? 'top-10' : 'bottom-10'
              }`}
              style={{
                left: `${getSegmentLeft(segment.startTime)}px`,
                width: `${getSegmentWidth(segment.startTime, segment.endTime)}px`,
              }}
            >
              <div
                className={`h-full ${
                  segment.speaker === 'Speaker 1' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                } rounded-lg p-2 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* Removed text and timestamps */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationTimeline; 