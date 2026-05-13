import type { PublicationId } from "./types";

export interface FeedSource {
  id: PublicationId;
  label: string;
  url: string;
  /** Explains sourcing when not a first-party RSS endpoint */
  note?: string;
}

/**
 * Native RSS where stable; Google News RSS used only where publishers do not expose a reliable public feed.
 * Google News feeds are subject to https://news.google.com/rss terms (personal, non-commercial reader use).
 */
export const FEED_SOURCES: FeedSource[] = [
  {
    id: "ft",
    label: "Financial Times",
    url: "https://www.ft.com/world?format=rss",
  },
  {
    id: "economist",
    label: "The Economist",
    url: "https://www.economist.com/finance-and-economics/rss.xml",
  },
  {
    id: "times",
    label: "The Times",
    url: "https://news.google.com/rss/search?q=site:thetimes.co.uk+OR+site:thetimes.com+(inflation+OR+GDP+OR+interest+rates+OR+economy+OR+markets+OR+trade+OR+fiscal+OR+bank+OR+wages)&hl=en-GB&gl=GB&ceid=GB:en",
    note: "The Times does not publish a stable public RSS endpoint; this feed lists recent Google News results from thetimes.co.uk / thetimes.com filtered for economics-related keywords.",
  },
  {
    id: "moneyweek",
    label: "MoneyWeek",
    url: "https://moneyweek.com/feeds.xml",
  },
  {
    id: "spectator",
    label: "The Spectator",
    url: "https://news.google.com/rss/search?q=site:spectator.co.uk+(economy+OR+markets+OR+inflation+OR+tax+OR+trade+OR+fiscal+OR+wages+OR+GDP)&hl=en-GB&gl=GB&ceid=GB:en",
    note: "The Spectator’s on-site RSS feed is unreliable from automated servers; this feed lists recent Google News results from spectator.co.uk filtered for economics-related keywords.",
  },
];

export const FEED_USER_AGENT =
  "EdexcelEconomicsNewsLab/0.1 (+https://example.local; classroom RSS aggregation)";
