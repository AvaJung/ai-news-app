type Props = {
  article: {
    sourceUrl: string;
    originalTitle: string;
    titleKo: string | null;
    summaryKo: string | null;
    source: string;
    publishedAt: Date;
    categoryName: string | null;
  };
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article }: Props) {
  const badge = article.categoryName
    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";

  return (
    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs ${badge}`}>
          {article.categoryName ?? "미분류"}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {article.source} · {dateFormat.format(article.publishedAt)}
        </span>
      </div>
      <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-neutral-800 dark:text-neutral-200">
        {article.titleKo ?? article.originalTitle}
      </h2>
      {article.summaryKo && (
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="rounded text-sm text-indigo-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}
