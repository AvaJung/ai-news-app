"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

// 현재 테마는 <html>의 .dark 클래스가 기준이다. 아이콘과 안내 문구도 CSS(dark:)로만 바꾸므로
// 서버 렌더링 결과와 어긋나지 않는다(하이드레이션 불일치 없음).
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 이번 방문에만 적용한다.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="다크/라이트 모드 전환"
      className={`flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
    >
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <span className="sr-only hidden dark:inline">라이트 모드로 전환</span>
      {/* 라이트 모드에서는 달, 다크 모드에서는 해를 보여준다. */}
      <svg
        viewBox="0 0 24 24"
        className="size-5 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="hidden size-5 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
