function SkeletonCard() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="mt-3 h-5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-2 h-5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="뉴스를 불러오는 중"
      className="grid animate-pulse gap-4 motion-reduce:animate-none sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">불러오는 중…</span>
    </div>
  );
}
