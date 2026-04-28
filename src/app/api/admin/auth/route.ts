import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
