// 검색어를 정리한다: 앞뒤 공백 제거, 연속 공백 하나로, 100자까지만 사용한다.
export function normalizeQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 100);
}

// LIKE 패턴에서 특별한 의미를 갖는 문자(\, %, _)를 이스케이프한다.
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}
