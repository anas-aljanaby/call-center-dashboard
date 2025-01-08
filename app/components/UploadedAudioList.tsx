import { useState, useEffect } from 'react';
import { BiFile } from 'react-icons/bi';
import { supabase } from '../lib/supabase';

interface AudioFile {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  transcription_status: 'pending' | 'completed' | 'failed';
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('User not authenticated');
        return;
      }

      const { data: files, error } = await supabase
        .from('audio_files')
        .select('*')
        .eq('customer_id', session.user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setAudioFiles(files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFileId(file.id);
    onSelect(file.file_url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                    {/* <span className={`px-2 py-1 text-xs rounded-full ${
                      file.transcription_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : file.transcription_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {file.transcription_status.charAt(0).toUpperCase() + 
                       file.transcription_status.slice(1)}
                    </span> */}
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
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold 
                   hover:bg-blue-700 transition-colors"
        >
          Transcribe Selected Audio
        </button>
      )}
    </div>
  );
};

export default UploadedAudioList; 