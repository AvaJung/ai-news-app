"use client";

import { useState, useTransition } from "react";
import {
  importNewsAction,
  type ImportActionResult,
} from "@/app/dashboard/actions";

function message(r: ImportActionResult) {
  if (!r.ok) return r.error;
  const { inserted, skipped, feedErrors } = r.result;
  const parts = [`${inserted}건 저장`, `${skipped}건 중복`];
  if (feedErrors.length > 0) {
    parts.push(`피드 실패: ${feedErrors.map((e) => e.source).join(", ")}`);
  }
  return parts.join(" · ");
}

export function ImportButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportActionResult | null>(null);

  const failed = result !== null && (!result.ok || result.result.feedErrors.length > 0);

  return (
    <div className="flex items-center gap-3">
      {result && !pending && (
        <p
          role="status"
          className={`hidden text-sm sm:block ${
            failed
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {message(result)}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await importNewsAction());
          })
        }
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-offset-neutral-950"
      >
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
