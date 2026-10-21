import { describe, expect, it } from "vitest";
import { categoryColor, UNCATEGORIZED_COLOR } from "@/lib/category-colors";
import { categoryInputSchema, isUniqueViolation } from "@/lib/categories";

describe("categoryInputSchema", () => {
  it("이름을 다듬고 빈 설명은 null로 바꾼다", () => {
    expect(categoryInputSchema.parse({ name: "  연구  ", description: "  " })).toEqual({
      name: "연구",
      description: null,
    });
  });

  it("빈 이름, 너무 긴 이름, 예약어를 거부한다", () => {
    expect(categoryInputSchema.safeParse({ name: " ", description: "" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "a".repeat(31), description: "" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "미분류", description: "" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "전체", description: "" }).success).toBe(false);
  });

  it("설명이 200자를 넘으면 거부한다", () => {
    expect(
      categoryInputSchema.safeParse({ name: "x", description: "a".repeat(201) }).success,
    ).toBe(false);
  });
});

describe("isUniqueViolation", () => {
  it("코드가 error 자체나 cause에 있어도 인식한다", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ cause: { code: "23505" } })).toBe(true);
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});

describe("categoryColor", () => {
  it("같은 id는 같은 색, 연속된 8개 id는 서로 다른 색이다", () => {
    expect(categoryColor(6)).toBe(categoryColor(6));
    const chips = Array.from({ length: 8 }, (_, i) => categoryColor(6 + i).chip);
    expect(new Set(chips).size).toBe(8);
  });

  it("미분류(null)는 회색이다", () => {
    expect(categoryColor(null)).toBe(UNCATEGORIZED_COLOR);
  });
});
