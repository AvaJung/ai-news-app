# UI 가이드

**AI 뉴스 수집기**의 화면 구성과 스타일 기준이다. 기능 요구사항은 `PRD.md`(6절, 9절)를 따르고, 이 문서는 "어떻게 보이는가"만 다룬다. 스타일은 Tailwind CSS v4 유틸리티 클래스로 작성한다.

## 1. 디자인 원칙

- **읽기 우선**: 한국어 제목과 요약이 가장 눈에 띄어야 한다. 장식은 최소화한다.
- **차분한 톤**: 흰 배경, 중립 회색, 포인트 색 하나(인디고)를 쓴다. 카테고리 구분 색만 예외다(2절).
- **여백으로 구분**: 진한 테두리나 그림자 대신 옅은 테두리와 넉넉한 여백으로 영역을 나눈다.
- **라이트/다크 모두 지원**: `globals.css`의 `prefers-color-scheme` 변수 방식을 유지하고, 컴포넌트에는 `dark:` 변형을 함께 쓴다.

## 2. 디자인 토큰

### 색상

| 용도 | 라이트 | 다크 | Tailwind |
|---|---|---|---|
| 페이지 배경 | 흰색 | 거의 검정 | `bg-background` (기존 변수) |
| 카드/패널 배경 | 흰색 | 진회색 | `bg-white dark:bg-neutral-900` |
| 카드 테두리 | 옅은 회색 | 진회색 | `border-neutral-200 dark:border-neutral-800` |
| 본문 텍스트 | 진회색 | 밝은 회색 | `text-neutral-800 dark:text-neutral-200` |
| 보조 텍스트(출처, 날짜) | 중간 회색 | 중간 회색 | `text-neutral-500 dark:text-neutral-400` |
| 포인트(선택 상태, 주요 버튼) | 인디고 | 인디고 | `bg-indigo-600 text-white` |
| 오류 | 빨강 | 빨강 | `text-red-600 dark:text-red-400` |

포인트 색은 "전체" 칩의 선택 상태, 주요 버튼, 링크에 쓴다.

**카테고리 색상**: 카테고리마다 구분 색을 따로 쓴다. 색은 DB에 저장하지 않고 카테고리 id로 `src/lib/category-colors.ts`의 8색 팔레트(rose, amber, emerald, sky, violet, orange, teal, fuchsia)에서 정한다. 칩은 평소에도 그 색의 연한 톤으로 채우고, 선택하면 진한 단색(흰 글자)에 같은 색 링이 붙는다. 카드의 카테고리 배지도 같은 색이다. 미분류는 회색이다. 인디고는 카테고리 색에 쓰지 않는다.

### 타이포그래피

- 본문 폰트는 한글이 잘 보이는 시스템 폰트 스택을 쓴다. 현재 `globals.css`의 `body`가 `Arial`로 고정되어 있어 한글이 기본 폰트로 떨어지므로, 구현 시 `font-family: var(--font-sans), "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`로 바꾼다.
- 크기: 페이지 제목 `text-xl font-semibold`, 카드 제목 `text-base font-semibold`, 본문/요약 `text-sm`, 메타 정보 `text-xs`.
- 요약 문장은 `leading-relaxed`로 줄 간격을 넉넉히 둔다.

### 간격과 모서리

- 페이지 좌우 여백 `px-4 sm:px-6`, 콘텐츠 최대 너비 `max-w-6xl mx-auto`.
- 카드 내부 여백 `p-5`, 카드 간격 `gap-4`.
- 모서리: 카드 `rounded-xl`, 버튼 `rounded-lg`, 칩 `rounded-full`.

## 3. 메인 화면(대시보드) 구조

위에서 아래로 다음 순서다.

```
┌──────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                  [뉴스 가져오기] [👤]  │  헤더
├──────────────────────────────────────────────────────┤
│ (전체) (모델·연구) (제품) (미분류) ... (+ 카테고리)    │  카테고리 영역
├──────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│ │ 뉴스 카드  │ │ 뉴스 카드  │ │ 뉴스 카드  │        │  카드 목록
│ └────────────┘ └────────────┘ └────────────┘        │
└──────────────────────────────────────────────────────┘
```

### 3.1 헤더

- 왼쪽에 앱 이름 "AI 뉴스 수집기", 오른쪽에 "뉴스 가져오기" 버튼과 Clerk `UserButton`.
- 스크롤해도 따라오게 하지 않는다(카테고리 영역이 화면을 덜 가리도록).
- 클래스 예: `flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800`.
- 가져오기 중에는 버튼을 비활성화하고 "가져오는 중…"과 진행 상황(예: `3/12`)을 표시한다.

### 3.2 카테고리 영역 (카드 목록 바로 위)

- 가로로 나열한 **칩(chip)** 형태다. 맨 앞은 항상 **"전체"**, 마지막 칩은 **"미분류"**, 그 뒤(목록의 맨 끝)에 **카테고리 추가 버튼**이 온다.
- 칩이 한 줄을 넘으면 줄바꿈한다(`flex flex-wrap gap-2`). 모바일에서는 가로 스크롤(`overflow-x-auto`)로 바꿔도 된다.
- 기본 칩: `rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800`.
- 선택된 칩: `border-indigo-600 bg-indigo-600 text-white`. 한 번에 하나만 선택된다.
- 칩 안에 해당 카테고리의 기사 수를 작게 붙인다(`ml-1.5 text-xs opacity-70`).
- **카테고리 추가 버튼**: 칩과 같은 크기의 점선 테두리 버튼이다. `+` 아이콘과 "카테고리 추가" 문구를 쓰고, 칩들과 시각적으로 구분되도록 점선으로 한다.
  - 클래스 예: `rounded-full border border-dashed border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-500 hover:border-indigo-600 hover:text-indigo-600 dark:border-neutral-700`.
  - 누르면 모달이 열린다(3.4절).
