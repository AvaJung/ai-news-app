# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 상태

`PRD.md`가 기준 문서다. 해외 AI 뉴스를 RSS로 수집해 Claude가 한국어로 번역·요약·분류하고, 마음에 드는 기사를 Notion에 저장하는 1인용 웹 앱이다. **앱 코드는 아직 없다.** create-next-app 템플릿과 PRD 기술 스택 패키지(Clerk, Neon + Drizzle, `@anthropic-ai/sdk`, Notion MCP 서버 + `@modelcontextprotocol/sdk`, `rss-parser`, `zod`, `vitest`, `drizzle-kit`)만 설치되어 있다. 구현 전에 PRD를 먼저 읽을 것. 14절에 미결정 사항(Notion DB 속성, 진행 표시 방식, 기본 카테고리 시드, 배포 방식, 소셜 로그인 제공자)이 있다.

## 명령어

```bash
npm run dev                  # 개발 서버
npm run build                # 프로덕션 빌드 (타입 검사와 프리렌더링 포함)
npm run lint                 # eslint
npx tsc --noEmit             # 타입 검사만
npx vitest run               # 전체 테스트 (vitest 설정과 npm 스크립트는 아직 없음)
npx vitest run path/to/x.test.ts   # 테스트 파일 하나만 실행
npx drizzle-kit generate     # 스키마로 SQL 마이그레이션 생성 (drizzle.config.ts 필요, 아직 없음)
npx drizzle-kit migrate      # DATABASE_URL에 마이그레이션 적용
```

## Next.js 16 특이사항 (알고 있던 Next.js와 다르다)

- `AGENTS.md`는 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 번들 문서를 읽도록 요구한다. Middleware는 이제 **`src/proxy.ts`**다(`proxy` 또는 default export).
- `next.config.ts`에서 `cacheComponents`와 `partialPrefetching`이 켜져 있다. Clerk의 `<SignIn/>`, `<SignUp/>` 안에서 쓰는 `usePathname()` 같은 클라이언트 훅은 `<Suspense>`로 감싸지 않으면 `CLIENT_HOOK_DYNAMIC`으로 빌드가 실패한다.
- `LayoutProps<"/">`, `PageProps`는 `.next/types`에 생성되는 전역 타입이다. `.next/`를 지웠다면 `npx next typegen`을 실행해야 `tsc`가 통과한다.
- Tailwind v4는 `next.config.ts`의 `turbopack.rules`(`@tailwindcss/turbopack`)로 연결되어 있으므로 번들러는 Turbopack을 유지한다.

## 아키텍처 (PRD 8절 기준)

Next.js 앱 하나에 화면과 서버 로직을 함께 둔다. 별도 백엔드는 없다. 구성할 모듈은 다음과 같다.

- **rss**: 두 피드를 가져와 `{ sourceUrl, originalTitle, content, source, publishedAt }`로 정규화한다. 피드 하나가 실패해도 다른 피드는 계속 진행한다.
- **claude**: 기사 1건당 한 번 호출해 한국어 제목, 요약, 카테고리를 구조화 JSON(`output_config.format` + zod 검증)으로 받는다. 카테고리는 현재 카테고리 이름과 "미분류" 중에서만 고르게 제한한다. 기사 본문은 신뢰할 수 없는 입력이므로 태그로 감싸서 전달한다.
- **notion**: `@notionhq/notion-mcp-server`를 MCP SDK의 stdio로 자식 프로세스로 띄워 페이지를 만든다. 배포 방식이 바뀌면 이 모듈만 교체하도록 분리한다. 자식 프로세스 방식 MCP는 서버리스에서 불안정하다.
- **Server Action / Route Handler**: 뉴스 가져오기, 카테고리 CRUD, Notion 저장을 맡는다. 모든 진입점에서 Clerk 로그인과 선택적 `ALLOWED_EMAILS` 허용 목록을 확인해야 한다. proxy는 "로그인 여부"만 확인하고, 소셜 로그인에도 같은 허용 목록이 적용된다.
- **Drizzle 스키마**: `categories`와 `articles` 두 테이블만 둔다(users 테이블 없음). `articles.source_url`은 unique(중복 판별 키)이고, `articles.category_id`는 `ON DELETE SET NULL`이라 카테고리를 삭제하면 기사는 미분류가 된다. 새 카테고리를 추가해도 기존 기사는 재분류되지 않는다.

가져오기 흐름: 두 피드 수집 → URL 기준 중복 제거(배치 내부와 DB 대비) → 새 기사만 동시 호출 수를 제한해 Claude 분석 → `onConflictDoNothing`으로 저장. 기사나 피드 하나가 실패해도 중단하지 않고 결과에 보고한다. 단위 테스트가 가능하도록 오케스트레이션 코드는 DB와 Claude를 직접 import하지 않고 의존성 주입으로 받는다. PRD 11절은 RSS 파싱, 중복 제거, 카테고리 처리의 단위 테스트를 요구하며, Claude와 Notion은 모듈 경계에서 mock으로 대체한다. vitest에는 `@/` alias 설정이 없으므로 `@/…`를 import하는 모듈을 테스트하려면 `vitest.config`에 alias를 추가해야 한다.

## 시험 구현에서 확인한 주의점

- PRD에 적힌 The Verge URL은 404를 반환한다. 동작하는 피드는 `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`(Atom, `rss-parser`로 파싱 가능)이다.
- Notion MCP 도구 이름에는 `API-` 접두사가 붙는다(`post-page`가 아니라 `API-post-page`). 페이지를 만들려면 데이터베이스가 Integration에 공유(연결)되어 있어야 한다. DB의 제목 속성 이름은 워크스페이스 언어에 따라 달라서 설정 가능하게 두고 기본값은 `Name`이다. 도구 응답은 JSON 텍스트이고, 오류는 `isError`가 아니라 `{status:"error", message}`로 온다.
- Drizzle의 neon-http 드라이버는 대화형 트랜잭션을 지원하지 않는다. unique 위반은 Postgres 코드 `23505`로 나타나며 `error.cause` 아래에 있을 수 있다.
- Vitest 5는 `@types/node` 22 이상이 필요하다(프로젝트는 24 사용).
- PRD.md가 있으면 `create-next-app .`이 실행되지 않는다. 임시로 다른 곳에 옮겨 두고 실행한다.
- 모델: 기사별 분석에는 사용자가 정한 `claude-sonnet-5-5`를 쓴다. 이 모델은 thinking을 `disabled`로 설정할 수 없고, 강제 `tool_choice`도 거부한다.

## 환경변수

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ALLOWED_EMAILS`(쉼표 구분), `DATABASE_URL`(Neon), `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`, 선택 항목으로 `NOTION_TITLE_PROPERTY`, `CLAUDE_MODEL`. `.env*`는 gitignore 대상이다.
