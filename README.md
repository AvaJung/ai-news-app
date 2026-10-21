# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집해 Claude가 한국어로 번역·요약하고 카테고리별로 분류해 카드로 보여주는 1인용 웹 앱입니다. 마음에 드는 뉴스는 버튼 하나로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **로그인**: Clerk 로그인과 선택적 허용 이메일 목록(`ALLOWED_EMAILS`)으로 본인만 접근합니다.
- **뉴스 가져오기**: TechCrunch AI와 The Verge AI 피드를 수집하고, 이미 있는 기사(원문 URL 기준)는 건너뜁니다. 새 기사만 Claude가 한국어 제목·요약·카테고리로 분석합니다.
- **카테고리**: 카테고리를 추가하면 이후 가져오는 기사부터 분류에 반영됩니다. 카테고리별 필터와 페이지네이션을 지원합니다.
- **Notion 저장**: 카드의 "뉴스 저장" 버튼을 누르면 Notion 데이터베이스에 저장하고, 버튼이 "저장됨"으로 바뀝니다.

> 카테고리 수정·삭제 기능은 아직 구현되지 않았습니다.

## 기술 스택

Next.js 16(App Router, Turbopack) · React 19 · Tailwind CSS v4 · Clerk · Neon(Postgres) + Drizzle ORM · Claude API(`@anthropic-ai/sdk`, zod 검증) · Notion MCP 서버(`@notionhq/notion-mcp-server`) · Vitest

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk 대시보드의 API keys |
| `ALLOWED_EMAILS` | 접근을 허용할 이메일(쉼표 구분). 비우면 로그인한 누구나 허용 |
| `DATABASE_URL` | Neon Postgres 연결 문자열 |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `CLAUDE_MODEL` | (선택) 분석에 쓸 모델. 기본값은 `claude-sonnet-5-5` |
| `NOTION_TOKEN` | Notion 내부 Integration 토큰 |
| `NOTION_DATABASE_ID` | 기사를 저장할 Notion 데이터베이스 ID |
| `NOTION_TITLE_PROPERTY` | (선택) Notion DB의 제목 속성 이름. 기본값은 `Name` |

### 3. 데이터베이스 마이그레이션

```bash
npx drizzle-kit migrate
```

### 4. Notion 데이터베이스 준비

1. 저장용 데이터베이스를 만들고 아래 속성을 추가합니다.

   | 속성 | 유형 |
   |---|---|
   | 제목 (제목 속성 이름은 워크스페이스 언어에 따라 다르며 `NOTION_TITLE_PROPERTY`로 맞춥니다) | 제목 |
   | 요약 | 텍스트 |
   | 원문 URL | URL |
   | 출처 | 선택 |
   | 카테고리 | 선택 |
   | 발행일 | 날짜 |

2. 데이터베이스 메뉴의 연결(Connections)에서 만든 Integration을 추가합니다. 연결하지 않으면 저장이 실패합니다.

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 `/dashboard`에서 "뉴스 가져오기"를 누릅니다.

## 명령어

```bash
npm run dev                  # 개발 서버
npm run build                # 프로덕션 빌드 (타입 검사 포함)
npm run lint                 # eslint
npx tsc --noEmit             # 타입 검사만
npm test                     # 전체 테스트 (vitest)
npx drizzle-kit generate     # 스키마로 SQL 마이그레이션 생성
npx drizzle-kit migrate      # 마이그레이션 적용
```

## 구조

```
src/
├── app/dashboard/     # 대시보드 페이지와 Server Action
├── components/        # 뉴스 카드, 카테고리 바, 저장 버튼 등
├── db/                # Drizzle 스키마와 연결
├── lib/
│   ├── rss.ts         # 피드 수집·정규화
│   ├── claude.ts      # 기사별 번역·요약·분류
│   ├── import-news.ts # 가져오기 오케스트레이션
│   ├── notion.ts      # Notion MCP 서버로 페이지 생성
│   └── queries.ts     # DB 조회·저장
└── proxy.ts           # Clerk 로그인 확인 (Next.js 16의 middleware)
```

## 참고

- Notion 저장은 MCP 서버를 자식 프로세스로 실행하는 방식이라 서버리스 환경(예: Vercel)에서는 불안정할 수 있습니다. 배포 방식을 정하면 `src/lib/notion.ts`만 교체하면 됩니다.
- 요구사항은 [`PRD.md`](./PRD.md), 화면과 스타일 기준은 [`ui.md`](./ui.md)를 따릅니다.
