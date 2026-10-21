import Link from "next/link";
import { getPageItems } from "@/lib/pagination";

type Props = {
  page: number;
  totalPages: number;
  // 현재 선택된 카테고리 쿼리 값(없으면 null). 페이지를 넘겨도 유지한다.
  category: string | null;
};

const item =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none";
const idle =
  "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";
const disabled =
  "pointer-events-none border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-600";

function href(page: number, category: string | null) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export function Pagination({ page, totalPages, category }: Props) {
  if (totalPages <= 1) return null;

  const atFirst = page === 1;
  const atLast = page === totalPages;

  const step = (label: string, target: number, isDisabled: boolean) => (
    <Link
      href={href(target, category)}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : undefined}
      className={`${item} ${isDisabled ? disabled : idle}`}
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label="페이지" className="mt-8 flex flex-wrap justify-center gap-2">
      {step("처음", 1, atFirst)}
      {step("이전", page - 1, atFirst)}
      {getPageItems(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-9 items-center px-1 text-sm text-neutral-400 dark:text-neutral-600"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p, category)}
            aria-current={p === page ? "page" : undefined}
            className={`${item} ${p === page ? active : idle}`}
          >
            {p}
          </Link>
        ),
      )}
      {step("다음", page + 1, atLast)}
      {step("끝", totalPages, atLast)}
    </nav>
  );
}
