import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'src', 'data');

function getSubjectMap(): Record<string, string> {
  const path = join(dataDir, 'subject_list.json');
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, 'utf-8'));
  const map: Record<string, string> = {};
  for (const sem of Object.values(raw) as { subjects: { code: string; name: string }[] }[])
    for (const s of sem.subjects) map[s.code] = s.name;
  return map;
}

export async function GET(request: NextRequest) {
  const roll = request.nextUrl.searchParams.get('roll');
  const sem = parseInt(request.nextUrl.searchParams.get('semester') || '');

  if (!roll) return NextResponse.json({ error: 'Roll number required' }, { status: 400 });
  if (!sem || sem < 1 || sem > 8) return NextResponse.json({ error: 'Semester required (1-8)' }, { status: 400 });

  const filePath = join(dataDir, `semester_${sem}.json`);
  if (!existsSync(filePath)) return NextResponse.json({ error: 'No data for this semester' }, { status: 404 });

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const result = data.find((s: { roll: string }) => s.roll === roll.trim());
    if (!result) return NextResponse.json({ error: 'Result not found for this roll number' }, { status: 404 });
    return NextResponse.json({ ...result, semester: sem, subjectMap: getSubjectMap() });
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
