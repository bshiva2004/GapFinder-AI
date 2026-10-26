import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { generateDiagnosticQuiz } from '@/lib/ai/quiz-generator';

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // empty body is fine
    }

    const { topic = 'All Topics', count = 5 } = body;
    const chunks = dbStore.getChunks(user.id);

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          error:
            'No course materials found. Please upload your study notes or textbooks in "My Materials" before generating a diagnostic quiz.',
        },
        { status: 400 }
      );
    }

    const quiz = await generateDiagnosticQuiz({
      chunks,
      topic,
      questionCount: Math.max(5, count),
    });

    const fullQuiz = {
      ...quiz,
      userId: user.id,
      documentIds: [...new Set(chunks.map((c) => c.documentId))],
    };

    // Store full quiz with answers in dbStore
    dbStore.addQuiz(fullQuiz);

    // Client-safe questions without revealing answers or explanations
    const clientSafeQuestions = fullQuiz.questions.map((q) => ({
      id: q.id,
      quizId: q.quizId,
      topic: q.topic,
      question: q.question,
      options: q.options,
      sourceDocTitle: q.sourceDocTitle,
      sourcePageOrSection: q.sourcePageOrSection,
      // correctOptionIndex and explanation are hidden until submission
    }));

    return NextResponse.json({
      success: true,
      quizId: fullQuiz.quizId,
      title: fullQuiz.title,
      topic: fullQuiz.topic,
      totalQuestions: clientSafeQuestions.length,
      questions: clientSafeQuestions,
    });
  } catch (err) {
    console.error('Quiz generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate diagnostic quiz.' },
      { status: 422 }
    );
  }
}

