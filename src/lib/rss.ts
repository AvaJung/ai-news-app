import Parser from "rss-parser";

export type Source = "TechCrunch" | "The Verge";

export type FeedItem = {
  sourceUrl: string;
  originalTitle: string;
  content: string;
  source: Source;
  publishedAt: Date;
};

export type FeedError = { source: Source; message: string };

export type FeedResult = { items: FeedItem[]; errors: FeedError[] };

export const FEEDS: { source: Source; url: string }[] = [
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

type RawItem = {
  link?: string;
  title?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  "content:encoded"?: string;
};

// 링크, 제목, 발행일 중 하나라도 없거나 날짜를 해석할 수 없는 항목은 null을 반환한다.
export function normalizeItem(item: RawItem, source: Source): FeedItem | null {
  const sourceUrl = item.link?.trim();
  const originalTitle = item.title?.trim();
  const date = item.isoDate ?? item.pubDate;
  if (!sourceUrl || !originalTitle || !date) return null;

  const publishedAt = new Date(date);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return {
    sourceUrl,
    originalTitle,
    content: item["content:encoded"] ?? item.content ?? item.contentSnippet ?? "",
    source,
    publishedAt,
  };
}

const parser = new Parser({
  timeout: 15_000,
  customFields: { item: ["content:encoded"] },
});

// 두 피드를 병렬로 가져온다. 한 피드가 실패해도 나머지는 계속 진행하고 errors에 기록한다.
export async function fetchFeeds(
  feeds: { source: Source; url: string }[] = FEEDS,
): Promise<FeedResult> {
  const settled = await Promise.allSettled(
    feeds.map(async ({ source, url }) => {
      const feed = await parser.parseURL(url);
      return feed.items
        .map((item) => normalizeItem(item as RawItem, source))
        .filter((item): item is FeedItem => item !== null);
    }),
  );

  const result: FeedResult = { items: [], errors: [] };
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      result.items.push(...r.value);
    } else {
      result.errors.push({
        source: feeds[i].source,
        message: r.reason instanceof Error ? r.reason.message : String(r.reason),
      });
    }
  });
  return result;
}
