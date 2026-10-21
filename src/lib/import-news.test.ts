import { describe, expect, it, vi } from "vitest";
import { importNews } from "@/lib/import-news";
import type { FeedItem } from "@/lib/rss";

const NOW = new Date("2026-10-21T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

const item = (url: string, publishedAt: Date): FeedItem => ({
  sourceUrl: url,
  originalTitle: url,
  content: "",
  source: "TechCrunch",
  publishedAt,
});

function setup(items: FeedItem[], existing: string[] = []) {
  const insertArticles = vi.fn(async (rows: FeedItem[]) => rows.length);
  const findExistingUrls = vi.fn(async () => new Set(existing));
  const run = () =>
    importNews({
      fetchFeeds: async () => ({
        items,
        errors: [{ source: "The Verge", message: "404" }],
      }),
      findExistingUrls,
      insertArticles,
      now: () => NOW,
    });
  return { run, insertArticles, findExistingUrls };
}

describe("importNews", () => {
  it("24시간보다 오래된 기사는 저장하지 않는다 (정확히 24시간 전은 포함)", async () => {
    const { run, insertArticles } = setup([
      item("https://a/in", hoursAgo(23)),
      item("https://a/edge", hoursAgo(24)),
      item("https://a/old", hoursAgo(24.01)),
    ]);
    const result = await run();
    expect(insertArticles.mock.calls[0][0].map((i) => i.sourceUrl)).toEqual([
      "https://a/in",
      "https://a/edge",
    ]);
    expect(result).toMatchObject({ fetched: 2, inserted: 2, skipped: 0 });
  });

  it("배치 내부 중복과 DB에 이미 있는 URL은 제외한다", async () => {
    const { run, insertArticles, findExistingUrls } = setup(
      [
        item("https://a/1", hoursAgo(1)),
        item("https://a/1", hoursAgo(2)),
        item("https://a/2", hoursAgo(3)),
        item("https://a/3", hoursAgo(4)),
      ],
      ["https://a/2"],
    );
    const result = await run();
    expect(findExistingUrls).toHaveBeenCalledWith([
      "https://a/1",
      "https://a/2",
      "https://a/3",
    ]);
    expect(insertArticles.mock.calls[0][0].map((i) => i.sourceUrl)).toEqual([
      "https://a/1",
      "https://a/3",
    ]);
    expect(result).toMatchObject({ fetched: 4, inserted: 2, skipped: 2 });
  });

  it("피드 오류를 결과에 그대로 보고한다", async () => {
    const { run } = setup([]);
    const result = await run();
    expect(result.feedErrors).toEqual([{ source: "The Verge", message: "404" }]);
  });

  it("새 기사가 없으면 DB를 호출하지 않는다", async () => {
    const { run, insertArticles, findExistingUrls } = setup([
      item("https://a/old", hoursAgo(48)),
    ]);
    const result = await run();
    expect(findExistingUrls).not.toHaveBeenCalled();
    expect(insertArticles).not.toHaveBeenCalled();
    expect(result).toMatchObject({ fetched: 0, inserted: 0, skipped: 0 });
  });
});
