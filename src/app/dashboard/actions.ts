"use server";

import { revalidatePath } from "next/cache";
import { getAllowedUserId } from "@/lib/auth";
import { importNews, type ImportResult } from "@/lib/import-news";
import { findExistingSourceUrls, insertArticles } from "@/lib/queries";
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
      insertArticles,
    });
    revalidatePath("/dashboard");
    return { ok: true, result };
  } catch (e) {
    console.error("importNewsAction failed", e);
    return { ok: false, error: "뉴스를 가져오지 못했습니다." };
  }
}
