import Link from "next/link";
import { formatDownloads, type NpmStats } from "../lib/npm";
import { GITHUB_URL, NPM_URL } from "../lib/site";

export function HeaderCtas({ stats }: { stats: NpmStats }) {
  const version = stats.version ? `v${stats.version}` : null;
  const downloads =
    stats.weeklyDownloads != null
      ? `${formatDownloads(stats.weeklyDownloads)}/wk`
      : null;

  return (
    <div className="header-ctas">
      <a className="btn btn-ghost btn-compact" href={GITHUB_URL}>
        GitHub
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
