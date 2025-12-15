import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "db", "robo.sqlite");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    domain TEXT,
    description TEXT,
    published_at TEXT,
    fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
    points INTEGER DEFAULT 1
  )
`);

try {
  db.exec(`ALTER TABLE posts ADD COLUMN description TEXT`);
} catch {
  // Column already exists
}

db.exec(`CREATE INDEX IF NOT EXISTS idx_domain ON posts(domain)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_published ON posts(published_at DESC)`);

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

export function insertPost(post: Omit<Post, "id" | "fetched_at" | "points">): boolean {
  try {
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO posts (title, url, source, domain, description, published_at) VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(post.title, post.url, post.source, post.domain, post.description, post.published_at);
    return true;
  } catch {
    return false;
  }
}

export function getPosts(domain?: string, limit = 200): Post[] {
  if (domain && domain !== "all") {
    const stmt = db.prepare(
      `SELECT * FROM posts WHERE domain = ? ORDER BY published_at DESC LIMIT ?`
    );
    return stmt.all(domain, limit) as Post[];
  }
  const stmt = db.prepare(
    `SELECT * FROM posts ORDER BY published_at DESC LIMIT ?`
  );
  return stmt.all(limit) as Post[];
}

export function upvotePost(id: number): void {
  const stmt = db.prepare(`UPDATE posts SET points = points + 1 WHERE id = ?`);
  stmt.run(id);
}

export function getPostCount(domain?: string): number {
  if (domain && domain !== "all") {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM posts WHERE domain = ?`);
    const result = stmt.get(domain) as { count: number };
    return result.count;
  }
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM posts`);
  const result = stmt.get() as { count: number };
  return result.count;
}

export { db };
