import Link from "next/link";
import { BottomCta } from "./bottom-cta";
import { CopyCommand } from "./copy-command";
import { SkillSearch } from "./skill-search";
import { JsonLd, websiteJsonLd } from "../lib/json-ld";
import { getNpmStats, formatDownloads } from "../lib/npm";
import { getRegistry } from "../lib/registry";
import { GITHUB_URL, NPM_URL } from "../lib/site";

export default async function HomePage() {
  const { skills, profiles = [] } = getRegistry();
  const npm = await getNpmStats();

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <section className="hero">
        <p className="kicker">AI agent skills registry</p>
        <h1>Open-source AI skills for coding agents</h1>
        <p className="lede">
          FlareSkill is a registry and CLI for reusable agent skills. Search
          versioned AI skills, install them into Cursor, Claude Code, or Codex,
          and lock the same set for your whole team.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#skills">
            Browse AI skills
          </a>
          <Link className="btn btn-ghost" href="/profiles">
            Skill profiles
          </Link>
          <Link className="btn btn-ghost" href="/blog/getting-started">
            Get started guide
          </Link>
          <a className="btn btn-ghost" href={NPM_URL}>
            Install from npm
          </a>
        </div>
        <CopyCommand command="npx flareskill install senior-react-engineer --agent cursor" />
        <dl className="stats">
          <div className="stat">
            <dt className="stat-label">Agent skills</dt>
            <dd className="stat-value">{skills.length}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Profiles</dt>
            <dd className="stat-value">{profiles.length}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">npm this week</dt>
            <dd className="stat-value">
              {npm.weeklyDownloads != null
                ? formatDownloads(npm.weeklyDownloads)
                : "—"}
            </dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Source</dt>
            <dd className="stat-value">
              <a href={GITHUB_URL}>GitHub</a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Works with your agents</h2>
        </div>
        <p className="section-lede">
          One AI skill package, multiple coding agents.
        </p>
        <div className="agents">
          <article className="agent-card">
            <h3>Cursor</h3>
            <p>
              Install into <code>.cursor/skills/</code> with{" "}
              <code>--agent cursor</code>.
            </p>
          </article>
          <article className="agent-card">
            <h3>Claude Code</h3>
            <p>
              Lands in <code>.claude/skills/</code> for Anthropic’s CLI agent.
            </p>
          </article>
          <article className="agent-card">
            <h3>Codex</h3>
            <p>
              Copies to <code>.agents/skills/</code> (or{" "}
              <code>~/.codex/skills</code> globally).
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Why agent skills</h2>
        </div>
        <p className="section-lede">
          Treat prompts like packages—searchable, versioned, and shareable.
        </p>
        <div className="steps">
          <article className="step">
            <span className="step-num">01</span>
            <h3>Find an AI skill</h3>
            <p>Search the registry by stack, tags, or agent.</p>
          </article>
          <article className="step">
            <span className="step-num">02</span>
            <h3>Install once</h3>
            <p>
              <code>npx flareskill install</code> copies it into Cursor, Claude
              Code, or Codex.
            </p>
          </article>
          <article className="step">
            <span className="step-num">03</span>
            <h3>Lock the team</h3>
            <p>
              <code>flareskill.lock</code> pins versions so everyone gets the
              same agent skills.
            </p>
          </article>
        </div>
      </section>

      {profiles.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2>Skill profiles</h2>
            <Link href="/profiles">See all</Link>
          </div>
          <p className="section-lede">
            Install a whole stack of agent skills with one command.
          </p>
          <div className="grid grid-2">
            {profiles.map((profile) => (
              <Link
                className="card card-profile"
                href={`/profiles/${profile.name}`}
                key={profile.name}
              >
                <div className="card-top">
                  <h2>{profile.name}</h2>
                  <span className="pill">{profile.skills.length} skills</span>
                </div>
                <p>{profile.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section" id="skills">
        <div className="section-head">
          <h2>Browse AI skills</h2>
        </div>
        <p className="section-lede">
          Official agent skills you can install today.
        </p>
        <SkillSearch skills={skills} />
      </section>

      <BottomCta />
    </>
  );
}
