import { z } from "zod";

// 칩 이름과 겹치거나, Claude 분류 선택지의 "미분류"와 충돌하는 이름은 막는다.
const RESERVED = ["전체", "미분류"];

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(30, "이름은 30자 이하로 입력해 주세요.")
    .refine((n) => !RESERVED.includes(n), "사용할 수 없는 이름입니다."),
  description: z
    .string()
    .trim()
    .max(200, "설명은 200자 이하로 입력해 주세요.")
    .transform((d) => (d === "" ? null : d)),
});

export type CategoryInput = z.input<typeof categoryInputSchema>;

// neon-http 드라이버는 Postgres 오류 코드를 error.cause 아래에 둘 수 있다.
export function isUniqueViolation(e: unknown): boolean {
  const code = (x: unknown) => (x as { code?: string } | null)?.code;
  return code(e) === "23505" || code((e as { cause?: unknown } | null)?.cause) === "23505";
}
