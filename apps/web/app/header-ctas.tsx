"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDownloads, type NpmStats } from "../lib/npm-format";
import { GITHUB_URL, NPM_URL } from "../lib/site";

export function HeaderCtas({ stats: initial }: { stats: NpmStats }) {
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
        /* keep SSR values */
      }
    }

    void refresh();
    const id = window.setInterval(() => void refresh(), 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const version = stats.version ? `v${stats.version}` : null;
  const downloads =
    stats.weeklyDownloads != null
      ? `${formatDownloads(stats.weeklyDownloads)}/wk`
      : stats.monthlyDownloads != null
        ? `${formatDownloads(stats.monthlyDownloads)}/mo`
        : null;

  return (
    <div className="header-ctas">
      <a className="btn btn-ghost btn-compact" href={GITHUB_URL}>
        GitHub
        {stats.githubStars != null ? (
          <span className="npm-pill-dl">
            ★ {formatDownloads(stats.githubStars)}
          </span>
        ) : null}
      </a>
      <a className="btn btn-ghost btn-compact npm-pill" href={NPM_URL}>
        <span>npm</span>
        {version ? <span className="npm-pill-ver">{version}</span> : null}
        {downloads ? <span className="npm-pill-dl">{downloads}</span> : null}
      </a>
      <Link className="btn btn-primary btn-compact" href="/#skills">
        Get started
      </Link>
    </div>
  );
}
