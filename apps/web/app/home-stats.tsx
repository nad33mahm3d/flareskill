"use client";

import { useEffect, useState } from "react";
import { formatStat, type NpmStats } from "../lib/npm-format";
import { GITHUB_URL, NPM_URL } from "../lib/site";

export function HomeStats({
  skillCount,
  profileCount,
  initial,
}: {
  skillCount: number;
  profileCount: number;
  initial: NpmStats;
}) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    let cancelled = false;

    async function refresh(): Promise<void> {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) {
          return;
        }
        const next = (await res.json()) as NpmStats;
        if (!cancelled) {
          setStats(next);
        }
      } catch {
        /* keep SSR */
      }
    }

    void refresh();
    const id = window.setInterval(() => void refresh(), 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <dl className="stats">
      <div className="stat">
        <dt className="stat-label">Agent skills</dt>
        <dd className="stat-value">{skillCount}</dd>
      </div>
      <div className="stat">
        <dt className="stat-label">Profiles</dt>
        <dd className="stat-value">{profileCount}</dd>
      </div>
      <div className="stat">
        <dt className="stat-label">npm version</dt>
        <dd className="stat-value">
          <a href={NPM_URL}>
            {stats.version ? `v${stats.version}` : "—"}
          </a>
        </dd>
      </div>
      <div className="stat">
        <dt className="stat-label">npm this week</dt>
        <dd className="stat-value">{formatStat(stats.weeklyDownloads)}</dd>
      </div>
      <div className="stat">
        <dt className="stat-label">npm this month</dt>
        <dd className="stat-value">{formatStat(stats.monthlyDownloads)}</dd>
      </div>
      <div className="stat">
        <dt className="stat-label">GitHub stars</dt>
        <dd className="stat-value">
          <a href={GITHUB_URL}>{formatStat(stats.githubStars)}</a>
        </dd>
      </div>
    </dl>
  );
}
