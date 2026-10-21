import { describe, expect, it, vi } from "vitest";

const { parseURL } = vi.hoisted(() => ({ parseURL: vi.fn() }));
vi.mock("rss-parser", () => ({
  default: class {
    parseURL = parseURL;
  },
}));

import { fetchFeeds, normalizeItem } from "@/lib/rss";

describe("normalizeItem", () => {
  it("RSS 항목을 정규화하고 content:encoded를 우선한다", () => {
    const item = normalizeItem(
      {
        link: " https://a.com/1 ",
        title: " 제목 ",
        isoDate: "2026-10-21T00:00:00.000Z",
        content: "short",
        "content:encoded": "full",
      },
      "TechCrunch",
    );
    expect(item).toEqual({
      sourceUrl: "https://a.com/1",
      originalTitle: "제목",
      content: "full",
      source: "TechCrunch",
      publishedAt: new Date("2026-10-21T00:00:00.000Z"),
    });
  });

  it("isoDate가 없으면 pubDate를 쓴다", () => {
    const item = normalizeItem(
      { link: "https://a.com/1", title: "t", pubDate: "Wed, 21 Oct 2026 00:00:00 GMT" },
      "The Verge",
    );
    expect(item?.publishedAt.toISOString()).toBe("2026-10-21T00:00:00.000Z");
  });

  it("링크, 제목, 날짜가 없거나 날짜가 잘못되면 null이다", () => {
    const base = { link: "https://a.com/1", title: "t", isoDate: "2026-10-21T00:00:00Z" };
    expect(normalizeItem({ ...base, link: undefined }, "TechCrunch")).toBeNull();
    expect(normalizeItem({ ...base, title: "" }, "TechCrunch")).toBeNull();
    expect(normalizeItem({ ...base, isoDate: undefined }, "TechCrunch")).toBeNull();
    expect(normalizeItem({ ...base, isoDate: "not a date" }, "TechCrunch")).toBeNull();
  });
});

describe("fetchFeeds", () => {
  const feeds = [
    { source: "TechCrunch" as const, url: "https://tc.test/feed" },
    { source: "The Verge" as const, url: "https://verge.test/feed" },
  ];

  it("한 피드가 실패해도 다른 피드 결과를 반환하고 오류를 기록한다", async () => {
    parseURL.mockImplementation(async (url: string) => {
      if (url === "https://tc.test/feed") throw new Error("boom");
      return {
        items: [
          { link: "https://v.com/1", title: "ok", isoDate: "2026-10-21T00:00:00Z" },
          { link: "https://v.com/2", title: "no date" },
        ],
      };
    });

    const { items, errors } = await fetchFeeds(feeds);
    expect(items.map((i) => i.sourceUrl)).toEqual(["https://v.com/1"]);
    expect(items[0].source).toBe("The Verge");
    expect(errors).toEqual([{ source: "TechCrunch", message: "boom" }]);
  });
});
