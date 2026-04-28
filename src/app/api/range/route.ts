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
    const n = semOrder[key] ?? 0;
    for (const s of val.subjects) { nameMap[s.code] = s.name; semMap[s.code] = n; }
  }
  return { nameMap, semMap };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from')?.trim() ?? '';
  const to   = searchParams.get('to')?.trim() ?? '';
  const semParam = searchParams.get('semester');

  if (!from || !to) return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  if (from > to)    return NextResponse.json({ error: 'from must be ≤ to' },    { status: 400 });

  const semesters = semParam ? [parseInt(semParam)] : [1,2,3,4,5,6,7,8];
  const { nameMap, semMap } = getSubjectMaps();
  const results: object[] = [];

  for (const sem of semesters) {
    const fp = join(dataDir, `semester_${sem}.json`);
    if (!existsSync(fp)) continue;
    try {
      const data: { roll: string }[] = JSON.parse(readFileSync(fp, 'utf-8'));
      for (const s of data)
        if (s.roll >= from && s.roll <= to)
          results.push({ ...s, semester: sem, subjectMap: nameMap, subjectSemMap: semMap });
    } catch { continue; }
  }

  results.sort((a, b) => (a as { roll: string }).roll.localeCompare((b as { roll: string }).roll));
  return NextResponse.json({ results, total: results.length });
}
