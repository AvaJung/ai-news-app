import { describe, expect, it } from "vitest";
import { escapeLike, normalizeQuery } from "@/lib/search";

describe("normalizeQuery", () => {
  it("undefined와 빈 문자열은 빈 문자열이 된다", () => {
    expect(normalizeQuery(undefined)).toBe("");
    expect(normalizeQuery("   ")).toBe("");
  });
  it("공백을 정리한다", () => {
    expect(normalizeQuery("  open   ai ")).toBe("open ai");
  });
  it("배열이면 첫 값을 쓴다", () => {
    expect(normalizeQuery(["gpt", "claude"])).toBe("gpt");
  });
  it("100자로 자른다", () => {
    expect(normalizeQuery("a".repeat(150))).toHaveLength(100);
  });
});

describe("escapeLike", () => {
  it("%, _, \\를 이스케이프한다", () => {
    expect(escapeLike("100%_a\\b")).toBe("100\\%\\_a\\\\b");
  });
  it("일반 문자는 그대로 둔다", () => {
    expect(escapeLike("claude 5")).toBe("claude 5");
  });
});
