import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'src', 'data');

function getSubjectMaps(): { nameMap: Record<string, string>; semMap: Record<string, number> } {
  const path = join(dataDir, 'subject_list.json');
  if (!existsSync(path)) return { nameMap: {}, semMap: {} };
  const raw = JSON.parse(readFileSync(path, 'utf-8'));
  const nameMap: Record<string, string> = {};
  const semMap: Record<string, number> = {};
  const semOrder: Record<string, number> = {
    '1st_semester': 1, '2nd_semester': 2, '3rd_semester': 3, '4th_semester': 4,
    '5th_semester': 5, '6th_semester': 6, '7th_semester': 7, '8th_semester': 8,
  };
  for (const [key, val] of Object.entries(raw) as [string, { subjects: { code: string; name: string }[] }][]) {
    const semNum = semOrder[key] ?? 0;
    for (const s of val.subjects) {
      nameMap[s.code] = s.name;
      semMap[s.code] = semNum;
    }
  }
  return { nameMap, semMap };
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
    const { nameMap, semMap } = getSubjectMaps();
    return NextResponse.json({ ...result, semester: sem, subjectMap: nameMap, subjectSemMap: semMap });
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
