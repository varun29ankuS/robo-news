import { sql } from "@vercel/postgres";

export interface Post {
  id: number;
  title: string;
  url: string;
  source: string;
  domain: string;
  description: string | null;
  published_at: string;
  fetched_at: string;
  points: number;
}

let initialized = false;

async function initDb() {
  if (initialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        source TEXT,
        domain TEXT,
        description TEXT,
        published_at TIMESTAMP,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points INTEGER DEFAULT 1
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_domain ON posts(domain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_published ON posts(published_at DESC)`;

    initialized = true;
  } catch (err) {
    console.warn("Failed to initialize database:", err);
  }
}

export async function insertPost(post: Omit<Post, "id" | "fetched_at" | "points">): Promise<boolean> {
  try {
    await initDb();
    await sql`
      INSERT INTO posts (title, url, source, domain, description, published_at)
      VALUES (${post.title}, ${post.url}, ${post.source}, ${post.domain}, ${post.description}, ${post.published_at})
      ON CONFLICT (url) DO NOTHING
    `;
    return true;
  } catch {
    return false;
  }
}

export async function getPosts(domain?: string, limit = 200): Promise<Post[]> {
  try {
    await initDb();
    if (domain && domain !== "all") {
      const { rows } = await sql`
        SELECT * FROM posts WHERE domain = ${domain} ORDER BY published_at DESC LIMIT ${limit}
      `;
      return rows as Post[];
    }
    const { rows } = await sql`
      SELECT * FROM posts ORDER BY published_at DESC LIMIT ${limit}
    `;
    return rows as Post[];
  } catch {
    return [];
  }
}

export async function upvotePost(id: number): Promise<void> {
  try {
    await initDb();
    await sql`UPDATE posts SET points = points + 1 WHERE id = ${id}`;
  } catch {
    // Ignore errors
  }
}

export async function getPostCount(domain?: string): Promise<number> {
  try {
    await initDb();
    if (domain && domain !== "all") {
      const { rows } = await sql`SELECT COUNT(*) as count FROM posts WHERE domain = ${domain}`;
      return Number(rows[0]?.count || 0);
    }
    const { rows } = await sql`SELECT COUNT(*) as count FROM posts`;
    return Number(rows[0]?.count || 0);
  } catch {
    return 0;
  }
}
