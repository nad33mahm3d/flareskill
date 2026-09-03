import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyCommand } from "../../copy-command";
import {
  getProfile,
  getRegistry,
  getSkill,
  profileInstallCommand,
} from "../../../lib/registry";

type Params = { name: string };

export function generateStaticParams(): Params[] {
  return (getRegistry().profiles ?? []).map((profile) => ({
    name: profile.name,
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return params.then(({ name }) => {
    const profile = getProfile(name);
    return {
      title: profile ? `Profile: ${profile.name}` : "Profile",
      description: profile?.description,
    };
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { name } = await params;
  const profile = getProfile(name);
  if (!profile) {
    notFound();
  }

  const skills = profile.skills
    .map((ref) => getSkill(ref.split("@")[0] ?? ref))
    .filter((skill) => skill != null);

  return (
    <article className="detail">
      <Link className="back" href="/profiles">
        ← Profiles
      </Link>
      <p className="kicker">Profile</p>
      <h1>{profile.name}</h1>
      <p className="lede">{profile.description}</p>
      <CopyCommand command={profileInstallCommand(profile.name)} />
      <h2 className="subhead">Skills in this profile</h2>
      <div className="grid grid-2">
        {skills.map((skill) => (
          <Link className="card" href={`/skills/${skill.name}`} key={skill.name}>
            <div className="card-top">
              <h2>{skill.name}</h2>
              <span className="meta">v{skill.version}</span>
            </div>
            <p className="clamp">{skill.description}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
