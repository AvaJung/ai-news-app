export type PageItem = number | "ellipsis";

// 첫/끝 페이지는 항상 표시하고, 현재 페이지 앞뒤 `siblings`개를 함께 보여 준다.
// 이어지지 않는 구간에만 "ellipsis"를 넣는다.
export function getPageItems(page: number, totalPages: number, siblings = 2): PageItem[] {
  if (totalPages < 1) return [];

  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);

  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);
  return items;
}
