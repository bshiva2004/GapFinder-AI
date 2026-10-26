import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const user = dbStore.getActiveUser();
  const documents = dbStore.getDocuments(user.id);
  const chunks = dbStore.getChunks(user.id);

  return NextResponse.json({
    documents,
    totalDocuments: documents.length,
    totalChunks: chunks.length,
  });
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Document ID required.' }, { status: 400 });
    }
    dbStore.deleteDocument(id);
    return NextResponse.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

