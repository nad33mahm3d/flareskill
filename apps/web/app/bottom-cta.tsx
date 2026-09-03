import Link from "next/link";
import { CopyCommand } from "./copy-command";
import { NPM_URL } from "../lib/site";

export function BottomCta() {
  return (
    <section className="cta-band">
      <div className="cta-band-copy">
        <p className="kicker">Start installing</p>
        <h2>Ship better AI agents with reusable skills</h2>
        <p>
          Install agent skills in seconds, lock versions with your team, and
          keep Cursor, Claude Code, and Codex in sync.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="/#skills">
            Browse AI skills
          </a>
          <Link className="btn btn-ghost" href="/blog/getting-started">
            Read the guide
          </Link>
          <a className="btn btn-ghost" href={NPM_URL}>
            View on npm
          </a>
        </div>
      </div>
      <CopyCommand command="npx flareskill init" />
    </section>
  );
}
