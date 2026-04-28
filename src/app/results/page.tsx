'use client';
import { useState } from 'react';
import { Nav, Footer } from '@/components/Layout';
import { ResultCard } from '@/components/ResultCard';
import ResultSkeleton from '@/components/ResultSkeleton';
import { Student, STATUS_COLOR, SEM_ORD, resolveSubjects } from '@/components/shared';

function toCSV(students: Student[]): string {
  const rows = [['Roll','Institute','Semester','Status','GPA1','GPA2','GPA3','GPA4','GPA5','GPA6','GPA7','GPA8','Referred Subjects'].join(',')];
  for (const s of students) {
    const gpas = [1,2,3,4,5,6,7,8].map(n => {
      const v = s.gpas[`gpa${n}`];
      return v === undefined ? '' : v === null ? 'REF' : v.toFixed(2);
    });
    const subs = resolveSubjects(s).map(r => r.name ? `${r.code}${r.suffix} ${r.name}` : r.raw).join(' | ');
    rows.push([s.roll, `"${s.institute_name.replace(/"/g,'""')}"`, SEM_ORD[s.semester]??s.semester, s.status, ...gpas, `"${subs.replace(/"/g,'""')}"`].join(','));
  }
  return rows.join('\n');
}

async function downloadPDF(students: Student[], from: string, to: string) {
  const { default: jsPDF }     = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('MYBTEB RESULT REPORT', 14, 14);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.text(`Roll Range: ${from} – ${to}   |   Total: ${students.length}   |   ${new Date().toLocaleString()}`, 14, 20);

  autoTable(doc, {
    startY: 24,
    head: [['Roll','Institute','Sem','Status','1 Sem','2 Sem','3 Sem','4 Sem','5 Sem','6 Sem','7 Sem','8 Sem','Referred Subjects']],
    body: students.map(s => {
      const gpas = [1,2,3,4,5,6,7,8].map(n => { const v = s.gpas[`gpa${n}`]; return v===undefined?'—':v===null?'REF':v.toFixed(2); });
      const subs = resolveSubjects(s).map(r => r.name ? `${r.code}${r.suffix} ${r.name}${r.sem?` (${SEM_ORD[r.sem]} Sem)`:''}` : r.raw).join('\n');
      return [s.roll, s.institute_name, SEM_ORD[s.semester]??s.semester, s.status.toUpperCase(), ...gpas, subs||'—'];
    }),
    styles: { fontSize:7, cellPadding:2, overflow:'linebreak' },
    headStyles: { fillColor:[10,10,10], textColor:[232,255,0], fontStyle:'bold', fontSize:7 },
    columnStyles: {
      0:{cellWidth:18}, 1:{cellWidth:52}, 2:{cellWidth:10}, 3:{cellWidth:16},
      4:{cellWidth:12},5:{cellWidth:12},6:{cellWidth:12},7:{cellWidth:12},
      8:{cellWidth:12},9:{cellWidth:12},10:{cellWidth:12},11:{cellWidth:12},
      12:{cellWidth:'auto'},
    },
    didParseCell: d => {
      if (d.section==='body' && d.column.index===3) {
        const v = String(d.cell.raw).toLowerCase();
        d.cell.styles.textColor = v==='passed'?[80,180,80]:v==='referred'?[220,140,0]:[220,60,60];
        d.cell.styles.fontStyle = 'bold';
      }
    },
    alternateRowStyles: { fillColor:[18,18,18] },
    bodyStyles: { fillColor:[12,12,12], textColor:[220,220,220] },
  });
  doc.save(`bteb-results-${from}-${to}.pdf`);
}

