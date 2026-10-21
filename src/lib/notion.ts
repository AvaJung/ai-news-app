import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";

export type NotionArticle = {
  sourceUrl: string;
  originalTitle: string;
  titleKo: string | null;
  summaryKo: string | null;
  source: string;
  publishedAt: Date;
  categoryName: string | null;
};

// Notion rich_text 한 덩어리의 길이 제한이 2000자다.
const RICH_TEXT_LIMIT = 2000;

export function buildPageArgs(
  article: NotionArticle,
  opts: { databaseId: string; titleProperty?: string },
) {
  const properties: Record<string, unknown> = {
    [opts.titleProperty ?? "Name"]: {
      title: [
        {
          text: {
            content: article.titleKo ?? article.originalTitle,
          },
        },
      ],
    },
    출처: { select: { name: article.source } },
    카테고리: { select: { name: article.categoryName ?? "미분류" } },
    "원문 URL": { url: article.sourceUrl },
    발행일: { date: { start: article.publishedAt.toISOString() } },
  };
  if (article.summaryKo) {
    properties["요약"] = {
      rich_text: [
        { text: { content: article.summaryKo.slice(0, RICH_TEXT_LIMIT) } },
      ],
    };
  }
  return {
    parent: { database_id: opts.databaseId },
    properties,
  };
}

// 도구 응답은 JSON 텍스트이고, 오류는 isError가 아니라 {status:"error", message}로 온다.
export function parsePageResponse(result: unknown): { url: string } {
  const content = (result as { content?: { type: string; text?: string }[] })
    .content;
  const text = content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Notion 응답이 비어 있습니다.");

  let body: { status?: string; message?: string; url?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Notion 응답을 해석하지 못했습니다: ${text.slice(0, 200)}`);
  }
  if (body.status === "error" || (result as { isError?: boolean }).isError) {
    throw new Error(body.message ?? "Notion 저장에 실패했습니다.");
  }
  if (!body.url) throw new Error("Notion 응답에 페이지 URL이 없습니다.");
  return { url: body.url };
}

// 기사 1건을 Notion 데이터베이스에 저장하고 페이지 URL을 반환한다.
// MCP 서버를 자식 프로세스로 띄우므로 배포 방식이 바뀌면 이 함수만 교체한다.
export async function saveArticleToNotion(
  article: NotionArticle,
): Promise<{ url: string }> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("NOTION_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았습니다.");
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.join(
        process.cwd(),
        "node_modules/@notionhq/notion-mcp-server/bin/cli.mjs",
      ),
    ],
    env: { ...getDefaultEnvironment(), NOTION_TOKEN: token },
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: "API-post-page",
      arguments: buildPageArgs(article, {
        databaseId,
        titleProperty: process.env.NOTION_TITLE_PROPERTY,
      }),
    });
    return parsePageResponse(result);
  } finally {
    await client.close().catch(() => {});
  }
}
