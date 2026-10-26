import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { computeGapReport } from '@/lib/ai/gap-analyzer';
import { generateRevisionPlan } from '@/lib/ai/revision-planner';

export async function POST(req) {
  try {
    const user = dbStore.getActiveUser();
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // defaults
    }

    const { dailyAvailableMinutes = 60, examDate = null } = body;

    const attempts = dbStore.getQuizAttempts(user.id);
    const gapReport = computeGapReport(attempts);

    const plan = generateRevisionPlan({
      gapReport,
      dailyAvailableMinutes,
      examDate,
    });

    const fullPlan = {
      id: `plan-${Date.now()}`,
      userId: user.id,
      ...plan,
      updatedAt: new Date().toISOString(),
    };

    dbStore.saveRevisionPlan(fullPlan);

    return NextResponse.json({
      success: true,
      plan: fullPlan,
      message: `Generated revision plan for ${fullPlan.totalPlannedMinutes} minutes across ${fullPlan.tasks.length} targeted tasks.`,
    });
  } catch (err) {
    console.error('Revision plan generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

