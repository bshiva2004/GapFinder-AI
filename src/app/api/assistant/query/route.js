import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { answerQuestionFromMaterials } from '@/lib/ai/assistant';

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    const body = await req.json();
    const { question, history = [] } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
    }

    const chunks = dbStore.getChunks(user.id);

    const result = await answerQuestionFromMaterials({
      question: question.trim(),
      chunks,
      conversationHistory: history,
    });

    return NextResponse.json({
      success: true,
      answer: result.content,
      citations: result.citations || [],
      isUnsupportedBySources: result.isUnsupportedBySources || false,
    });
  } catch (err) {
    console.error('Assistant QA error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
