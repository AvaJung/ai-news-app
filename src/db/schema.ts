import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    sourceUrl: text("source_url").notNull().unique(),
    originalTitle: text("original_title").notNull(),
    // Claude 분석 전에는 null이다.
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    source: text("source").$type<"TechCrunch" | "The Verge">().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    // null이면 미분류. 카테고리를 삭제하면 null이 된다.
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    notionSaved: boolean("notion_saved").notNull().default(false),
    notionPageUrl: text("notion_page_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("articles_category_id_idx").on(table.categoryId),
    index("articles_published_at_idx").on(table.publishedAt),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
