import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { AudioFile } from '@/app/types/audio';

const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    // Ensure uploads directory exists
    await mkdir(uploadsDirectory, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public/uploads directory
    const filePath = path.join(uploadsDirectory, uniqueFilename);
    await writeFile(filePath, buffer);

    // Save metadata to JSON file
    const metadata: AudioFile = {
      id: Date.now().toString(),
      file_name: file.name,
      file_url: `/uploads/${uniqueFilename}`,
      uploaded_at: new Date().toISOString(),
      status: 'ready',
      size: file.size
    };

    // Add to database
    const { AudioFileDB } = await import('@/app/lib/db');
    await AudioFileDB.add(metadata);

    return NextResponse.json(metadata, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 