import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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

let db: Database.Database | null = null;

function getDb(): Database.Database | null {
  if (db) return db;

  try {
    const dbDir = path.join(process.cwd(), "db");
    const dbPath = path.join(dbDir, "robo.sqlite");

    // Check if directory exists
    if (!fs.existsSync(dbDir)) {
      console.warn("Database directory does not exist, running in read-only mode");
      return null;
    }

    db = new Database(dbPath);

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

    return db;
  } catch (err) {
    console.warn("Failed to initialize database:", err);
    return null;
  }
}

export function insertPost(post: Omit<Post, "id" | "fetched_at" | "points">): boolean {
  const database = getDb();
  if (!database) return false;

  try {
    const stmt = database.prepare(
      `INSERT OR IGNORE INTO posts (title, url, source, domain, description, published_at) VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(post.title, post.url, post.source, post.domain, post.description, post.published_at);
    return true;
  } catch {
    return false;
  }
}

export function getPosts(domain?: string, limit = 200): Post[] {
  const database = getDb();
  if (!database) return [];

  try {
    if (domain && domain !== "all") {
      const stmt = database.prepare(
        `SELECT * FROM posts WHERE domain = ? ORDER BY published_at DESC LIMIT ?`
      );
      return stmt.all(domain, limit) as Post[];
    }
    const stmt = database.prepare(
      `SELECT * FROM posts ORDER BY published_at DESC LIMIT ?`
    );
    return stmt.all(limit) as Post[];
  } catch {
    return [];
  }
}

export function upvotePost(id: number): void {
  const database = getDb();
  if (!database) return;

  try {
    const stmt = database.prepare(`UPDATE posts SET points = points + 1 WHERE id = ?`);
    stmt.run(id);
  } catch {
    // Ignore errors
  }
}

export function getPostCount(domain?: string): number {
  const database = getDb();
  if (!database) return 0;

  try {
    if (domain && domain !== "all") {
      const stmt = database.prepare(`SELECT COUNT(*) as count FROM posts WHERE domain = ?`);
      const result = stmt.get(domain) as { count: number };
      return result.count;
    }
    const stmt = database.prepare(`SELECT COUNT(*) as count FROM posts`);
    const result = stmt.get() as { count: number };
    return result.count;
  } catch {
    return 0;
  }
}

export { db };
