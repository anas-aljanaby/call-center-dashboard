export interface AudioFile {
  id: string;
  file_name: string;
  file_url: string;
  customer_id?: string;
  uploaded_at: string;
  key_events?: string[];
  summary?: string;
  transcription?: any;
  size?: string | number;
  status: 'processing' | 'transcribing' | 'summarizing' | 'ready' | 'failed';
} 