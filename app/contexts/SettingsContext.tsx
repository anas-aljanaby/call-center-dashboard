import { createContext, useContext, ReactNode, useState } from 'react';

export interface ProcessingSettings {
  // AI Model Settings
  aiModel: 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4o-mini';
  
  // Transcription Settings
  transcriptionModel: 'real' | 'dummy';
  languageId: 'ar-ir' | 'ar';
  sentimentDetect: boolean;
  
  // Feature Toggles
  transcriptionEnabled: boolean;
  summaryEnabled: boolean;
  keyEventsEnabled: boolean;
}

interface SettingsContextType {
  settings: ProcessingSettings;
  updateSettings: (newSettings: Partial<ProcessingSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProcessingSettings>({
    aiModel: 'gpt-3.5-turbo',
    transcriptionModel: 'real',
    languageId: 'ar-ir',
    sentimentDetect: true,
    transcriptionEnabled: true,
    summaryEnabled: true,
    keyEventsEnabled: true,
  });

  const updateSettings = (newSettings: Partial<ProcessingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 