// Tailwind는 완성된 클래스 문자열만 인식하므로 색마다 클래스를 전부 적어 둔다.
// 포인트 색(인디고)과 겹치지 않는 8가지 색을 카테고리 id 순서대로 돌려 쓴다.
export type CategoryColor = {
  chip: string; // 선택하지 않은 칩: 색을 채운 연한 톤
  active: string; // 선택한 칩: 진한 단색 + 링
  badge: string; // 뉴스 카드의 카테고리 배지
};

const PALETTE: CategoryColor[] = [
  {
    chip: "border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900",
    active: "border-rose-600 bg-rose-600 text-white ring-2 ring-rose-300 dark:ring-rose-800",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  {
    chip: "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900",
    active: "border-amber-600 bg-amber-600 text-white ring-2 ring-amber-300 dark:ring-amber-800",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    chip: "border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900",
    active: "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-800",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    chip: "border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900",
    active: "border-sky-600 bg-sky-600 text-white ring-2 ring-sky-300 dark:ring-sky-800",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  {
    chip: "border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900",
    active: "border-violet-600 bg-violet-600 text-white ring-2 ring-violet-300 dark:ring-violet-800",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
  {
    chip: "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900",
    active: "border-orange-600 bg-orange-600 text-white ring-2 ring-orange-300 dark:ring-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  },
  {
    chip: "border-teal-300 bg-teal-100 text-teal-800 hover:bg-teal-200 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200 dark:hover:bg-teal-900",
    active: "border-teal-600 bg-teal-600 text-white ring-2 ring-teal-300 dark:ring-teal-800",
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
  },
  {
    chip: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:hover:bg-fuchsia-900",
    active: "border-fuchsia-600 bg-fuchsia-600 text-white ring-2 ring-fuchsia-300 dark:ring-fuchsia-800",
    badge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200",
  },
];

export const UNCATEGORIZED_COLOR: CategoryColor = {
  chip: "border-neutral-300 bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
  active: "border-neutral-700 bg-neutral-700 text-white ring-2 ring-neutral-300 dark:border-neutral-300 dark:bg-neutral-300 dark:text-neutral-900 dark:ring-neutral-600",
  badge: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

// 같은 id는 항상 같은 색이다. id가 연속이면 8개까지는 색이 겹치지 않는다.
export function categoryColor(id: number | null): CategoryColor {
  if (id === null) return UNCATEGORIZED_COLOR;
  return PALETTE[((id % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
