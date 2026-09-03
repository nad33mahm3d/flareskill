import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getRegistry,
  getSkill,
  githubSkillUrl,
  installCommand,
} from "../../../lib/registry";

type Params = { name: string };

export function generateStaticParams(): Params[] {
  return getRegistry().skills.map((skill) => ({ name: skill.name }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return params.then(({ name }) => {
    const skill = getSkill(name);
    return {
      title: skill ? `${skill.name}@${skill.version}` : "Skill",
      description: skill?.description,
    };
  });
}

export default async function SkillPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) {
    notFound();
  }

  return (
    <>
      <p className="meta">
        <Link href="/">← Skills</Link>
      </p>
      <h1>
        {skill.name}
        <span className="meta"> @{skill.version}</span>
      </h1>
      <p className="lede">{skill.description}</p>
      <pre>{installCommand(skill.name)}</pre>
      <dl className="meta">
        <p>
          <strong>Category:</strong> {skill.category}
        </p>
        <p>
          <strong>Author:</strong> {skill.author} · <strong>License:</strong>{" "}
          {skill.license}
        </p>
        {skill.dependencies?.length ? (
          <p>
            <strong>Depends on:</strong> {skill.dependencies.join(", ")}
          </p>
        ) : null}
      </dl>
      <div className="tags">
        {skill.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className="actions">
        <a href={githubSkillUrl(skill.path)}>View source on GitHub</a>
      </p>
    </>
  );
}
