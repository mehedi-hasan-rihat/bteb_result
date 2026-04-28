'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Result {
  roll: string;
  institute_code: string;
  institute_name: string;
  status: 'passed' | 'referred' | 'failed';
  gpas: Record<string, number | null>;
  ref_subjects: string[];
  semester: number;
  subjectMap: Record<string, string>;
}

export default function Home() {
  const [roll, setRoll] = useState('');
  const [semester, setSemester] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!roll.trim() || !semester) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/search?roll=${roll.trim()}&semester=${semester}`);
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const semesterLabel = (key: string) => {
    const n = key.replace('gpa', '');
    const map: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th', '5': '5th', '6': '6th', '7': '7th', '8': '8th' };
    return `Sem ${map[n] ?? n}`;
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight mb-1">BTEB Result</h1>
          <p className="text-sm text-neutral-500 mb-6">Select your semester and enter your roll number</p>

          <div className="mb-4">
            <p className="text-xs text-neutral-400 mb-2">Semester</p>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7,8].map(n => (
                <button
                  key={n}
                  onClick={() => { setSemester(n); setResult(null); setError(''); }}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    semester === n ? 'bg-black text-white border-black' : 'border-neutral-300 hover:border-black'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={roll}
              onChange={e => setRoll(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Roll number"
              className="flex-1 px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={search}
              disabled={loading || !roll.trim() || !semester}
              className="px-5 py-2 bg-black text-white text-sm font-medium disabled:opacity-40 hover:bg-neutral-800 transition-colors"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {error && (
            <p className="text-sm text-neutral-500 border border-neutral-200 px-3 py-2 mb-4">{error}</p>
          )}

          {result && (
            <div className="border border-neutral-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                <span className="font-mono font-bold text-lg">{result.roll}</span>
                <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 ${
                  result.status === 'passed' ? 'bg-black text-white' :
                  result.status === 'referred' ? 'bg-neutral-200 text-black' :
                  'border border-black text-black'
                }`}>
                  {result.status}
                </span>
              </div>

              <div className="px-4 py-3 border-b border-neutral-200">
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Institute</p>
                <p className="text-sm">{result.institute_code} — {result.institute_name}</p>
              </div>

              <div className="px-4 py-3 border-b border-neutral-200">
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Semester</p>
                <p className="text-sm">{result.semester}</p>
              </div>

              {Object.keys(result.gpas).length > 0 && (
                <div className="px-4 py-3 border-b border-neutral-200">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">GPA</p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(result.gpas)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs text-neutral-400">{semesterLabel(key)}</p>
                          <p className="font-mono font-semibold text-sm">{val != null ? val.toFixed(2) : 'REF'}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {result.ref_subjects.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">Referred Subjects</p>
                  <div className="flex flex-col gap-1.5">
                    {result.ref_subjects.map((sub, i) => {
                      const code = sub.match(/^(\d+)/)?.[1] ?? '';
                      const suffix = sub.replace(/^\d+/, '');
                      const name = result.subjectMap[code];
                      return (
                        <span key={i} className="text-xs border border-neutral-300 px-2 py-1 font-mono">
                          {name ? `${code}${suffix} — ${name}` : sub}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4">
        <Link href="/admin" className="text-xs text-neutral-300 hover:text-neutral-500 transition-colors">Admin</Link>
      </footer>
    </div>
  );
}
