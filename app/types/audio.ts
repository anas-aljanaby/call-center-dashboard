export interface AudioFile {
  id: string;
  file_name: string;
  file_url: string;
  customer_id?: string;
  uploaded_at: string;
  key_events?: string[];
  summary?: string;
  transcription?: Segment[];
  size?: string | number;
  status: 'processing' | 'transcribing' | 'summarizing' | 'ready' | 'failed';
}

export interface Segment {
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  channel?: number;
  sentiment?: string;
} 