import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST() {
  const store = dbStore.resetToInitialSeed();
  return NextResponse.json({
    success: true,
    message: 'Demo dataset reset with Sphoorthy Engineering College Data Structures materials.',
    documentsCount: store.documents.length,
    chunksCount: store.chunks.length,
    topicsCount: store.topics.length,
  });
}
