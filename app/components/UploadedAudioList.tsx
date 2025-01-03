import { useState, useEffect } from 'react';
import { BiFile } from 'react-icons/bi';

interface AudioFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'processing' | 'ready' | 'failed';
  path?: string;
}

interface ServerAudioFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  status: 'processing' | 'ready' | 'failed';
  path: string;
}

interface UploadedAudioListProps {
  onSelect: (audioUrl: string) => void;
  onTranscribe: () => void;
}

const UploadedAudioList: React.FC<UploadedAudioListProps> = ({ onSelect, onTranscribe }) => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingFiles();
  }, []);

  const loadExistingFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to load files');
      const data: ServerAudioFile[] = await response.json();
      
      const formattedFiles: AudioFile[] = data.map(file => ({
        id: file.id,
        name: file.originalName,
        size: formatFileSize(file.size),
        uploadDate: new Date(file.uploadDate).toLocaleDateString(),
        status: file.status,
        path: file.path
      }));

      setAudioFiles(formattedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFileId(file.id);
    if (file.path) {
      onSelect(file.path);
    }
  };

  return (
    <div className="flex flex-col h-96">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Uploaded Audio Files</h3>
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="text-sm text-gray-500 p-2">Loading...</div>
          ) : (
            <>
              {audioFiles.map(file => (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer
                    ${selectedFileId === file.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center gap-2">
                    <BiFile className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.uploadDate}</p>
                    </div>
                  </div>
                </div>
              ))}
              {audioFiles.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No audio files uploaded
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedFileId && (
        <button
          onClick={onTranscribe}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Transcribe Selected Audio
        </button>
      )}
    </div>
  );
};

export default UploadedAudioList; 