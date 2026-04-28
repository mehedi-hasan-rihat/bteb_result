'use client';
import { useState, useEffect, useRef } from 'react';
import { Nav, Marquee, Footer } from '@/components/Layout';
import { ResultCard } from '@/components/ResultCard';
import ResultSkeleton from '@/components/ResultSkeleton';
import { Student } from '@/components/shared';

export default function Home() {
  const [roll, setRoll]       = useState('');
  const [result, setResult]   = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = async (r: string) => {
    if (!r.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res  = await fetch(`/api/search?roll=${r.trim()}`);
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch { setError('Connection failed. Try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('roll') ?? '';
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
        ta.value = shareUrl; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('Copy link:', shareUrl); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] flex flex-col overflow-x-hidden">
      <Marquee />
      <Nav />

      {/* hero */}
      <section className="px-5 pt-10 pb-8 border-b border-white/10">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3 fade-up fade-up-1">
            Bangladesh Technical Education Board
          </p>
          <h1 className="font-black uppercase leading-[0.88] mb-6 fade-up fade-up-2"
            style={{ fontSize:'clamp(3.2rem,14vw,6rem)', letterSpacing:'-0.02em' }}>
            RESULT<br />
            <span style={{ color:'#e8ff00' }}>FINDER</span>
          </h1>

          {/* input */}
          <div className="fade-up fade-up-3"
            style={{ border:`2px solid ${focused ? '#e8ff00' : 'rgba(255,255,255,0.15)'}`, transition:'border-color 0.2s' }}>
            <div className="flex items-center">
              <span className="pl-4 text-white/30 font-mono text-sm shrink-0 select-none">#</span>
              <input
                ref={inputRef}
                type="text" inputMode="numeric"
                value={roll}
                onChange={e => setRoll(e.target.value.replace(/\D/g,'').slice(0,7))}
                onKeyDown={e => e.key === 'Enter' && search()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="ROLL NUMBER"
                className="flex-1 bg-transparent px-3 py-4 text-base font-bold uppercase tracking-widest placeholder:text-white/20 focus:outline-none"
              />
              {roll && (
                <button onClick={() => { setRoll(''); setResult(null); setError(''); inputRef.current?.focus(); }}
                  className="px-3 text-white/30 hover:text-white transition-colors text-lg">×</button>
              )}
              <button onClick={search} disabled={loading || !roll.trim()}
                className="px-5 py-4 font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                style={{ background:'#e8ff00', color:'#0a0a0a', borderLeft:'2px solid rgba(255,255,255,0.15)' }}>
                {loading
                  ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                  : 'GO'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/25 mt-2 uppercase tracking-widest fade-up fade-up-4">
            Enter your 6-digit polytechnic roll number
          </p>
        </div>
      </section>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {error && (
          <div className="border border-[#ff3b30]/40 bg-[#ff3b30]/10 px-4 py-3 mb-5 fade-up fade-up-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff3b30]">Error</p>
            <p className="text-sm text-white/70 mt-0.5">{error}</p>
          </div>
        )}

        {loading && <ResultSkeleton />}

        {!loading && result && <ResultCard student={result} onShare={share} copied={copied} />}

        {!loading && !result && !error && (
          <div className="py-16 text-center fade-up fade-up-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">— AWAITING INPUT —</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
