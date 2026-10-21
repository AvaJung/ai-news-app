import type { Analysis, CategoryHint } from "@/lib/claude";
import type { FeedError, FeedItem, FeedResult } from "@/lib/rss";

export type CategoryRow = CategoryHint & { id: number };

export type AnalyzedItem = FeedItem & {
  titleKo: string;
  summaryKo: string;
  categoryId: number | null; // null이면 미분류
};

export type ImportDeps = {
  fetchFeeds: () => Promise<FeedResult>;
  findExistingUrls: (urls: string[]) => Promise<Set<string>>;
  listCategories: () => Promise<CategoryRow[]>;
  analyzeArticle: (item: FeedItem, categories: CategoryHint[]) => Promise<Analysis>;
  insertArticles: (items: AnalyzedItem[]) => Promise<number>;
  now?: () => Date;
  concurrency?: number;
};

export type AnalysisFailure = { sourceUrl: string; reason: string };

export type ImportResult = {
  fetched: number; // 24시간 안에 발행된 기사 수
  inserted: number;
  skipped: number; // 배치 내부 또는 DB와 중복된 수
  feedErrors: FeedError[];
  failed: AnalysisFailure[]; // Claude 분석에 실패해 저장하지 않은 기사
};

const WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CONCURRENCY = 3;

// 결과 순서는 입력 순서를 유지하고, 동시에 실행되는 작업 수는 limit을 넘지 않는다.
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export async function importNews(deps: ImportDeps): Promise<ImportResult> {
  const now = (deps.now ?? (() => new Date()))();
  const since = now.getTime() - WINDOW_MS;

  const { items, errors } = await deps.fetchFeeds();
  const recent = items.filter((i) => i.publishedAt.getTime() >= since);

  const unique = new Map<string, FeedItem>();
  for (const item of recent) {
    if (!unique.has(item.sourceUrl)) unique.set(item.sourceUrl, item);
  }

  const existing =
    unique.size > 0
      ? await deps.findExistingUrls([...unique.keys()])
      : new Set<string>();
  const fresh = [...unique.values()].filter((i) => !existing.has(i.sourceUrl));

  const failed: AnalysisFailure[] = [];
  const analyzed: AnalyzedItem[] = [];

  if (fresh.length > 0) {
    const categories = await deps.listCategories();
    const idByName = new Map(categories.map((c) => [c.name, c.id]));

    const outcomes = await mapWithConcurrency(
      fresh,
      deps.concurrency ?? DEFAULT_CONCURRENCY,
      async (item) => {
        try {
          const a = await deps.analyzeArticle(item, categories);
          return {
            ...item,
            titleKo: a.titleKo,
            summaryKo: a.summaryKo,
            categoryId: idByName.get(a.category) ?? null,
          } satisfies AnalyzedItem;
        } catch (e) {
          failed.push({
            sourceUrl: item.sourceUrl,
            reason: e instanceof Error ? e.message : String(e),
          });
          return null;
        }
      },
    );
    for (const o of outcomes) if (o) analyzed.push(o);
  }

  const inserted = analyzed.length > 0 ? await deps.insertArticles(analyzed) : 0;

  return {
    fetched: recent.length,
    inserted,
    skipped: recent.length - fresh.length,
    feedErrors: errors,
    failed,
  };
}