- 카테고리 수정·삭제는 칩의 호버/포커스 시 나타나는 작은 편집 아이콘으로 진입한다(모달 재사용). 모바일에서는 칩을 길게 눌러 연다.

### 3.3 뉴스 카드 목록

- 반응형 그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`.
- 선택한 카테고리에 맞는 카드만 보여준다. 정렬은 발행일 최신순.
- 비어 있을 때: 가운데 정렬 안내 문구("아직 가져온 뉴스가 없어요. 위의 ‘뉴스 가져오기’를 눌러 보세요.")를 `text-sm text-neutral-500`으로 표시한다.

### 3.4 카테고리 추가/수정 모달

- 화면 중앙의 작은 패널(`max-w-md rounded-xl p-6`)과 반투명 배경(`bg-black/40`).
- 입력: **이름**(필수), **설명**(선택, "Claude가 분류할 때 참고하는 힌트" 안내 문구 포함).
- 하단 버튼: 취소(보조) / 저장(주요). 수정 모달에는 왼쪽에 삭제(빨강 텍스트) 버튼을 둔다. 삭제 전에 "이 카테고리의 기사는 미분류가 됩니다" 확인 문구를 보여준다.
- 열릴 때 이름 입력에 포커스, `Esc`로 닫힘.

## 4. 뉴스 카드

카드는 세로로 쌓은 구조다.

```
[카테고리 칩]                         출처 · 발행일
한국어 제목 (최대 2줄)
한국어 요약 (최대 4줄)
─────────────────────────────────────
원문 보기 ↗                [Notion 저장]
```

- 컨테이너: `flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900`.
- **상단 줄**: 왼쪽에 카테고리 라벨(작은 둥근 배지, `bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300`, `text-xs`), 오른쪽에 출처와 발행일(`text-xs text-neutral-500`). 미분류는 회색 배지를 쓴다.
- **제목**: `mt-3 text-base font-semibold leading-snug line-clamp-2`.
- **요약**: `mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-4`.
- **하단 줄**: `mt-auto pt-4`로 카드 바닥에 붙이고 위에 옅은 구분선을 둔다. 왼쪽 "원문 보기 ↗"(새 탭, `rel="noopener noreferrer"`), 오른쪽 Notion 저장 버튼.
- 영어 원제는 카드에 표시하지 않는다. 필요하면 원문 링크의 `title` 속성으로만 둔다.

### Notion 저장 버튼 상태

| 상태 | 표시 | 스타일 |
|---|---|---|
| 기본 | "Notion 저장" | 테두리 버튼 `border border-neutral-300 hover:bg-neutral-100` |
| 저장 중 | "저장 중…" | 비활성, 흐리게(`opacity-60`) |
| 저장됨 | "저장됨 ✓" + Notion 페이지 링크 | 비활성 느낌의 초록 계열 텍스트, 링크는 인디고 |
| 실패 | 카드 하단에 오류 문구 + "다시 시도" | `text-red-600`, 버튼은 기본 상태로 복귀 |

## 5. 컴포넌트 구성 제안

`src/components/` 아래에 둔다. 서버/클라이언트 경계는 상호작용이 있는 것만 `"use client"`로 한다.

| 컴포넌트 | 역할 | 클라이언트 |
|---|---|---|
| `Header` | 앱 이름, 가져오기 버튼, UserButton | 일부(가져오기 버튼) |
| `CategoryBar` | 칩 목록 + 추가 버튼, 선택 상태 | 예 |
| `CategoryDialog` | 카테고리 추가/수정/삭제 모달 | 예 |
| `NewsGrid` | 카드 그리드, 빈 상태 | 아니오 |
| `NewsCard` | 카드 한 장 | 아니오 |
| `NotionSaveButton` | 저장 상태별 버튼 | 예 |

선택된 카테고리는 URL 쿼리(`?category=<id>`)로 보관해 새로고침과 공유에 안전하게 한다.

## 6. 반응형

| 너비 | 카드 열 | 비고 |
|---|---|---|
| 모바일 (`<640px`) | 1열 | 카테고리 칩은 줄바꿈 또는 가로 스크롤, 헤더 버튼은 아이콘 위주 |
| 태블릿 (`sm`) | 2열 | |
| 데스크톱 (`lg`) | 3열 | 콘텐츠 최대 너비 `max-w-6xl` |

## 7. 접근성

- 칩은 `button`이며 선택 상태를 `aria-pressed`로 알린다. 카테고리 영역은 `role="group"`과 `aria-label="카테고리"`를 둔다.
- 모달은 포커스를 가두고 닫을 때 열었던 버튼으로 포커스를 돌려준다. `role="dialog"`, `aria-modal="true"`를 쓴다.
- 포커스 링을 지우지 않는다(`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다.
- 본문 텍스트 대비는 WCAG AA(4.5:1) 이상을 유지한다. 보조 텍스트도 `neutral-500` 이상 진하게 쓴다.

## 8. 아직 정해지지 않은 것

- 뉴스 가져오기 **진행 표시 방식**(PRD 14절): 스피너와 카운트로 시작하고, 이후 스트리밍/폴링 방식이 정해지면 헤더 버튼 영역을 갱신한다.
- 첫 실행 시 **기본 카테고리 시드** 여부: 시드하지 않으면 카테고리 영역에 "전체", "미분류", "카테고리 추가"만 보이는 상태가 첫 화면이 된다. 이때 추가 버튼을 눈에 띄게(`text-indigo-600`) 처리한다.
