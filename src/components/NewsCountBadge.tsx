export function NewsCountBadge({ total }: { total: number }) {
  return (
    <p
      className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
      aria-label={`수집된 뉴스 총 ${total}개`}
    >
      총 {total.toLocaleString("ko-KR")}개의 뉴스
    </p>
  );
}
