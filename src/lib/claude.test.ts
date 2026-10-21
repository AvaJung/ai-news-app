import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedItem } from "@/lib/rss";

const { parse } = vi.hoisted(() => ({ parse: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { parse };
  },
}));

import { analyzeArticle, buildPrompt } from "@/lib/claude";

const item: FeedItem = {
  sourceUrl: "https://a/1",
  originalTitle: "OpenAI ships a new model",
  content: "<p>Body &amp; <b>text</b></p>",
  source: "TechCrunch",
  publishedAt: new Date("2026-10-21T00:00:00Z"),
};

const categories = [{ name: "모델", description: "새 모델 출시" }];

describe("buildPrompt", () => {
  it("기사를 <article> 태그로 감싸고 카테고리 목록과 HTML을 제거한 본문을 넣는다", () => {
    const prompt = buildPrompt(item, categories);
    expect(prompt).toContain("- 모델: 새 모델 출시");
    expect(prompt).toContain("- 미분류");
    expect(prompt).toContain("<article>");
    expect(prompt).toContain("<body>Body & text</body>");
    expect(prompt).not.toContain("<p>");
  });

  it("본문을 8000자로 자른다", () => {
    const long = { ...item, content: "a".repeat(20_000) };
    const body = buildPrompt(long, categories).match(/<body>([\s\S]*)<\/body>/)![1];
    expect(body).toHaveLength(8000);
  });
});

describe("analyzeArticle", () => {
  beforeEach(() => parse.mockReset());

  it("파싱된 결과를 반환한다", async () => {
    parse.mockResolvedValue({
      stop_reason: "end_turn",
      parsed_output: { titleKo: "제목", summaryKo: "요약", category: "모델" },
    });
    await expect(analyzeArticle(item, categories)).resolves.toEqual({
      titleKo: "제목",
      summaryKo: "요약",
      category: "모델",
    });
    const req = parse.mock.calls[0][0];
    expect(req.model).toBe("claude-sonnet-5-5");
    expect(req.thinking).toBeUndefined();
    expect(req.tool_choice).toBeUndefined();
  });

  it("parsed_output이 없으면 오류를 던진다", async () => {
    parse.mockResolvedValue({ stop_reason: "max_tokens", parsed_output: null });
    await expect(analyzeArticle(item, categories)).rejects.toThrow("max_tokens");
  });

  it("거부 응답이면 오류를 던진다", async () => {
    parse.mockResolvedValue({ stop_reason: "refusal", parsed_output: null });
    await expect(analyzeArticle(item, categories)).rejects.toThrow("거부");
  });
});