export default function ResultsPage() {
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<'all'|'passed'|'referred'|'failed'>('all');
  const [copied, setCopied]     = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);
  // expanded card index for mobile detail view
  const [expanded, setExpanded] = useState<number | null>(null);

  const search = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true); setError(''); setStudents([]); setExpanded(null);
    try {
      const res  = await fetch(`/api/range?from=${from.trim()}&to=${to.trim()}`);
      const data = await res.json();
      if (res.ok) setStudents(data.results);
      else setError(data.error);
    } catch { setError('Failed to fetch.'); }
    finally { setLoading(false); }
  };

  const visible = filter === 'all' ? students : students.filter(s => s.status === filter);

  const counts = {
    passed:   students.filter(s => s.status==='passed').length,
    referred: students.filter(s => s.status==='referred').length,
    failed:   students.filter(s => s.status==='failed').length,
  };

  const copyCSV = async () => {
    const csv = toCSV(visible);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(csv);
      else {
        const ta = document.createElement('textarea');
        ta.value = csv; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCsvCopied(true); setTimeout(() => setCsvCopied(false), 2000);
    } catch { alert('Copy failed'); }
  };

  const shareStudent = async (s: Student) => {
    const url = new URL(window.location.origin);
    url.searchParams.set('roll', s.roll);
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
      <Nav />

      {/* search bar */}
      <section className="border-b border-white/10 px-5 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3 fade-up fade-up-1">
            Bangladesh Technical Education Board
          </p>
          <h1 className="font-black uppercase leading-[0.88] mb-6 fade-up fade-up-2"
            style={{ fontSize:'clamp(2.4rem,10vw,4.5rem)', letterSpacing:'-0.02em' }}>
            RANGE<br /><span style={{ color:'#e8ff00' }}>RESULTS</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 fade-up fade-up-3">
            {[['From Roll', from, setFrom], ['To Roll', to, setTo]].map(([label, val, setter]) => (
              <div key={label as string} className="flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1.5">{label as string}</p>
                <input
                  type="text" inputMode="numeric"
                  value={val as string}
                  onChange={e => (setter as (v:string)=>void)(e.target.value.replace(/\D/g,'').slice(0,7))}
                  onKeyDown={e => e.key==='Enter' && search()}
                  placeholder="000000"
                  className="w-full bg-transparent border border-white/15 px-3 py-3 text-sm font-mono font-bold focus:outline-none focus:border-[#e8ff00] transition-colors placeholder:text-white/20"
                />
              </div>
            ))}
            <div className="flex items-end">
              <button onClick={search} disabled={loading || !from.trim() || !to.trim()}
                className="w-full sm:w-auto px-6 py-3 font-black text-sm uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all"
                style={{ background:'#e8ff00', color:'#0a0a0a' }}>
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />LOADING</span>
                  : 'SEARCH'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* filter + actions bar */}
      {students.length > 0 && (
        <div className="border-b border-white/10 px-5 py-3 flex flex-wrap items-center gap-2">
          {(['all','passed','referred','failed'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setExpanded(null); }}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all active:scale-95"
              style={{
                background: filter===f ? (f==='all'?'#e8ff00':STATUS_COLOR[f]) : 'transparent',
                color:      filter===f ? '#0a0a0a' : 'rgba(255,255,255,0.35)',
                border:     `1px solid ${filter===f?'transparent':'rgba(255,255,255,0.1)'}`,
              }}>
              {f} ({f==='all' ? students.length : counts[f]})
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={copyCSV}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/20 hover:border-white/50 transition-colors active:scale-95">
              {csvCopied ? '✓ COPIED' : '⎘ CSV'}
            </button>
            <button onClick={() => downloadPDF(visible, from, to)}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 active:scale-95 transition-all"
              style={{ background:'#e8ff00', color:'#0a0a0a' }}>
              ↓ PDF
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {error && (
          <div className="border border-[#ff3b30]/40 bg-[#ff3b30]/10 px-4 py-3 mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff3b30]">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <ResultSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">— ENTER ROLL RANGE —</p>
          </div>
        )}

        {/* result list — same card layout as single search */}
        {!loading && visible.length > 0 && (
          <div className="flex flex-col gap-6">
            {visible.map((s, i) => (
              <div key={s.roll}>
                {/* collapsed row — tap to expand */}
                {expanded !== i ? (
                  <button
                    onClick={() => setExpanded(i)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-white/10 hover:border-white/25 transition-colors active:scale-[0.99] text-left"
                    style={{ background:'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-[#e8ff00]">{s.roll}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                        style={{ background:`${STATUS_COLOR[s.status]}20`, color:STATUS_COLOR[s.status] }}>
                        {s.status}
                      </span>
                      <span className="text-[9px] text-white/30 uppercase tracking-widest hidden sm:inline">
                        {SEM_ORD[s.semester]} SEM
                      </span>
                    </div>
                    <span className="text-white/30 text-xs">↓ VIEW</span>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => setExpanded(null)}
                      className="w-full flex items-center justify-between px-4 py-2 border-x border-t border-white/20 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors">
                      <span>{s.roll}</span>
                      <span>↑ COLLAPSE</span>
                    </button>
                    <ResultCard
                      student={s}
                      onShare={() => shareStudent(s)}
                      copied={copied}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
