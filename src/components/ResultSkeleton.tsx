export default function ResultSkeleton() {
  return (
    <div className="border border-neutral-200 animate-pulse">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="h-6 w-24 bg-neutral-200 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-neutral-200 rounded" />
          <div className="h-6 w-12 bg-neutral-200 rounded" />
        </div>
      </div>

      {/* institute */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="h-3 w-16 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-neutral-200 rounded" />
      </div>

      {/* semester */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="h-3 w-16 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-24 bg-neutral-200 rounded" />
      </div>

      {/* gpa grid */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="h-3 w-8 bg-neutral-200 rounded mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-12 bg-neutral-200 rounded mb-1" />
              <div className="h-4 w-10 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* referred subjects */}
      <div className="px-4 py-3">
        <div className="h-3 w-28 bg-neutral-200 rounded mb-3" />
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 bg-neutral-100 rounded border border-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
