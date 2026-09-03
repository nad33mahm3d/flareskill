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
      <label className="search-label" htmlFor="skill-search">
        Search
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
      <p className="meta count">{filtered.length} of {skills.length}</p>
      <div className="grid grid-2">
        {filtered.map((skill) => (
          <Link className="card" href={`/skills/${skill.name}`} key={skill.name}>
            <div className="card-top">
              <h2>{skill.name}</h2>
              <span className="meta">v{skill.version}</span>
            </div>
            <p className="clamp">{skill.description}</p>
            <div className="tags">
              <span className="tag tag-accent">{skill.category}</span>
              {skill.tags.slice(0, 3).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="lede empty">No skills matched that search.</p>
      ) : null}
    </div>
  );
}
