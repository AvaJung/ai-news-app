import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

async function Gate() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        계속하려면 로그인하세요.
      </p>
      <SignInButton mode="modal">
        <button className="h-12 rounded-full bg-foreground px-6 text-background">
          로그인
        </button>
      </SignInButton>
    </>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 font-sans">
      <Suspense>
        <Gate />
      </Suspense>
    </main>
  );
}
