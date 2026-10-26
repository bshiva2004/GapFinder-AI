import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { extractDocumentContent } from '@/lib/extractor/text-extractor';
import { chunkDocumentText } from '@/lib/rag/chunker';
import { generateLocalEmbedding } from '@/lib/rag/embeddings';
import { DocumentCategory, StudyDocument } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const user = dbStore.getActiveUser();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as DocumentCategory) || 'notes';
    const customTitle = formData.get('title') as string | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded. Please choose a PDF or TXT file.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'document.txt';
    const fileType = file.type || 'text/plain';
    const fileSize = file.size || 0;

    // Validate extension
    const ext = fileName.toLowerCase().split('.').pop();
    if (!['pdf', 'txt', 'text', 'md'].includes(ext || '')) {
      return NextResponse.json(
        {
          error: `Unsupported file format (.${ext}). Only text (.txt, .md) and selectable PDF (.pdf) documents are supported.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text content with scanned PDF checks
    let extraction: any;
    try {
      extraction = await extractDocumentContent({
        buffer,
        fileName,
        mimeType: fileType,
      });
    } catch (extractErr: any) {
      return NextResponse.json(
        {
          error: extractErr.message || 'Failed to extract text from document.',
        },
        { status: 422 }
      );
    }

    const docId = `doc-${Date.now()}`;
    const docTitle =
      customTitle && customTitle.trim().length > 0
        ? customTitle.trim()
        : fileName.replace(/\.[^/.]+$/, '');

    // Chunk the text into meaningful overlapping passages
    const rawChunks = chunkDocumentText({
      documentId: docId,
      documentTitle: docTitle,
      text: extraction.text,
    });

    if (rawChunks.length === 0) {
      return NextResponse.json(
        {
          error:
            'Extracted text contains no usable paragraphs or content to index.',
        },
        { status: 422 }
      );
    }

    // Generate embeddings for chunks
    const chunksWithEmbeddings = rawChunks.map((chunk) => ({
      ...chunk,
      embedding: generateLocalEmbedding(chunk.content),
    }));

    const newDoc: StudyDocument = {
      id: docId,
      userId: user.id,
      title: docTitle,
      category,
      fileName,
      fileSize,
      fileType,
      status: 'ready',
      pageCount: extraction.pageCount || 1,
      chunkCount: chunksWithEmbeddings.length,
      contentSummary: extraction.text.slice(0, 240) + '...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.addDocument(newDoc);
    dbStore.addChunks(chunksWithEmbeddings);

    return NextResponse.json({
      success: true,
      document: newDoc,
      chunksCreated: chunksWithEmbeddings.length,
      message: `Document "${docTitle}" successfully processed into ${chunksWithEmbeddings.length} indexed chunks.`,
    });
  } catch (err: any) {
    console.error('Document upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while processing document.' },
      { status: 500 }
    );
  }
}
