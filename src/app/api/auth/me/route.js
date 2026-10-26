import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const user = dbStore.getActiveUser();
  return NextResponse.json({ user });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, fullName, role } = body;
    const user = {
      id: `usr-${Date.now()}`,
      email: email || 'student@sphoorthy.edu',
      fullName: fullName || 'Engineering Student',
      institution: 'Sphoorthy Engineering College',
      role: role || 'student',
      isDemoUser: false,
    };
    dbStore.setActiveUser(user);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
