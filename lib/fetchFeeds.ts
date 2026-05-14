import Parser from "rss-parser";
import { FEED_SOURCES, FEED_USER_AGENT } from "./feeds";
import type { FeedArticle, PublicationId } from "./types";
import { createHash } from "crypto";

const parser = new Parser({
  headers: {
    "User-Agent": FEED_USER_AGENT,
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  // Keep below ~8s so parallel fetches stay inside Vercel Hobby ~10s function limit.
  timeout: 8000,
});

function articleId(parts: string[]): string {
  return createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 14);
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchPublicationFeed(
  publication: PublicationId,
): Promise<FeedArticle[]> {
  const source = FEED_SOURCES.find((s) => s.id === publication);
  if (!source) return [];

  try {
    const feed = await parser.parseURL(source.url);
    const items = feed.items ?? [];
    return items.slice(0, 12).map((item) => {
      const title = stripHtml(item.title ?? "Untitled item");
      const summary = stripHtml(
        item.contentSnippet ?? item.content ?? item.summary ?? "",
      );
      const link = item.link ?? "#";
      const publishedAt = item.isoDate ?? item.pubDate ?? null;
      return {
        id: articleId([source.id, link, title]),
        publication: source.id,
        publicationLabel: source.label,
        title,
        link,
        summary: summary || title,
        publishedAt,
        feedNote: source.note,
      } satisfies FeedArticle;
    });
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(): Promise<FeedArticle[]> {
  const batches = await Promise.all(
    FEED_SOURCES.map((s) => fetchPublicationFeed(s.id)),
  );
  return batches.flat();
}
