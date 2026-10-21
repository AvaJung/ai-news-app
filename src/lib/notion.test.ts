import { describe, expect, it } from "vitest";
import { buildPageArgs, parsePageResponse } from "@/lib/notion";

const article = {
  sourceUrl: "https://a/1",
  originalTitle: "Orig",
  titleKo: "제목",
  summaryKo: "요약",
  source: "TechCrunch",
  publishedAt: new Date("2026-10-21T00:00:00Z"),
  categoryName: null,
};

describe("buildPageArgs", () => {
  it("DB 속성에 맞춰 페이지 인자를 만든다", () => {
    const args = buildPageArgs(article, { databaseId: "db", titleProperty: "제목" });
    expect(args.parent).toEqual({ database_id: "db" });
    expect(args.properties["제목"]).toEqual({ title: [{ text: { content: "제목" } }] });
    expect(args.properties["카테고리"]).toEqual({ select: { name: "미분류" } });
    expect(args.properties["원문 URL"]).toEqual({ url: "https://a/1" });
  });

  it("제목 속성 기본값은 Name이고 요약이 없으면 요약 속성을 뺀다", () => {
    const args = buildPageArgs({ ...article, summaryKo: null }, { databaseId: "db" });
    expect(args.properties.Name).toBeDefined();
    expect(args.properties["요약"]).toBeUndefined();
  });
});

describe("parsePageResponse", () => {
  const wrap = (o: unknown) => ({ content: [{ type: "text", text: JSON.stringify(o) }] });

  it("페이지 URL을 반환한다", () => {
    expect(parsePageResponse(wrap({ url: "https://notion.so/x" }))).toEqual({
      url: "https://notion.so/x",
    });
  });

  it("status가 error면 메시지로 던진다", () => {
    expect(() => parsePageResponse(wrap({ status: "error", message: "nope" }))).toThrow("nope");
  });
});
