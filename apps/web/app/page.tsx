import Link from "next/link";
import { SkillSearch } from "./skill-search";
import { getRegistry } from "../lib/registry";

export default function HomePage() {
  const { skills, profiles = [] } = getRegistry();

  return (
    <>
      <h1>Reusable AI agent skills</h1>
      <p className="lede">
        Discover versioned skills for Cursor, Claude Code, Codex, and generic
        agents. Install with one command.
      </p>
      <pre>
        {`npx flareskill install senior-react-engineer --agent cursor`}
      </pre>
      {profiles.length > 0 ? (
        <section style={{ margin: "32px 0" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "1.15rem" }}>Profiles</h2>
          <div className="grid">
            {profiles.map((profile) => (
              <Link
                className="card"
                href={`/profiles/${profile.name}`}
                key={profile.name}
              >
                <h2>{profile.name}</h2>
                <p style={{ margin: 0 }}>{profile.description}</p>
                <p className="meta">{profile.skills.length} skills</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <SkillSearch skills={skills} />
    </>
  );
}
