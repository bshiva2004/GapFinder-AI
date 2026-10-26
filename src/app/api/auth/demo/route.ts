import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST() {
  const user = dbStore.setDemoJudgeUser();
  return NextResponse.json({
    success: true,
    message: 'Authenticated as Hackathon Judge demo user.',
    user,
  });
}

export async function GET() {
  const user = dbStore.getActiveUser();
  return NextResponse.json({ user });
}

