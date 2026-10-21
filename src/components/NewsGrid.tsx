import { NewsCard } from "./NewsCard";

type Article = Parameters<typeof NewsCard>[0]["article"] & { id: number };

export function NewsGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
        아직 가져온 뉴스가 없어요. 위의 ‘뉴스 가져오기’를 눌러 보세요.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <NewsCard key={a.id} article={a} />
      ))}
    </div>
  );
}
