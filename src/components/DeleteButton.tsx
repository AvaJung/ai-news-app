"use client";

import { useState, useTransition } from "react";
import { deleteArticleAction } from "@/app/dashboard/actions";

export function DeleteButton({ articleId }: { articleId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteArticleAction(articleId);
      if (!res.ok) setError(res.error);
      // 성공하면 revalidatePath로 목록이 갱신되어 카드가 사라진다.
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="기사 삭제"
        title="삭제"
        className="absolute top-3 right-3 z-10 flex size-7 transition-opacity [@media(hover:hover)]:opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      {error && (
        <p
          role="alert"
          className="absolute top-11 right-3 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </>
  );
}
