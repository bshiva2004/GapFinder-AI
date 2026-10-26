/**
 * Evaluates student quiz submissions, generates tailored explanations for
 * correct/incorrect answers, and provides supporting citations.
 */
export function evaluateQuizSubmission({
  quizQuestions = [],
  answers = {}, // { [questionId]: selectedOptionIndex }
}) {
  let correctCount = 0;
  const totalQuestions = quizQuestions.length;

  const evaluatedAnswers = quizQuestions.map((q) => {
    const selectedIdx = answers[q.id] !== undefined ? Number(answers[q.id]) : -1;
    const isCorrect = selectedIdx === q.correctOptionIndex;

    if (isCorrect) {
      correctCount++;
    }

    const correctOptionText = q.options[q.correctOptionIndex];
    const selectedOptionText =
      selectedIdx >= 0 && selectedIdx < q.options.length
        ? q.options[selectedIdx]
        : 'No answer selected';

    let incorrectExplanation = '';
    if (!isCorrect) {
      incorrectExplanation = `You selected "${selectedOptionText}". This is incorrect because the source material specifies that "${correctOptionText}" is the correct fact. ${q.explanation}`;
    }

    return {
      questionId: q.id,
      selectedOptionIndex: selectedIdx,
      isCorrect,
      questionText: q.question,
      topic: q.topic,
      correctOptionIndex: q.correctOptionIndex,
      options: q.options,
      explanation: q.explanation,
      incorrectExplanation: isCorrect ? null : incorrectExplanation,
      sourceDocTitle: q.sourceDocTitle,
      sourcePageOrSection: q.sourcePageOrSection,
      sourcePassageExcerpt: q.sourcePassageExcerpt,
    };
  });

  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctAnswersCount: correctCount,
    scorePercentage,
    submittedAnswers: evaluatedAnswers,
    completedAt: new Date().toISOString(),
  };
}
