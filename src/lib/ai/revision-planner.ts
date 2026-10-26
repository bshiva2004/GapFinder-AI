import { GapReport, RevisionPlan, RevisionTask } from '../types';

/**
 * Personalized Revision Planner.
 * Intelligently distributes daily available study time according to topic weaknesses:
 * - Weak topics: 55% of time allocation
 * - Medium topics: 30% of time allocation
 * - Strong topics / Insufficient data: 15% quick refresh
 *
 * Ensures total planned time strictly <= available daily time.
 */
export function generateRevisionPlan({
  gapReport,
  dailyAvailableMinutes = 60,
  examDate = null,
}: {
  gapReport: GapReport;
  dailyAvailableMinutes?: number;
  examDate?: string | null;
}): RevisionPlan {
  const dailyTime = Math.max(30, Math.min(600, Number(dailyAvailableMinutes) || 60));
  const topics = gapReport?.topicReports || [];

  if (topics.length === 0) {
    return {
      dailyAvailableMinutes: dailyTime,
      examDate,
      totalPlannedMinutes: 0,
      tasks: [],
      createdAt: new Date().toISOString(),
    };
  }

  const weakTopics = topics.filter((t) => t.classification === 'weak');
  const mediumTopics = topics.filter((t) => t.classification === 'medium');
  const strongTopics = topics.filter((t) => t.classification === 'strong');
  const insufficientDataTopics = topics.filter((t) => t.classification === 'insufficient_data');

  const tasks: RevisionTask[] = [];
  let remainingTime = dailyTime;

  // 1. Weak topics get top priority
  if (weakTopics.length > 0) {
    const weakBudget = Math.floor(dailyTime * 0.55);
    const timePerWeak = Math.max(15, Math.floor(weakBudget / weakTopics.length));

    for (const wt of weakTopics) {
      if (remainingTime < 15) break;
      const duration = Math.min(timePerWeak, remainingTime);
      remainingTime -= duration;

      tasks.push({
        id: `task-weak-${Date.now()}-${tasks.length}`,
        topic: wt.topic,
        classification: 'weak',
        durationMinutes: duration,
        taskType: 'deep_dive',
        description: `Deep concept review on ${wt.topic}. Re-read foundational definitions, time complexities, and work through edge cases.`,
        citedPassages: wt.relevantPassages || [],
        isCompleted: false,
      });

      // If time permits, add a quick practice quiz task
      if (remainingTime >= 10) {
        remainingTime -= 10;
        tasks.push({
          id: `task-quiz-${Date.now()}-${tasks.length}`,
          topic: wt.topic,
          classification: 'weak',
          durationMinutes: 10,
          taskType: 'practice_quiz',
          description: `Attempt a targeted 5-question practice quiz on ${wt.topic} to verify gap closure.`,
          citedPassages: wt.relevantPassages || [],
          isCompleted: false,
        });
      }
    }
  }

  // 2. Medium topics get secondary allocation
  if (mediumTopics.length > 0 && remainingTime >= 15) {
    const mediumBudget = Math.min(remainingTime, Math.floor(dailyTime * 0.3));
    const timePerMedium = Math.max(12, Math.floor(mediumBudget / mediumTopics.length));

    for (const mt of mediumTopics) {
      if (remainingTime < 12) break;
      const duration = Math.min(timePerMedium, remainingTime);
      remainingTime -= duration;

      tasks.push({
        id: `task-med-${Date.now()}-${tasks.length}`,
        topic: mt.topic,
        classification: 'medium',
        durationMinutes: duration,
        taskType: 'concept_review',
        description: `Review intermediate principles in ${mt.topic}. Clarify borderline questions where accuracy was below 80%.`,
        citedPassages: mt.relevantPassages || [],
        isCompleted: false,
      });
    }
  }

  // 3. Insufficient data topics need verification
  if (insufficientDataTopics.length > 0 && remainingTime >= 10) {
    for (const idt of insufficientDataTopics) {
      if (remainingTime < 10) break;
      const duration = Math.min(10, remainingTime);
      remainingTime -= duration;

      tasks.push({
        id: `task-insuf-${Date.now()}-${tasks.length}`,
        topic: idt.topic,
        classification: 'insufficient_data',
        durationMinutes: duration,
        taskType: 'practice_quiz',
        description: `Take a focused diagnostic quiz on ${idt.topic} to gather sufficient evidence for accurate gap detection.`,
        citedPassages: idt.relevantPassages || [],
        isCompleted: false,
      });
    }
  }

  // 4. Strong topics get quick refreshers
  if (strongTopics.length > 0 && remainingTime >= 10) {
    for (const st of strongTopics) {
      if (remainingTime < 10) break;
      const duration = Math.min(10, remainingTime);
      remainingTime -= duration;

      tasks.push({
        id: `task-strong-${Date.now()}-${tasks.length}`,
        topic: st.topic,
        classification: 'strong',
        durationMinutes: duration,
        taskType: 'quick_refresh',
        description: `Quick active recall and formula skim for ${st.topic} to maintain top retention.`,
        citedPassages: st.relevantPassages || [],
        isCompleted: false,
      });
    }
  }

  // If there's still leftover time, distribute to first weak or medium task
  if (remainingTime > 0 && tasks.length > 0) {
    tasks[0].durationMinutes += remainingTime;
    remainingTime = 0;
  }

  const totalPlannedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  return {
    dailyAvailableMinutes: dailyTime,
    examDate,
    totalPlannedMinutes,
    tasks,
    createdAt: new Date().toISOString(),
  };
}
