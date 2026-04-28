export default function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-px animate-pulse">

      {/* status block */}
      <div className="h-32 bg-white/10" />

      {/* institute */}
      <div className="bg-white/5 px-5 py-4 border-l-2 border-white/10">
        <div className="h-2 w-16 bg-white/10 rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/10 rounded mb-1.5" />
        <div className="h-2 w-20 bg-white/5 rounded" />
      </div>

      {/* gpa */}
      <div className="bg-white/5 px-5 py-4">
        <div className="h-2 w-8 bg-white/10 rounded mb-3" />
        <div className="grid grid-cols-4 gap-px bg-white/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] px-2 py-3 flex flex-col items-center gap-2">
              <div className="h-2 w-6 bg-white/10 rounded" />
              <div className="h-4 w-10 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* referred subjects */}
      <div className="bg-white/5 px-5 py-4">
        <div className="h-2 w-28 bg-white/10 rounded mb-3" />
        <div className="flex flex-col gap-px">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] px-3 py-3 flex justify-between items-center gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 w-40 bg-white/10 rounded" />
                <div className="h-2 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-10 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
