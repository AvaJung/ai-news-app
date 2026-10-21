import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { CategoryBar } from "@/components/CategoryBar";
import { NewsGrid } from "@/components/NewsGrid";
import { requireUser } from "@/lib/auth";
import {
  getArticles,
  getCategoriesWithCounts,
  getTotals,
  type CategoryFilter,
} from "@/lib/queries";

export const metadata = { title: "대시보드 · AI 뉴스 수집기" };

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  await requireUser();
  const { category } = await searchParams;
  const raw = Array.isArray(category) ? category[0] : category;

  const categories = await getCategoriesWithCounts();
  let filter: CategoryFilter = null;
  let selected: string | null = null;
  if (raw === "none") {
    filter = "none";
    selected = "none";
  } else if (raw && categories.some((c) => String(c.id) === raw)) {
    filter = Number(raw);
    selected = raw;
  }

  const [totals, articles] = await Promise.all([
    getTotals(),
    getArticles(filter),
  ]);

  return (
    <>
      <CategoryBar
        selected={selected}
        total={totals.total}
        uncategorized={totals.uncategorized}
        categories={categories}
      />
      <div className="mt-6">
        <NewsGrid articles={articles} />
      </div>
    </>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between border-b border-neutral-200 py-4 dark:border-neutral-800">
        <h1 className="text-xl font-semibold">AI 뉴스 수집기</h1>
        <Suspense>
          <UserButton />
        </Suspense>
      </header>
      <div className="mt-6">
        <Suspense
          fallback={
            <p className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
              불러오는 중…
            </p>
          }
        >
          <DashboardContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
