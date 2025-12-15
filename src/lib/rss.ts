import Parser from "rss-parser";
import { feeds, type FeedSource } from "./sources";
import { insertPost } from "./db";
import { detectDomain } from "./tagger";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "RoboNews/1.0 (https://robo-news.com)",
  },
});

interface FetchResult {
  source: string;
  success: boolean;
  count: number;
  error?: string;
}

async function fetchFeed(feed: FeedSource): Promise<FetchResult> {
  try {
    const result = await parser.parseURL(feed.url);
    let count = 0;

    for (const item of result.items) {
      if (!item.title || !item.link) continue;

      const domain = detectDomain(item.title, item.contentSnippet);
      const published = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      const description = item.contentSnippet?.trim().slice(0, 500) || null;

      const inserted = insertPost({
        title: item.title.trim(),
        url: item.link,
        source: feed.source,
        domain,
        description,
        published_at: published,
      });

      if (inserted) count++;
    }

    return { source: feed.source, success: true, count };
  } catch (error) {
    return {
      source: feed.source,
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchAllFeeds(): Promise<FetchResult[]> {
  const results = await Promise.allSettled(feeds.map(fetchFeed));

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      source: feeds[index].source,
      success: false,
      count: 0,
      error: "Promise rejected",
    };
  });
}
