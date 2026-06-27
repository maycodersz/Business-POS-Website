function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-full max-w-xl" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-7 w-32" />
            <SkeletonBlock className="mt-3 h-3 w-36" />
          </div>
        ))}
      </section>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-36" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
