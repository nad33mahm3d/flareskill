import type { Metadata } from "next";
import Link from "next/link";
import { BottomCta } from "../bottom-cta";
import { CopyCommand } from "../copy-command";
import { getRegistry, profileInstallCommand } from "../../lib/registry";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profiles — Curated AI Agent Skills Stacks",
  description:
    "Install named FlareSkill profiles to get whole stacks of AI agent skills for frontend, backend, devops, and platform work.",
  path: "/profiles",
});

export default function ProfilesIndexPage() {
  const profiles = getRegistry().profiles ?? [];

  return (
    <>
      <section className="hero hero-compact">
        <p className="kicker">Stacks</p>
        <h1>Agent skills profiles</h1>
        <p className="lede">
          Named sets of AI agent skills for a whole stack. Install frontend,
          backend, devops, or platform profiles with one command.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#profiles">
            Browse profiles
          </a>
          <Link className="btn btn-ghost" href="/blog/skill-profiles">
            How profiles work
          </Link>
        </div>
      </section>
      <div className="grid grid-2" id="profiles">
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
      <BottomCta />
    </>
  );
}
