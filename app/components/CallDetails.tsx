"use client";
import { useState } from 'react';
import { BiLineChart, BiInfoCircle, BiBot } from 'react-icons/bi';

interface CallInfo {
  agentEmail: string;
  agentName: string;
  agentTeam: string;
  audioFileName: string;
  channel: string;
  csatScore: number;
  customerName: string;
  direction: string;
  dispositionCode: string;
  durationMinutes: string;
}

const dummyCallInfo: CallInfo = {
  agentEmail: "mia.thompson@observe.ai",
  agentName: "Mia Thompson",
  agentTeam: "Outbound Sales",
  audioFileName: "sales10.mp3",
  channel: "Voice",
  csatScore: 5,
  customerName: "Terra Tolson",
  direction: "Outbound",
  dispositionCode: "Meeting",
  durationMinutes: "3:11"
};

type Tab = 'insights' | 'info' | 'summary';

interface CallDetailsProps {
  keyEvents?: string[];
  summary?: string;
}

export default function CallDetails({ keyEvents = [], summary = '' }: CallDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  return (
    <div className="flex w-80 min-w-[320px] border-r border-gray-200">
      {/* Sidebar */}
      <div className="w-12 bg-gray-50 border-r border-gray-200">
        <div className="flex flex-col items-center py-4 space-y-6">
          <button
            onClick={() => setActiveTab('insights')}
            className={`p-2 rounded-lg ${activeTab === 'insights' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <BiLineChart size={24} />
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`p-2 rounded-lg ${activeTab === 'info' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <BiInfoCircle size={24} />
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`p-2 rounded-lg ${activeTab === 'summary' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <BiBot size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full max-w-xs">
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <h2 className="text-gray-600 text-xl font-semibold mb-6">Key Events</h2>
              <ul className="space-y-3">
                {keyEvents.map((event, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="min-w-[24px] h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                      {index + 1}
                    </span>
                    <span className="flex-1">{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h2 className="text-gray-600 text-xl font-semibold mb-6">Call Info</h2>
              <div className="space-y-4">
                {Object.entries(dummyCallInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="text-sm text-gray-600">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <h2 className="text-gray-600 text-xl font-semibold mb-6">AI Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summary || 'No summary available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 