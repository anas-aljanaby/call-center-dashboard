import { ProcessingSettings } from '../contexts/SettingsContext';
import { API_BASE_URL } from '../config/api';
import { Segment } from '../types/audio';

export async function transcribeWithSettings(
  file: File, 
  settings: ProcessingSettings
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('settings', JSON.stringify(settings));

  // Log the actual contents of formData
  console.log('Sending request to transcribe');
  console.log('Settings:', settings);
  console.log('FormData entries:');
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function analyzeEventsWithSettings(
  segments: Segment[],
  settings: ProcessingSettings
) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      segments,
      settings,
    }),
  });

  return response.json();
}

export async function summarizeWithSettings(
  segments: Segment[],
  settings: ProcessingSettings
) {
  const response = await fetch(`${API_BASE_URL}/api/summarize-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      segments,
      settings,
    }),
  });

  return response.json();
} 