import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  // Simple auth via query param (you can make this more secure)
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.FETCH_SECRET && process.env.FETCH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting RSS fetch...");
    const results = await fetchAllFeeds();

    const totalNew = results.reduce((sum, r) => sum + (r.success ? r.count : 0), 0);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalNew,
        sourcesSuccessful: successful,
        sourcesFailed: failed,
      },
      results,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
