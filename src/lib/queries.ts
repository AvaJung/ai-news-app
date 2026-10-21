import { desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

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

export async function getArticles(filter: CategoryFilter) {
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
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(desc(articles.publishedAt));
}
