import { getPosts } from "@/lib/db";
import Header from "@/components/Header";
import WebTerminal from "@/components/WebTerminal";

export const dynamic = "force-dynamic";

export default function TerminalPage() {
  let posts;
  try {
    posts = getPosts(undefined, 100);
  } catch {
    posts = [];
  }

  return (
    <div className="main-container min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--accent)] mb-2">Terminal Mode</h1>
          <p className="text-sm text-gray-500">
            Browse robotics news the hacker way. Type <code className="text-[var(--accent)]">help</code> to get started.
          </p>
        </div>

        <WebTerminal posts={posts} />

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 mb-2">
            Want the real terminal experience?
          </p>
          <code className="text-[var(--accent)] bg-[#111] px-4 py-2 rounded font-mono text-sm">
            npx robo-news
          </code>
        </div>
      </main>
    </div>
  );
}
