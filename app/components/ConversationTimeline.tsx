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

const ConversationTimeline: React.FC<ConversationTimelineProps> = ({ segments =[], duration }) => {
  const PIXELS_PER_SECOND = 20;
  const totalWidth = duration * PIXELS_PER_SECOND;

  // Ensure segments is an array
  const safeSegments = Array.isArray(segments) ? segments : [];

  const getSegmentWidth = (start: number, end: number) => {
    return (end - start) * PIXELS_PER_SECOND;
  };

  const getSegmentLeft = (start: number) => {
    return start * PIXELS_PER_SECOND;
  };

  return (
    <div className="w-full px-4">
      <div className="relative h-40">
        <div className="flex flex-col justify-center items-start absolute left-0 top-0 bottom-0 z-10 bg-white px-4">
          <div className="h-1/2 flex items-center">
            <span className="text-sm font-medium" style={{ color: 'blue' }}>Speaker 1</span>
          </div>
          <div className="h-1/2 flex items-center">
            <span className="text-sm font-medium" style={{ color: 'green' }}>Speaker 0</span>
          </div>
        </div>
        <div className="relative h-full ml-24" style={{ width: `${Math.max(totalWidth, 800)}px` }}>
          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300"></div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300" style={{ top: 'calc(50% + 10px)' }}></div>
          {safeSegments.map((segment, index) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationTimeline; 