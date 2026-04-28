'use client';
import { SEM_ORD, STATUS_COLOR, Student, resolveSubjects } from './shared';

export function StatusCard({
  student, onShare, copied,
}: {
  student: Student;
  onShare: () => void;
  copied: boolean;
}) {
  const color = STATUS_COLOR[student.status];
  return (
    <div className="px-5 py-6" style={{ background: color }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 mb-1">Roll No.</p>
          <p className="font-black font-mono leading-none" style={{ fontSize:'clamp(2rem,10vw,3.5rem)', color:'#0a0a0a' }}>
            {student.roll}
          </p>
        </div>
        <button onClick={onShare}
          className="text-[10px] font-black uppercase tracking-widest px-3 py-2 transition-all active:scale-95"
          style={{ background:'rgba(0,0,0,0.15)', color:'#0a0a0a' }}>
          {copied ? '✓ COPIED' : '⎘ SHARE'}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5"
          style={{ background:'#0a0a0a', color }}>
          {student.status}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-black/60">
          {SEM_ORD[student.semester]} SEM
        </span>
      </div>
    </div>
  );
}

export function InstituteCard({ student }: { student: Student }) {
  return (
    <div className="bg-white/5 px-5 py-4 border-l-2" style={{ borderColor:'#e8ff00' }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">Institute</p>
      <p className="text-sm font-bold uppercase leading-snug">{student.institute_name}</p>
      <p className="text-[10px] font-mono text-white/30 mt-0.5">CODE: {student.institute_code}</p>
    </div>
  );
}

export function GpaCard({ student }: { student: Student }) {
  const entries = Object.entries(student.gpas).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) return null;
  return (
    <div className="bg-white/5 px-5 py-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-3">GPA</p>
      <div className="grid grid-cols-4 gap-px bg-white/5">
        {entries.map(([key, val]) => {
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
  );
}

export function RefSubjectsCard({ student }: { student: Student }) {
  const subs = resolveSubjects(student);
  if (!subs.length) return null;
  return (
    <div className="bg-white/5 px-5 py-4">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">Referred Subjects</p>
        <span className="text-[9px] font-black px-2 py-0.5 uppercase tracking-widest"
          style={{ background:'#ff9500', color:'#0a0a0a' }}>
          {subs.length}
        </span>
      </div>
      <div className="flex flex-col gap-px">
        {subs.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-[#0a0a0a] px-3 py-3 gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase leading-snug truncate">{r.name ?? `Subject ${r.code}`}</p>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">{r.code}{r.suffix}</p>
            </div>
            {r.sem > 0 && (
              <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1"
                style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}>
                {SEM_ORD[r.sem]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultCard({ student, onShare, copied }: { student: Student; onShare: () => void; copied: boolean }) {
  return (
    <div className="flex flex-col gap-px fade-up fade-up-1">
      <StatusCard student={student} onShare={onShare} copied={copied} />
      <InstituteCard student={student} />
      <GpaCard student={student} />
      <RefSubjectsCard student={student} />
    </div>
  );
}
