import {
  formatDownloads,
  formatStat,
  type NpmStats,
} from "./npm-format";

export type { NpmStats };
export { formatDownloads, formatStat };

const PACKAGE = "flareskill";
const GITHUB_REPO = "nad33mahm3d/flareskill";

async function readJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function downloadsFromPayload(data: { downloads?: number } | null): number | null {
  if (data && typeof data.downloads === "number") {
    return data.downloads;
  }
  return null;
}

function emptyStats(): NpmStats {
  return {
    version: null,
    weeklyDownloads: null,
    monthlyDownloads: null,
    totalDownloads: null,
    githubStars: null,
    fetchedAt: new Date().toISOString(),
  };
}

async function loadStats(init: RequestInit): Promise<NpmStats> {
  const githubInit: RequestInit = {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Accept: "application/vnd.github+json",
      "User-Agent": "flareskill-web",
    },
  };

  const [pkg, week, month, total, github] = await Promise.all([
    readJson<{ version?: string }>(
      `https://registry.npmjs.org/${PACKAGE}/latest`,
      init,
    ),
    readJson<{ downloads?: number }>(
      `https://api.npmjs.org/downloads/point/last-week/${PACKAGE}`,
      init,
    ),
    readJson<{ downloads?: number }>(
      `https://api.npmjs.org/downloads/point/last-month/${PACKAGE}`,
      init,
    ),
    readJson<{ downloads?: number }>(
      `https://api.npmjs.org/downloads/point/last-year/${PACKAGE}`,
      init,
    ),
    readJson<{ stargazers_count?: number }>(
      `https://api.github.com/repos/${GITHUB_REPO}`,
      githubInit,
    ),
  ]);

  return {
    version: typeof pkg?.version === "string" ? pkg.version : null,
    weeklyDownloads: downloadsFromPayload(week),
    monthlyDownloads: downloadsFromPayload(month),
    totalDownloads: downloadsFromPayload(total),
    githubStars:
      typeof github?.stargazers_count === "number"
        ? github.stargazers_count
        : null,
    fetchedAt: new Date().toISOString(),
  };
}

/** Fresh stats for API routes (always hit upstream). */
export async function fetchNpmStatsLive(): Promise<NpmStats> {
  try {
    return await loadStats({ cache: "no-store" });
  } catch {
    return emptyStats();
  }
}

/** Cached for ISR pages (5 minutes). */
export async function getNpmStats(): Promise<NpmStats> {
  try {
    return await loadStats({ next: { revalidate: 300 } });
  } catch {
    return emptyStats();
  }
}
