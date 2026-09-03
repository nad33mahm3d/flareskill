import Link from "next/link";
import { getRegistry, profileInstallCommand } from "../../lib/registry";

export default function ProfilesIndexPage() {
  const profiles = getRegistry().profiles ?? [];

  return (
    <>
      <h1>Profiles</h1>
      <p className="lede">
        Named skill sets for a stack. Install every skill in a profile with one
        command.
      </p>
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
            <pre style={{ marginTop: 12 }}>{profileInstallCommand(profile.name)}</pre>
          </Link>
        ))}
      </div>
    </>
  );
}
