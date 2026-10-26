import { GapReport, QuizAttempt, TopicGapReportItem, TopicStrength } from '../types';

/**
 * Gap Analysis Engine.
 * Aggregates all user quiz attempts and computes topic-level proficiency,
 * weakness classification, and recommended pedagogical actions.
 */

export const GAP_THRESHOLDS = {
  WEAK_MAX: 49.99, // below 50%
  MEDIUM_MAX: 79.99, // 50% to 79%
  STRONG_MIN: 80.0, // 80% or above
  MIN_QUESTIONS_FOR_STRONG: 2, // Cannot classify as Strong with only 1 question
};

export function computeGapReport(quizAttempts: QuizAttempt[] = []): GapReport {
  if (!quizAttempts || quizAttempts.length === 0) {
    return {
      overallAccuracy: 0,
      totalQuestionsAttempted: 0,
      weakCount: 0,
      mediumCount: 0,
      strongCount: 0,
      insufficientDataCount: 0,
      topicReports: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Aggregate questions by topic
  const topicStats: Record<string, { topic: string; attempted: number; correct: number; passages: any[] }> = {};
  let totalAttempted = 0;
  let totalCorrect = 0;

  for (const attempt of quizAttempts) {
    if (!attempt.submittedAnswers) continue;

    for (const ans of attempt.submittedAnswers) {
      const topicName = ans.topic || 'General';
      if (!topicStats[topicName]) {
        topicStats[topicName] = {
          topic: topicName,
          attempted: 0,
          correct: 0,
          passages: [],
        };
      }

      topicStats[topicName].attempted += 1;
      totalAttempted += 1;

      if (ans.isCorrect) {
        topicStats[topicName].correct += 1;
        totalCorrect += 1;
      }

      // Collect supporting citations
      if (ans.sourceDocTitle && topicStats[topicName].passages.length < 3) {
        topicStats[topicName].passages.push({
          docTitle: ans.sourceDocTitle,
          pageOrSection: ans.sourcePageOrSection,
          excerpt: ans.sourcePassageExcerpt,
        });
      }
    }
  }

  let weakCount = 0;
  let mediumCount = 0;
  let strongCount = 0;
  let insufficientDataCount = 0;

  const topicReports: TopicGapReportItem[] = Object.values(topicStats).map((stat) => {
    const accuracy =
      stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;

    let classification: TopicStrength = 'insufficient_data';
    let classificationReason = '';
    let recommendedAction = '';

    // If only 1 question was attempted: cannot classify as Strong
    if (stat.attempted < GAP_THRESHOLDS.MIN_QUESTIONS_FOR_STRONG) {
      if (accuracy < 50) {
        classification = 'weak';
        weakCount++;
        classificationReason = `Answered ${stat.correct}/${stat.attempted} correctly (${accuracy}%). Immediate review needed.`;
        recommendedAction = 'Prioritize reviewing core definitions in your notes and re-attempt a focused quiz.';
      } else {
        classification = 'insufficient_data';
        insufficientDataCount++;
        classificationReason = `Attempted only 1 question (${stat.correct}/${stat.attempted}). Reliable strength classification requires at least 2 questions.`;
        recommendedAction = 'Take another diagnostic quiz on this topic to build statistically sound evaluation.';
      }
    } else {
      if (accuracy < 50) {
        classification = 'weak';
        weakCount++;
        classificationReason = `Topic accuracy is ${accuracy}% (${stat.correct}/${stat.attempted} questions correct). Below 50% threshold. Critical gap detected.`;
        recommendedAction = 'Dedicate focused 30-minute revision on fundamental concepts, formulas, and tricky edge cases.';
      } else if (accuracy < 80) {
        classification = 'medium';
        mediumCount++;
        classificationReason = `Topic accuracy is ${accuracy}% (${stat.correct}/${stat.attempted} questions correct). Between 50% and 79%. Moderate comprehension.`;
        recommendedAction = 'Review missed concepts and practice intermediate problem scenarios.';
      } else {
        classification = 'strong';
        strongCount++;
        classificationReason = `Topic accuracy is ${accuracy}% (${stat.correct}/${stat.attempted} questions correct). Exceeds 80% threshold across multiple questions.`;
        recommendedAction = 'Maintain mastery with brief 10-minute periodic refreshers.';
      }
    }

    return {
      topic: stat.topic,
      questionsAttempted: stat.attempted,
      questionsCorrect: stat.correct,
      accuracyPercentage: accuracy,
      classification,
      classificationReason,
      recommendedAction,
      relevantPassages: stat.passages,
    };
  });

  // Sort: weak first, then medium, then insufficient_data, then strong
  const orderMap: Record<TopicStrength, number> = { weak: 1, medium: 2, insufficient_data: 3, strong: 4 };
  topicReports.sort((a, b) => orderMap[a.classification] - orderMap[b.classification]);

  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return {
    overallAccuracy,
    totalQuestionsAttempted: totalAttempted,
    weakCount,
    mediumCount,
    strongCount,
    insufficientDataCount,
    topicReports,
    generatedAt: new Date().toISOString(),
  };
}
