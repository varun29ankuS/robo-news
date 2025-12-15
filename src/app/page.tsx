import { getPosts, getPostCount, Post } from "@/lib/db";
import { domains } from "@/lib/sources";
import Header from "@/components/Header";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  return <HomePageWrapper searchParams={searchParams} />;
}

async function HomePageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const params = await searchParams;
  const domain = params.domain || "all";

  const validDomain = domains.some((d) => d.id === domain) ? domain : "all";

  let posts: Post[] = [];
  let totalCount = 0;
  try {
    posts = getPosts(validDomain);
    totalCount = getPostCount();
  } catch {
    // Database error - use empty posts
  }

  return (
    <div className="main-container min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full px-6 py-8">
        <HomeContent initialPosts={posts} initialDomain={validDomain} totalCount={totalCount} />
      </main>

      <footer className="border-t border-gray-900 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-xs font-mono">ROBO-NEWS</span>
              <span className="text-gray-800">|</span>
              <span className="text-gray-700 text-xs">Aggregating robotics news</span>
            </div>
            <div className="text-gray-700 text-xs">
              © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
