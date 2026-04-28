import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PDFParse } from 'pdf-parse';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

interface Student {
  roll: string;
  institute_code: string;
  institute_name: string;
  status: 'passed' | 'referred' | 'failed';
  gpas: Record<string, number | null>;
  ref_subjects: string[];
}

function parseGpas(raw: string): Record<string, number | null> {
  const gpas: Record<string, number | null> = {};
  const re = /(gpa\d+)\s*:\s*(ref|[\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null)
    gpas[m[1]] = m[2] === 'ref' ? null : parseFloat(m[2]);
  return gpas;
}

function parseResults(text: string): Student[] {
  const students: Student[] = [];
  const instRe = /(\d{5})\s*-\s*([^\n\r]{5,80})/g;
  const institutes: { code: string; name: string; pos: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = instRe.exec(text)) !== null)
    institutes.push({ code: m[1], name: m[2].trim(), pos: m.index });

  for (let i = 0; i < institutes.length; i++) {
    const inst = institutes[i];
    const start = inst.pos + inst.name.length;
    const end = i + 1 < institutes.length ? institutes[i + 1].pos : text.length;
    const block = text.slice(start, end);
    const collapsed = block
      .replace(/\(([^)]*?)\)/gs, (_, inner) => '(' + inner.replace(/\s+/g, ' ') + ')')
      .replace(/\{([^}]*?)\}/gs, (_, inner) => '{' + inner.replace(/\s+/g, ' ') + '}');

    const passedRe = /(\d{6})\s*\(([^)]*gpa1[^)]*?)\)/g;
    let pm: RegExpExecArray | null;
    while ((pm = passedRe.exec(collapsed)) !== null)
      students.push({ roll: pm[1], institute_code: inst.code, institute_name: inst.name, status: 'passed', gpas: parseGpas(pm[2]), ref_subjects: [] });

    const bracketRe = /(\d{6})\s*\{([^}]*?)\}/g;
    let bm: RegExpExecArray | null;
    while ((bm = bracketRe.exec(collapsed)) !== null) {
      const content = bm[2];
      const subs = content.match(/\d+\([^)]+\)/g) || [];
      const hasRef = content.includes('ref_sub');
      students.push({ roll: bm[1], institute_code: inst.code, institute_name: inst.name, status: hasRef ? 'referred' : 'failed', gpas: parseGpas(content), ref_subjects: subs });
    }
  }
  return students;
}

export async function POST(request: NextRequest) {
  try {
    const { password, uploadId, semester } = await request.json();
    if (password !== ADMIN_PASSWORD)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!semester || semester < 1 || semester > 8)
      return NextResponse.json({ error: 'Invalid semester (1-8)' }, { status: 400 });

    const tmpPath = join('/tmp', `${uploadId}.pdf`);
    if (!existsSync(tmpPath))
      return NextResponse.json({ error: 'Upload not found, please re-upload' }, { status: 404 });

    const uint8Array = new Uint8Array(readFileSync(tmpPath));
    const parser = new PDFParse(uint8Array);
    const textResult = await parser.getText();
    const fullText = textResult.pages.map(p => p.text).join('\n');

    const students = parseResults(fullText);

    const dataDir = join(process.cwd(), 'src', 'data');
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, `semester_${semester}.json`), JSON.stringify(students, null, 2));

    unlinkSync(tmpPath);

    return NextResponse.json({
      success: true,
      stats: {
        total: students.length,
        passed: students.filter(s => s.status === 'passed').length,
        referred: students.filter(s => s.status === 'referred').length,
        failed: students.filter(s => s.status === 'failed').length,
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[process] error:', message);
    return NextResponse.json({ error: 'Failed to process PDF', detail: message }, { status: 500 });
  }
}
