import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const user = dbStore.getActiveUser();
  const attempts = dbStore.getQuizAttempts(user.id);
  return NextResponse.json({
    attempts,
    totalAttempts: attempts.length,
  });
}
