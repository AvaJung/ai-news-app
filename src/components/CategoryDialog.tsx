"use client";

import { useRef, useState, useTransition } from "react";
import { createCategoryAction } from "@/app/dashboard/actions";

const field =
  "mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200";

// 네이티브 <dialog>의 showModal()은 포커스 가두기, Esc 닫기, 닫을 때 포커스 복귀를 처리해 준다.
export function CategoryDialog({ emphasize }: { emphasize: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCategoryAction({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
      });
      if (result.ok) {
        formRef.current?.reset();
        dialogRef.current?.close();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`rounded-full border border-dashed px-3.5 py-1.5 text-sm hover:border-indigo-600 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:hover:border-indigo-400 dark:hover:text-indigo-400 ${
          emphasize
            ? "border-indigo-400 text-indigo-600 dark:text-indigo-400"
            : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
        }`}
      >
        + 카테고리 추가
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="category-dialog-title"
        onClick={(e) => {
          // 패널 밖(backdrop)을 누르면 닫는다.
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-neutral-800 backdrop:bg-black/40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <form ref={formRef} onSubmit={submit}>
          <h2 id="category-dialog-title" className="text-lg font-semibold">
            카테고리 추가
          </h2>

          <label className="mt-4 block text-sm font-medium">
            이름
            <input
              name="name"
              required
              maxLength={30}
              autoFocus
              autoComplete="off"
              className={field}
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            설명 <span className="font-normal text-neutral-500">(선택)</span>
            <textarea
              name="description"
              rows={3}
              maxLength={200}
              className={field}
            />
          </label>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Claude가 기사를 분류할 때 참고하는 힌트예요. 새 카테고리는 앞으로 가져오는 기사에만 적용됩니다.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {pending ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
