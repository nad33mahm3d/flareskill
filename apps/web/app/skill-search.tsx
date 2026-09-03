"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RegistrySkill } from "../lib/registry";

export function SkillSearch({ skills }: { skills: RegistrySkill[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return skills;
    }
    const terms = q.split(/\s+/);
    return skills.filter((skill) => {
      const haystack = [
        skill.name,
        skill.description,
        skill.category,
        skill.author,
        ...skill.tags,
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [query, skills]);

  return (
    <div>
      <label className="meta" htmlFor="skill-search">
        Search skills
      </label>
      <input
        id="skill-search"
        className="search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="react, security, kubernetes…"
        autoComplete="off"
      />
      <p className="meta">
        {filtered.length} of {skills.length} skills
      </p>
      <div className="grid">
        {filtered.map((skill) => (
          <Link className="card" href={`/skills/${skill.name}`} key={skill.name}>
            <h2>
              {skill.name}
              <span className="meta"> @{skill.version}</span>
            </h2>
            <p style={{ margin: 0 }}>{skill.description}</p>
            <div className="tags">
              <span className="tag">{skill.category}</span>
              {skill.tags.slice(0, 4).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="lede">No skills matched that search.</p>
        ) : null}
      </div>
    </div>
  );
}
