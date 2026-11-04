import Link from "next/link";

type Props = {
  query: string;
  // 현재 선택된 카테고리 쿼리 값. 검색해도 카테고리는 유지한다.
  category: string | null;
};

export function SearchForm({ query, category }: Props) {
  const clearHref = category ? `/dashboard?category=${category}` : "/dashboard";

  return (
    // GET 폼이라 '검색' 버튼과 Enter 키 모두 같은 방식으로 동작한다. 검색하면 page는 1로 돌아간다.
    <form
      action="/dashboard"
      method="get"
      role="search"
      className="flex items-center gap-2"
    >
      {category && <input type="hidden" name="category" value={category} />}
      <input
        type="search"
        name="q"
        key={query}
        defaultValue={query}
        maxLength={100}
        placeholder="제목이나 요약에서 키워드 검색"
        aria-label="키워드 검색"
        className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        검색
      </button>
      {query && (
        <Link
          href={clearHref}
          className="shrink-0 rounded-lg px-2 py-2 text-sm text-neutral-500 hover:text-indigo-600 dark:text-neutral-400"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
