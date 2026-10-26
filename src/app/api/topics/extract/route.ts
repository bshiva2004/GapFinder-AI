import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { extractTopicsFromSyllabus } from '@/lib/ai/topic-extractor';

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    const documents = dbStore.getDocuments(user.id);
    const chunks = dbStore.getChunks(user.id);

    // Find syllabus document
    let syllabusDoc = documents.find((d) => d.category === 'syllabus');
    if (!syllabusDoc && documents.length > 0) {
      syllabusDoc = documents[0];
    }

    if (!syllabusDoc) {
      return NextResponse.json(
        {
          error:
            'No syllabus or course outline uploaded. Please upload your syllabus in "My Materials" first.',
        },
        { status: 400 }
      );
    }

    // Get syllabus chunks to reconstruct text
    const syllabusChunks = chunks.filter((c) => c.documentId === syllabusDoc.id);
    const notesChunks = chunks.filter((c) => c.documentId !== syllabusDoc.id);

    const syllabusText = syllabusChunks.map((c) => c.content).join('\n\n');

    const extractedTopics = await extractTopicsFromSyllabus({
      syllabusText,
      documentId: syllabusDoc.id,
      documentTitle: syllabusDoc.title,
      notesChunks,
    });

    const userTopics = extractedTopics.map((t) => ({
      ...t,
      userId: user.id,
    }));

    dbStore.setTopics(userTopics, user.id);

    return NextResponse.json({
      success: true,
      topicsCount: userTopics.length,
      topics: userTopics,
      message: `Extracted ${userTopics.length} topics from "${syllabusDoc.title}".`,
    });
  } catch (err) {
    console.error('Topic extraction error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

