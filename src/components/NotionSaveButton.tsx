"use client";

import { useState, useTransition } from "react";
import { saveToNotionAction } from "@/app/dashboard/actions";

type Props = {
  articleId: number;
  saved: boolean;
  pageUrl: string | null;
};

export function NotionSaveButton({ articleId, saved, pageUrl }: Props) {
  const [isSaved, setSaved] = useState(saved);
  const [url, setUrl] = useState(pageUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveToNotionAction(articleId);
      if (res.ok) {
        setSaved(true);
        setUrl(res.pageUrl);
      } else {
        setError(res.error);
      }
    });
  }

  if (isSaved) {
    return (
      <div className="flex items-center gap-2">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-xs text-indigo-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:text-indigo-400"
          >
            Notion 열기 ↗
          </a>
        )}
        <button
          type="button"
          disabled
          className="rounded-lg px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-400"
        >
          저장됨 ✓
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {pending ? "저장 중…" : error ? "다시 시도" : "뉴스 저장"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
