import Link from "next/link";
import { CopyCommand } from "./copy-command";
import { SkillSearch } from "./skill-search";
import { getRegistry } from "../lib/registry";

export default function HomePage() {
  const { skills, profiles = [] } = getRegistry();

  return (
    <>
      <section className="hero">
        <p className="kicker">Open-source skill registry</p>
        <h1>Reusable skills for AI coding agents</h1>
        <p className="lede">
          Versioned instructions for Cursor, Claude Code, Codex, and generic
          agents. Search the catalog, install with one command, lock versions
          with your team.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#skills">
            Browse skills
          </a>
          <Link className="btn btn-ghost" href="/profiles">
            View profiles
          </Link>
        </div>
        <CopyCommand command="npx flareskill install senior-react-engineer --agent cursor" />
      </section>

      {profiles.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2>Profiles</h2>
            <Link href="/profiles">See all</Link>
          </div>
          <p className="section-lede">
            Install a whole stack at once.
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
          <h2>Skills</h2>
        </div>
        <SkillSearch skills={skills} />
      </section>
    </>
  );
}
