import { Suspense } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 font-sans">
      <Suspense>
        <Show when="signed-out">
          <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            계속하려면 로그인하세요.
          </p>
          <SignInButton mode="modal">
            <button className="h-12 rounded-full bg-foreground px-6 text-background">
              로그인
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <header className="absolute right-4 top-4">
            <UserButton />
          </header>
          <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
          <p className="text-zinc-600 dark:text-zinc-400">로그인되었습니다.</p>
        </Show>
      </Suspense>
    </main>
  );
}
