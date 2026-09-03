import { fetchNpmStatsLive } from "../../../lib/npm";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const stats = await fetchNpmStatsLive();
  return Response.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
