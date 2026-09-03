export type NpmStats = {
  version: string | null;
  weeklyDownloads: number | null;
};

const revalidate = { next: { revalidate: 3600 } } as const;

export async function getNpmStats(): Promise<NpmStats> {
  try {
    const [downloadsRes, pkgRes] = await Promise.all([
      fetch("https://api.npmjs.org/downloads/point/last-week/flareskill", revalidate),
      fetch("https://registry.npmjs.org/flareskill/latest", revalidate),
    ]);

    let weeklyDownloads: number | null = null;
    if (downloadsRes.ok) {
      const data = (await downloadsRes.json()) as { downloads?: number };
      if (typeof data.downloads === "number") {
        weeklyDownloads = data.downloads;
      }
    }

    let version: string | null = null;
    if (pkgRes.ok) {
      const data = (await pkgRes.json()) as { version?: string };
      if (typeof data.version === "string") {
        version = data.version;
      }
    }

    return { version, weeklyDownloads };
  } catch {
    return { version: null, weeklyDownloads: null };
  }
}

export function formatDownloads(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}
