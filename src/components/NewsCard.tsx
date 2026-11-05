import { DeleteButton } from "@/components/DeleteButton";
import { NotionSaveButton } from "@/components/NotionSaveButton";
import { categoryColor } from "@/lib/category-colors";

type Props = {
  article: {
    id: number;
    sourceUrl: string;
    originalTitle: string;
    titleKo: string | null;
    summaryKo: string | null;
    source: string;
    publishedAt: Date;
    categoryId: number | null;
    categoryName: string | null;
    notionSaved: boolean;
    notionPageUrl: string | null;
  };
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article }: Props) {
  const color = categoryColor(article.categoryId);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition-colors duration-150 hover:border-indigo-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-500/60">
      {/* 카테고리를 색으로도 구분하는 왼쪽 띠 */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-4 left-0 w-1 rounded-r-full ${color.bar}`}
      />
      <DeleteButton articleId={article.id} />
      <div className="flex items-center justify-between gap-3 pr-7">
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${color.badge}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <time
          dateTime={article.publishedAt.toISOString()}
          className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
        >
          {dateFormat.format(article.publishedAt)}
        </time>
      </div>
      <h2 className="mt-4 line-clamp-2 text-base leading-snug font-semibold tracking-tight text-balance text-neutral-900 dark:text-neutral-50">
        {article.titleKo ?? article.originalTitle}
      </h2>
      {article.summaryKo && (
        <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        {/* after:inset-0 로 링크 영역을 카드 전체로 넓힌다. 버튼은 z-10 으로 위에 둔다.
            truncate(overflow-hidden)는 after 요소를 잘라내므로 안쪽 span에만 건다. */}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="flex min-w-0 items-center gap-1 rounded text-sm text-indigo-600 after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500 dark:text-indigo-400"
        >
          <span className="truncate">
            <span className="font-medium">{article.source}</span>
            에서 원문 보기
          </span>
          <span aria-hidden="true" className="shrink-0">
            ↗
          </span>
        </a>
        <div className="relative z-10 shrink-0">
          <NotionSaveButton
            articleId={article.id}
            saved={article.notionSaved}
            pageUrl={article.notionPageUrl}
          />
        </div>
      </div>
    </article>
  );
}
