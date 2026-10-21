import { desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import type { AnalyzedItem } from "@/lib/import-news";

export type CategoryFilter = number | "none" | null;

export async function getCategoriesWithCounts() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      count: sql<number>`count(${articles.id})::int`,
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.id);
  return rows;
}

export async function getTotals() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      uncategorized: sql<number>`count(*) filter (where ${articles.categoryId} is null)::int`,
    })
    .from(articles);
  return row;
}

export const PAGE_SIZE = 9;

// page는 1부터 시작한다. 발행일이 같은 기사의 순서가 페이지 사이에서 흔들리지 않도록 id를 보조 정렬 키로 쓴다.
export async function getArticles(filter: CategoryFilter, page = 1) {
  const where =
    filter === null
      ? undefined
      : filter === "none"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  return db
    .select({
      id: articles.id,
      sourceUrl: articles.sourceUrl,
      originalTitle: articles.originalTitle,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      source: articles.source,
      publishedAt: articles.publishedAt,
      notionSaved: articles.notionSaved,
      notionPageUrl: articles.notionPageUrl,
      categoryId: articles.categoryId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

export async function findExistingSourceUrls(urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ sourceUrl: articles.sourceUrl })
    .from(articles)
    .where(inArray(articles.sourceUrl, urls));
  return new Set(rows.map((r) => r.sourceUrl));
}

export async function createCategory(input: {
  name: string;
  description: string | null;
}) {
  const [row] = await db
    .insert(categories)
    .values(input)
    .returning({ id: categories.id });
  return row.id;
}

// Claude 분석 단계에서 나온 번역·요약·카테고리를 함께 저장한다.
export async function listCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .orderBy(categories.id);
}

// 동시에 들어온 중복은 source_url unique로 걸러지며, 실제로 저장된 건수를 반환한다.
export async function insertArticles(items: AnalyzedItem[]) {
  if (items.length === 0) return 0;
  const rows = await db
    .insert(articles)
    .values(
      items.map((i) => ({
        sourceUrl: i.sourceUrl,
        originalTitle: i.originalTitle,
        titleKo: i.titleKo,
        summaryKo: i.summaryKo,
        categoryId: i.categoryId,
        source: i.source,
        publishedAt: i.publishedAt,
      })),
    )
    .onConflictDoNothing({ target: articles.sourceUrl })
    .returning({ id: articles.id });
  return rows.length;
}
