'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MARQUEE_ITEMS } from './shared';

const NAV = [
  { href: '/',        label: 'SEARCH' },
  { href: '/results', label: 'RANGE'  },
];

export function Marquee({ reverse }: { reverse?: boolean }) {
  return (
    <div className="border-b border-white/10 py-2 overflow-hidden bg-[#0a0a0a]">
      <div className="marquee-track" style={reverse ? { animationDirection:'reverse', animationDuration:'22s' } : {}}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 px-6 shrink-0">
            {item} <span className={reverse ? 'text-white/30' : 'text-[#e8ff00]'}>{reverse ? '◆' : '✦'}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0a0a0a] sticky top-0 z-20">
      <Link href="/" className="font-black text-sm uppercase tracking-[0.15em]">
        MYBTEB <span style={{ color:'#e8ff00' }}>✦</span>
      </Link>

      {/* desktop */}
      <div className="hidden sm:flex items-center gap-1">
        {NAV.map(n => (
          <Link key={n.href} href={n.href}
            className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 transition-all"
            style={{
              background: path === n.href ? '#e8ff00' : 'transparent',
              color:      path === n.href ? '#0a0a0a' : 'rgba(255,255,255,0.35)',
            }}>
            {n.label}
          </Link>
        ))}
        <Link href="/admin"
          className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 text-white/20 hover:text-white/50 transition-colors ml-2">
          ADMIN ↗
        </Link>
      </div>

      {/* mobile hamburger */}
      <button className="sm:hidden flex flex-col gap-1 p-1" onClick={() => setOpen(o => !o)}>
        <span className="block w-5 h-0.5 bg-white/60" style={{ transform: open ? 'rotate(45deg) translate(3px,3px)' : '', transition:'transform 0.2s' }} />
        <span className="block w-5 h-0.5 bg-white/60" style={{ opacity: open ? 0 : 1, transition:'opacity 0.2s' }} />
        <span className="block w-5 h-0.5 bg-white/60" style={{ transform: open ? 'rotate(-45deg) translate(3px,-3px)' : '', transition:'transform 0.2s' }} />
      </button>

      {/* mobile menu */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#0f0f0f] border-b border-white/10 flex flex-col z-30">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="px-5 py-4 text-sm font-black uppercase tracking-widest border-b border-white/5 transition-colors"
              style={{ color: path === n.href ? '#e8ff00' : 'rgba(255,255,255,0.5)' }}>
              {n.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)}
            className="px-5 py-4 text-sm font-black uppercase tracking-widest text-white/25">
            ADMIN ↗
          </Link>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <>
      <Marquee reverse />
      <footer className="border-t border-white/10 px-5 py-3 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">MYBTEB © 2025</span>
        <Link href="/admin" className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white/50 transition-colors">
          Admin ↗
        </Link>
      </footer>
    </>
  );
}
