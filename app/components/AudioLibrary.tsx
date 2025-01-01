interface AudioClip {
  id: string;
  title: string;
  filename: string;
  duration: string;
  date: string;
}

const demoClips: AudioClip[] = [
  {
    id: '1',
    title: 'Customer Service Call #1',
    filename: 'call1.mp3',
    duration: '3:45',
    date: '2024-03-15'
  },
];

interface AudioLibraryProps {
  onSelect: (filename: string) => void;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Demo Audio Clips</h3>
      <div className="space-y-2">
        {demoClips.map((clip) => (
          <button
            key={clip.id}
            onClick={() => onSelect(`/audio/${clip.filename}`)}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 
                     transition-colors text-left flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">{clip.title}</p>
              <p className="text-sm text-gray-500">{clip.date}</p>
            </div>
            <span className="text-sm text-gray-500">{clip.duration}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioLibrary; 