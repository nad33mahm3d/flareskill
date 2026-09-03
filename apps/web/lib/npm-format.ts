export type NpmStats = {
  version: string | null;
  weeklyDownloads: number | null;
  monthlyDownloads: number | null;
  totalDownloads: number | null;
  githubStars: number | null;
  fetchedAt: string;
};

export function formatDownloads(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

export function formatStat(value: number | null, empty = "—"): string {
  if (value == null) {
    return empty;
  }
  return formatDownloads(value);
}
