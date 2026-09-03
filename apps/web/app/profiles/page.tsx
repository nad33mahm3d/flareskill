import Link from "next/link";
import { CopyCommand } from "../copy-command";
import { getRegistry, profileInstallCommand } from "../../lib/registry";

export default function ProfilesIndexPage() {
  const profiles = getRegistry().profiles ?? [];

  return (
    <>
      <section className="hero hero-compact">
        <p className="kicker">Stacks</p>
        <h1>Profiles</h1>
        <p className="lede">
          Named skill sets for a stack. Install every skill in a profile with
          one command.
        </p>
      </section>
      <div className="grid grid-2">
        {profiles.map((profile) => (
          <article className="card card-profile" key={profile.name}>
            <Link href={`/profiles/${profile.name}`}>
              <div className="card-top">
                <h2>{profile.name}</h2>
                <span className="pill">{profile.skills.length} skills</span>
              </div>
              <p>{profile.description}</p>
            </Link>
            <CopyCommand command={profileInstallCommand(profile.name)} />
          </article>
        ))}
      </div>
    </>
  );
}
