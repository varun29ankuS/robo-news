import { fetchAllFeeds } from "../lib/rss";

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║      ROBO-NEWS RSS FETCHER             ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");

  console.log("Fetching feeds...\n");

  const results = await fetchAllFeeds();

  console.log("Results:");
  console.log("─".repeat(40));

  let totalNew = 0;

  for (const result of results) {
    const status = result.success ? "✓" : "✗";
    const count = result.success ? `+${result.count} new` : result.error;
    console.log(`${status} ${result.source.padEnd(15)} ${count}`);
    if (result.success) totalNew += result.count;
  }

  console.log("─".repeat(40));
  console.log(`Total new posts: ${totalNew}`);
  console.log("\nDone!");
}

main().catch(console.error);
