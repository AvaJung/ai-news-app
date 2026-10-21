import type { FeedError, FeedItem, FeedResult } from "@/lib/rss";

export type ImportDeps = {
  fetchFeeds: () => Promise<FeedResult>;
  findExistingUrls: (urls: string[]) => Promise<Set<string>>;
  insertArticles: (items: FeedItem[]) => Promise<number>;
  now?: () => Date;
};

export type ImportResult = {
  fetched: number; // 24시간 안에 발행된 기사 수
  inserted: number;
  skipped: number; // 배치 내부 또는 DB와 중복된 수
  feedErrors: FeedError[];
};

const WINDOW_MS = 24 * 60 * 60 * 1000;

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

  const inserted = fresh.length > 0 ? await deps.insertArticles(fresh) : 0;

  return {
    fetched: recent.length,
    inserted,
    skipped: recent.length - inserted,
    feedErrors: errors,
  };
}
