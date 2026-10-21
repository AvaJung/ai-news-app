import Link from "next/link";
import { CategoryDialog } from "@/components/CategoryDialog";
import { categoryColor, UNCATEGORIZED_COLOR } from "@/lib/category-colors";

type Props = {
  selected: string | null;
  total: number;
  uncategorized: number;
  categories: { id: number; name: string; count: number }[];
};

const base =
  "rounded-full border px-3.5 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none";
const idle =
  "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";

export function CategoryBar({ selected, total, uncategorized, categories }: Props) {
  // color가 null인 "전체"는 점 없이 인디고 선택 상태를 쓴다.
  const chips = [
    { key: null, href: "/dashboard", label: "전체", count: total, color: null },
    ...categories.map((c) => ({
      key: String(c.id),
      href: `/dashboard?category=${c.id}`,
      label: c.name,
      count: c.count,
      color: categoryColor(c.id),
    })),
    {
      key: "none",
      href: "/dashboard?category=none",
      label: "미분류",
      count: uncategorized,
      color: UNCATEGORIZED_COLOR,
    },
  ];

  return (
    <div role="group" aria-label="카테고리" className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const isActive = selected === c.key;
        return (
          <Link
            key={c.label}
            href={c.href}
            aria-current={isActive ? "true" : undefined}
            className={`${base} ${
              c.color
                ? isActive
                  ? c.color.active
                  : c.color.chip
                : isActive
                  ? active
                  : idle
            }`}
          >
            {c.label}
            <span className="ml-1.5 text-xs opacity-70">{c.count}</span>
          </Link>
        );
      })}
      <CategoryDialog emphasize={categories.length === 0} />
    </div>
  );
}
