import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const roll = request.nextUrl.searchParams.get('roll');
  if (!roll) return NextResponse.json({ error: 'Roll number required' }, { status: 400 });

  const dataPath = join(process.cwd(), 'data', 'results.json');
  if (!existsSync(dataPath)) return NextResponse.json({ error: 'No data available yet' }, { status: 404 });

  try {
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    const result = data.find((s: any) => s.roll === roll.trim());
    if (!result) return NextResponse.json({ error: 'Result not found for this roll number' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
