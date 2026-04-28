import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chunk = formData.get('chunk') as File;
  const index = parseInt(formData.get('index') as string);
  const total = parseInt(formData.get('total') as string);
  const uploadId = formData.get('uploadId') as string;

  if (!chunk || isNaN(index) || isNaN(total) || !uploadId)
    return NextResponse.json({ error: 'Invalid chunk data' }, { status: 400 });

  const tmpPath = join('/tmp', `${uploadId}.pdf`);
  const bytes = await chunk.arrayBuffer();
  const buf = Buffer.from(bytes);

  if (index === 0 && existsSync(tmpPath)) unlinkSync(tmpPath);
  if (index === 0) writeFileSync(tmpPath, buf);
  else appendFileSync(tmpPath, buf);

  return NextResponse.json({ received: index + 1, total });
}
