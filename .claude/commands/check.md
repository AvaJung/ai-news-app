---
description: 타입 검사, lint, 테스트를 차례로 실행하고 결과를 요약
---

다음을 순서대로 실행하고, 실패한 항목이 있으면 오류 내용과 원인 후보를 알려줘. 코드는 수정하지 말고 보고만 해.

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npx vitest run`

`.next/`가 없어서 `LayoutProps`, `PageProps` 타입 오류가 나면 `npx next typegen`을 먼저 실행한 뒤 다시 시도해.

마지막에 세 항목의 통과/실패를 한 줄씩 정리해.
