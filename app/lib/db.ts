import fs from 'fs/promises';
import path from 'path';
import { AudioFile } from '../types/audio';

const DB_PATH = path.join(process.cwd(), 'data', 'audio-files.json');

export class AudioFileDB {
  private static async ensureDbExists() {
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
  }

  static async getAll(): Promise<AudioFile[]> {
    await this.ensureDbExists();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  }

  static async add(file: AudioFile): Promise<AudioFile> {
    const files = await this.getAll();
    files.push(file);
    await fs.writeFile(DB_PATH, JSON.stringify(files, null, 2));
    return file;
  }

  static async delete(id: string): Promise<void> {
    const files = await this.getAll();
    const updatedFiles = files.filter(file => file.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(updatedFiles, null, 2));
  }
} 