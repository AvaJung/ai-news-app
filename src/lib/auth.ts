import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// 로그인 여부와 ALLOWED_EMAILS 허용 목록을 확인한다. 통과하지 못하면 리다이렉트한다.
export async function requireUser() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return userId;

  const user = await currentUser();
  const emails =
    user?.emailAddresses.map((e) => e.emailAddress.toLowerCase()) ?? [];
  if (!emails.some((e) => allowed.includes(e))) redirect("/");
  return userId;
}
