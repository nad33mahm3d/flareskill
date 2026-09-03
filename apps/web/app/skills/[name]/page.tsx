import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyCommand } from "../../copy-command";
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
    <article className="detail">
      <Link className="back" href="/">
        ← Skills
      </Link>
      <p className="kicker">{skill.category}</p>
      <h1>
        {skill.name}
        <span className="ver">@{skill.version}</span>
      </h1>
      <p className="lede">{skill.description}</p>
      <CopyCommand command={installCommand(skill.name)} />
      <dl className="facts">
        <div>
          <dt>Author</dt>
          <dd>{skill.author}</dd>
        </div>
        <div>
          <dt>License</dt>
          <dd>{skill.license}</dd>
        </div>
        {skill.dependencies?.length ? (
          <div>
            <dt>Depends on</dt>
            <dd>{skill.dependencies.join(", ")}</dd>
          </div>
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
        <a className="btn btn-ghost" href={githubSkillUrl(skill.path)}>
          View source on GitHub
        </a>
      </p>
    </article>
  );
}
