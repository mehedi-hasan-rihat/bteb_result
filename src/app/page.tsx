'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ResultSkeleton from '@/components/ResultSkeleton';

interface Result {
  roll: string;
  institute_code: string;
  institute_name: string;
  status: 'passed' | 'referred' | 'failed';
  gpas: Record<string, number | null>;
  ref_subjects: string[];
  semester: number;
  subjectMap: Record<string, string>;
  subjectSemMap: Record<string, number>;
}

const SEM_ORD: Record<number, string> = { 1: '1ST', 2: '2ND', 3: '3RD', 4: '4TH', 5: '5TH', 6: '6TH', 7: '7TH', 8: '8TH' };

const MARQUEE_ITEMS = ['BTEB RESULT', 'CHECK NOW', 'POLYTECHNIC', 'DIPLOMA', 'RESULT 2024', 'SEARCH BY ROLL'];

export default function Home() {
  const [roll, setRoll] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = async (r: string) => {
    if (!r.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/search?roll=${r.trim()}`);
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('roll') ?? '';
    if (r) { setRoll(r); doSearch(r); }
  }, []);

  const search = () => {
    if (!roll.trim()) return;
    const url = new URL(window.location.href);
    url.searchParams.set('roll', roll.trim());
    window.history.replaceState(null, '', url.toString());
    doSearch(roll.trim());
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('roll', result?.roll ?? roll.trim());
    const shareUrl = url.toString();
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareUrl);
      else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('Copy link:', shareUrl); }
  };

  const statusColor = result?.status === 'passed' ? '#e8ff00'
    : result?.status === 'referred' ? '#ff9500' : '#ff3b30';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] flex flex-col overflow-x-hidden">

      {/* ── TOP MARQUEE ── */}
      <div className="border-b border-white/10 py-2 overflow-hidden bg-[#0a0a0a]">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 px-6 shrink-0">
              {item} <span className="text-[#e8ff00]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="px-5 pt-10 pb-8 border-b border-white/10">
        <div className="max-w-lg mx-auto">

          {/* eyebrow */}
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3 fade-up fade-up-1">
            Bangladesh Technical Education Board
          </p>

          {/* viewport-scaled headline */}
          <h1 className="font-black uppercase leading-[0.88] mb-6 fade-up fade-up-2"
            style={{ fontSize: 'clamp(3.2rem, 14vw, 6rem)', letterSpacing: '-0.02em' }}>
            RESULT<br />
            <span style={{ color: '#e8ff00', WebkitTextStroke: '0px' }}>FINDER</span>
          </h1>

          {/* search input */}
          <div
            className="fade-up fade-up-3"
            style={{
              border: `2px solid ${focused ? '#e8ff00' : 'rgba(255,255,255,0.15)'}`,
              transition: 'border-color 0.2s',
              borderRadius: 0,
            }}
          >
            <div className="flex items-center">
              <span className="pl-4 text-white/30 font-mono text-sm shrink-0 select-none">#</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={roll}
                onChange={e => setRoll(e.target.value.replace(/\D/g, '').slice(0, 7))}
                onKeyDown={e => e.key === 'Enter' && search()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="ROLL NUMBER"
                className="flex-1 bg-transparent px-3 py-4 text-base font-bold uppercase tracking-widest placeholder:text-white/20 focus:outline-none"
              />
              {roll && (
                <button
                  onClick={() => { setRoll(''); setResult(null); setError(''); inputRef.current?.focus(); }}
                  className="px-3 text-white/30 hover:text-white transition-colors text-lg"
                >×</button>
              )}
              <button
                onClick={search}
                disabled={loading || !roll.trim()}
                className="px-5 py-4 font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                style={{ background: '#e8ff00', color: '#0a0a0a', borderLeft: '2px solid rgba(255,255,255,0.15)' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                ) : 'GO'}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-white/25 mt-2 uppercase tracking-widest fade-up fade-up-4">
            Enter your 6-digit polytechnic roll number
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">

        {/* error */}
        {error && (
          <div className="border border-[#ff3b30]/40 bg-[#ff3b30]/10 px-4 py-3 mb-5 fade-up fade-up-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff3b30]">Error</p>
            <p className="text-sm text-white/70 mt-0.5">{error}</p>
          </div>
        )}

        {loading && <ResultSkeleton />}

        {!loading && result && (
          <div className="flex flex-col gap-px fade-up fade-up-1">

            {/* ── STATUS BLOCK ── */}
            <div className="px-5 py-6" style={{ background: statusColor }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 mb-1">Roll No.</p>
                  <p className="font-black font-mono leading-none" style={{ fontSize: 'clamp(2rem,10vw,3.5rem)', color: '#0a0a0a' }}>
                    {result.roll}
                  </p>
                </div>
                <button
                  onClick={share}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-2 transition-all active:scale-95"
                  style={{ background: 'rgba(0,0,0,0.15)', color: '#0a0a0a' }}
                >
                  {copied ? '✓ COPIED' : '⎘ SHARE'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5"
                  style={{ background: '#0a0a0a', color: statusColor }}>
                  {result.status}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                  {SEM_ORD[result.semester]} SEM
                </span>
              </div>
            </div>

            {/* ── INSTITUTE ── */}
            <div className="bg-white/5 px-5 py-4 border-l-2" style={{ borderColor: '#e8ff00' }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">Institute</p>
              <p className="text-sm font-bold uppercase leading-snug">{result.institute_name}</p>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">CODE: {result.institute_code}</p>
            </div>

            {/* ── GPA ── */}
            {Object.keys(result.gpas).length > 0 && (
              <div className="bg-white/5 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-3">GPA</p>
                <div className="grid grid-cols-4 gap-px bg-white/5">
                  {Object.entries(result.gpas)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([key, val]) => {
                      const n = parseInt(key.replace('gpa', ''));
                      const isRef = val === null;
                      return (
                        <div key={key} className="bg-[#0a0a0a] px-2 py-3 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">{SEM_ORD[n]}</p>
                          <p className={`font-black font-mono text-base ${isRef ? 'text-[#ff9500]' : 'text-[#e8ff00]'}`}>
                            {isRef ? 'REF' : val!.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ── REFERRED SUBJECTS ── */}
            {result.ref_subjects.length > 0 && (
              <div className="bg-white/5 px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">Referred Subjects</p>
                  <span className="text-[9px] font-black px-2 py-0.5 uppercase tracking-widest"
                    style={{ background: '#ff9500', color: '#0a0a0a' }}>
                    {result.ref_subjects.length}
                  </span>
                </div>
                <div className="flex flex-col gap-px">
                  {result.ref_subjects.map((sub, i) => {
                    const code = sub.match(/^(\d+)/)?.[1] ?? '';
                    const suffix = sub.replace(/^\d+/, '');
                    const name = result.subjectMap[code];
                    const subSem = result.subjectSemMap[code];
                    return (
                      <div key={i} className="flex items-center justify-between bg-[#0a0a0a] px-3 py-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase leading-snug truncate">
                            {name ?? `Subject ${code}`}
                          </p>
                          <p className="text-[10px] font-mono text-white/30 mt-0.5">{code}{suffix}</p>
                        </div>
                        {subSem > 0 && (
                          <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                            {SEM_ORD[subSem]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* empty state */}
        {!loading && !result && !error && (
          <div className="py-16 text-center fade-up fade-up-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
              — AWAITING INPUT —
            </p>
          </div>
        )}

      </main>

      {/* ── BOTTOM MARQUEE ── */}
      <div className="border-t border-white/10 py-2 overflow-hidden">
        <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '22s' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/15 px-6 shrink-0">
              {item} <span className="text-white/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/10 px-5 py-3 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">BTEB © 2024</span>
        <Link href="/admin" className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white/50 transition-colors">
          Admin ↗
        </Link>
      </footer>
    </div>
  );
}
