import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const user = dbStore.getActiveUser();
  const plan = dbStore.getRevisionPlan(user.id);
  return NextResponse.json({ plan: plan || null });
}

export async function PATCH(req) {
  try {
    const user = dbStore.getActiveUser();
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required.' }, { status: 400 });
    }

    const task = dbStore.toggleTaskCompletion(user.id, taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found in active plan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
