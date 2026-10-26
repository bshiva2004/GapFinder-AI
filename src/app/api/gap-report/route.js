import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { computeGapReport } from '@/lib/ai/gap-analyzer';

export async function GET() {
  const user = dbStore.getActiveUser();
  const attempts = dbStore.getQuizAttempts(user.id);
  const report = computeGapReport(attempts);

  return NextResponse.json({
    success: true,
    report,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
}
