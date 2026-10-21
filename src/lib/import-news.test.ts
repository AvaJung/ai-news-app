import { describe, expect, it, vi } from "vitest";
import type { Analysis } from "@/lib/claude";
import { importNews, type AnalyzedItem, type ImportDeps } from "@/lib/import-news";
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

const CATEGORIES = [
  { id: 1, name: "모델", description: "새 모델 출시" },
  { id: 2, name: "정책", description: null },
];

function setup(
  items: FeedItem[],
  existing: string[] = [],
  analyze: (i: FeedItem) => Promise<Analysis> = async (i) => ({
    titleKo: `ko:${i.sourceUrl}`,
    summaryKo: "요약",
    category: "모델",
  }),
  concurrency?: number,
) {
  const insertArticles = vi.fn(async (rows: AnalyzedItem[]) => rows.length);
  const findExistingUrls = vi.fn(async () => new Set(existing));
  const listCategories = vi.fn(async () => CATEGORIES);
  const analyzeArticle = vi.fn<ImportDeps["analyzeArticle"]>(analyze);
  const run = () =>
    importNews({
      fetchFeeds: async () => ({
        items,
        errors: [{ source: "The Verge", message: "404" }],
      }),
      findExistingUrls,
      listCategories,
      analyzeArticle,
      insertArticles,
      now: () => NOW,
      concurrency,
    });
  return { run, insertArticles, findExistingUrls, listCategories, analyzeArticle };
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

  it("새 기사가 없으면 DB와 Claude를 호출하지 않는다", async () => {
    const { run, insertArticles, findExistingUrls, listCategories, analyzeArticle } =
      setup([item("https://a/old", hoursAgo(48))]);
    const result = await run();
    expect(findExistingUrls).not.toHaveBeenCalled();
    expect(listCategories).not.toHaveBeenCalled();
    expect(analyzeArticle).not.toHaveBeenCalled();
    expect(insertArticles).not.toHaveBeenCalled();
    expect(result).toMatchObject({ fetched: 0, inserted: 0, skipped: 0 });
  });

  it("중복 기사는 Claude에 보내지 않는다", async () => {
    const { run, analyzeArticle } = setup(
      [item("https://a/1", hoursAgo(1)), item("https://a/2", hoursAgo(2))],
      ["https://a/2"],
    );
    await run();
    expect(analyzeArticle.mock.calls.map((c) => c[0].sourceUrl)).toEqual([
      "https://a/1",
    ]);
  });

  it("분석 결과를 저장하고 카테고리 이름을 id로 바꾼다 (미분류는 null)", async () => {
    const { run, insertArticles, analyzeArticle } = setup(
      [item("https://a/1", hoursAgo(1)), item("https://a/2", hoursAgo(2))],
      [],
      async (i) => ({
        titleKo: `ko:${i.sourceUrl}`,
        summaryKo: "요약",
        category: i.sourceUrl.endsWith("1") ? "정책" : "미분류",
      }),
    );
    await run();
    expect(analyzeArticle.mock.calls[0][1]).toEqual(CATEGORIES);
    expect(insertArticles.mock.calls[0][0]).toMatchObject([
      { sourceUrl: "https://a/1", titleKo: "ko:https://a/1", summaryKo: "요약", categoryId: 2 },
      { sourceUrl: "https://a/2", categoryId: null },
    ]);
  });

  it("분석에 실패한 기사는 저장하지 않고 failed에 보고한다", async () => {
    const { run, insertArticles } = setup(
      [
        item("https://a/1", hoursAgo(1)),
        item("https://a/2", hoursAgo(2)),
        item("https://a/3", hoursAgo(3)),
      ],
      [],
      async (i) => {
        if (i.sourceUrl === "https://a/2") throw new Error("boom");
        return { titleKo: "t", summaryKo: "s", category: "모델" };
      },
    );
    const result = await run();
    expect(insertArticles.mock.calls[0][0].map((i) => i.sourceUrl)).toEqual([
      "https://a/1",
      "https://a/3",
    ]);
    expect(result.failed).toEqual([{ sourceUrl: "https://a/2", reason: "boom" }]);
    expect(result).toMatchObject({ fetched: 3, inserted: 2, skipped: 0 });
  });

  it("전부 실패하면 저장을 호출하지 않는다", async () => {
    const { run, insertArticles } = setup(
      [item("https://a/1", hoursAgo(1))],
      [],
      async () => {
        throw new Error("down");
      },
    );
    const result = await run();
    expect(insertArticles).not.toHaveBeenCalled();
    expect(result.failed).toHaveLength(1);
  });

  it("동시 분석 수는 제한값을 넘지 않는다", async () => {
    let active = 0;
    let peak = 0;
    const { run } = setup(
      Array.from({ length: 8 }, (_, n) => item(`https://a/${n}`, hoursAgo(1))),
      [],
      async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
        return { titleKo: "t", summaryKo: "s", category: "모델" };
      },
      3,
    );
    const result = await run();
    expect(peak).toBe(3);
    expect(result.inserted).toBe(8);
  });
});
