import { fetchAllFeeds } from "./fetchFeeds";
import { buildStudyPack } from "./generatePack";
import { FEED_SOURCES } from "./feeds";
import type { ArticleStudyPack } from "./types";

export interface DashboardPayload {
  generatedAt: string;
  sources: { id: string; label: string; note?: string }[];
  articleCount: number;
  packs: ArticleStudyPack[];
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const articles = await fetchAllFeeds();
  const packs = articles.map((a) => buildStudyPack(a));
  packs.sort((a, b) => {
    const da = a.article.publishedAt
      ? Date.parse(a.article.publishedAt)
      : 0;
    const db = b.article.publishedAt
      ? Date.parse(b.article.publishedAt)
      : 0;
    return db - da;
  });

  return {
    generatedAt: new Date().toISOString(),
    sources: FEED_SOURCES.map((s) => ({
      id: s.id,
      label: s.label,
      note: s.note,
    })),
    articleCount: articles.length,
    packs,
  };
}
