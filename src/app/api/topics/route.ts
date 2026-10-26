import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const user = dbStore.getActiveUser();
  const topics = dbStore.getTopics(user.id);
  return NextResponse.json({ topics });
}

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    const body = await req.json();
    const { name, unit, subtopics, sourcePassageExcerpt, sourceDocTitle } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Topic name is required.' }, { status: 400 });
    }

    const newTopic = {
      id: `top-custom-${Date.now()}`,
      userId: user.id,
      name: name.trim(),
      unit: unit ? unit.trim() : 'Custom Topic',
      subtopics: Array.isArray(subtopics) ? subtopics : [],
      sourcePassageExcerpt: sourcePassageExcerpt || 'User-defined syllabus topic entry.',
      sourceDocTitle: sourceDocTitle || 'Manual Entry',
      sourcePage: 1,
      createdAt: new Date().toISOString(),
    };

    dbStore.addTopic(newTopic);
    return NextResponse.json({ success: true, topic: newTopic });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Topic ID is required.' }, { status: 400 });
    }
    dbStore.deleteTopic(id);
    return NextResponse.json({ success: true, message: 'Topic removed.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

