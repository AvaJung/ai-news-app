import { describe, expect, it } from "vitest";
import { getPageItems } from "@/lib/pagination";

const E = "ellipsis";

describe("getPageItems", () => {
  it("중간 페이지는 앞뒤에 ...을 넣는다 (100페이지 중 50)", () => {
    expect(getPageItems(50, 100)).toEqual([1, E, 48, 49, 50, 51, 52, E, 100]);
  });

  it("앞쪽이 첫 페이지와 이어지면 앞의 ...을 생략한다", () => {
    expect(getPageItems(1, 100)).toEqual([1, 2, 3, E, 100]);
    expect(getPageItems(4, 100)).toEqual([1, 2, 3, 4, 5, 6, E, 100]);
  });

  it("뒤쪽이 마지막 페이지와 이어지면 뒤의 ...을 생략한다", () => {
    expect(getPageItems(100, 100)).toEqual([1, E, 98, 99, 100]);
    expect(getPageItems(97, 100)).toEqual([1, E, 95, 96, 97, 98, 99, 100]);
  });

  it("한 페이지 간격이 비면 ...을 넣는다", () => {
    expect(getPageItems(5, 100)).toEqual([1, E, 3, 4, 5, 6, 7, E, 100]);
  });

  it("페이지가 적으면 모두 나열한다", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(2, 2)).toEqual([1, 2]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, E, 7]);
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
