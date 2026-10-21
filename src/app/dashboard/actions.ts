"use server";

import { revalidatePath } from "next/cache";
import { getAllowedUserId } from "@/lib/auth";
import {
  categoryInputSchema,
  isUniqueViolation,
  type CategoryInput,
} from "@/lib/categories";
import { analyzeArticle } from "@/lib/claude";
import { importNews, type ImportResult } from "@/lib/import-news";
import {
  createCategory,
  findExistingSourceUrls,
  insertArticles,
  listCategories,
} from "@/lib/queries";
import { fetchFeeds } from "@/lib/rss";

export type ImportActionResult =
  | { ok: true; result: ImportResult }
  | { ok: false; error: string };

export async function importNewsAction(): Promise<ImportActionResult> {
  if (!(await getAllowedUserId())) {
    return { ok: false, error: "권한이 없습니다." };
  }

  try {
    const result = await importNews({
      fetchFeeds,
      findExistingUrls: findExistingSourceUrls,
      listCategories,
      analyzeArticle,
      insertArticles,
    });
    revalidatePath("/dashboard");
    return { ok: true, result };
  } catch (e) {
    console.error("importNewsAction failed", e);
    return { ok: false, error: "뉴스를 가져오지 못했습니다." };
  }
}

export type CreateCategoryResult = { ok: true } | { ok: false; error: string };

export async function createCategoryAction(
  input: CategoryInput,
): Promise<CreateCategoryResult> {
  if (!(await getAllowedUserId())) {
    return { ok: false, error: "권한이 없습니다." };
  }

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    await createCategory(parsed.data);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { ok: false, error: "이미 있는 카테고리 이름입니다." };
    }
    console.error("createCategoryAction failed", e);
    return { ok: false, error: "카테고리를 추가하지 못했습니다." };
  }
}
