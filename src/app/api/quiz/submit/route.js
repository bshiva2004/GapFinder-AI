import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { evaluateQuizSubmission } from '@/lib/ai/evaluator';

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    const body = await req.json();
    const { quizId, answers } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required.' }, { status: 400 });
    }

    const quiz = dbStore.getQuizById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz session not found or expired. Please generate a new quiz.' },
        { status: 404 }
      );
    }

    const evaluation = evaluateQuizSubmission({
      quizQuestions: quiz.questions,
      answers: answers || {},
    });

    const attempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.quizId,
      userId: user.id,
      quizTitle: quiz.title,
      totalQuestions: evaluation.totalQuestions,
      correctAnswersCount: evaluation.correctAnswersCount,
      scorePercentage: evaluation.scorePercentage,
      submittedAnswers: evaluation.submittedAnswers,
      completedAt: evaluation.completedAt,
    };

    // Save attempt to user history
    dbStore.addQuizAttempt(attempt);

    return NextResponse.json({
      success: true,
      attempt,
      message: `Quiz completed: ${attempt.correctAnswersCount}/${attempt.totalQuestions} correct (${attempt.scorePercentage}%).`,
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
