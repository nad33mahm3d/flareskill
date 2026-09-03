import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
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
    <>
      <p className="meta">
        <Link href="/profiles">← Profiles</Link>
      </p>
      <h1>{profile.name}</h1>
      <p className="lede">{profile.description}</p>
      <pre>{profileInstallCommand(profile.name)}</pre>
      <h2 style={{ fontSize: "1.15rem" }}>Skills</h2>
      <div className="grid">
        {skills.map((skill) => (
          <Link className="card" href={`/skills/${skill.name}`} key={skill.name}>
            <h2>
              {skill.name}
              <span className="meta"> @{skill.version}</span>
            </h2>
            <p style={{ margin: 0 }}>{skill.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
