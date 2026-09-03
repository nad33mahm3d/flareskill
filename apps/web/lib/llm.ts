import { getBlogPosts } from "./blog";
import {
  getRegistry,
  installCommand,
  profileInstallCommand,
} from "./registry";
import { DEEPWIKI_URL, GITHUB_URL, NPM_URL, SITE_URL } from "./site";

export function llmIndexText(): string {
  const { skills, profiles = [] } = getRegistry();
  const posts = getBlogPosts();

  const skillLines = skills
    .map(
      (skill) =>
        `- [${skill.name}](${SITE_URL}/skills/${skill.name}): ${skill.description}`,
    )
    .join("\n");
  const profileLines = profiles
    .map(
      (profile) =>
        `- [${profile.name}](${SITE_URL}/profiles/${profile.name}): ${profile.description}`,
    )
    .join("\n");
  const postLines = posts
    .map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
    )
    .join("\n");

  return `# FlareSkill

> Open-source registry and CLI for discovering, installing, and managing reusable AI agent skills (AI skills for Cursor, Claude Code, and Codex).

Site: ${SITE_URL}
GitHub: ${GITHUB_URL}
npm: ${NPM_URL}
Docs: ${DEEPWIKI_URL}
LLM index: ${SITE_URL}/llm.txt
LLM full: ${SITE_URL}/llm-full.txt

## Quick start

\`\`\`
npx flareskill init
npx flareskill search react
npx flareskill install senior-react-engineer --agent cursor
\`\`\`

## Skills

${skillLines}

## Profiles

${profileLines}

## Blog

${postLines}

## Pages

- [Privacy](${SITE_URL}/privacy)
- [Terms](${SITE_URL}/terms)
`;
}

export function llmFullText(): string {
  const { skills, profiles = [] } = getRegistry();
  const posts = getBlogPosts();

  const skillBlocks = skills
    .map((skill) => {
      const deps = skill.dependencies?.length
        ? `Depends on: ${skill.dependencies.join(", ")}`
        : "Depends on: none";
      return `### ${skill.name} @${skill.version}

${skill.description}

- Category: ${skill.category}
- Author: ${skill.author}
- License: ${skill.license}
- Tags: ${skill.tags.join(", ")}
- ${deps}
- Source: ${GITHUB_URL}/tree/main/${skill.path}
- Install: \`${installCommand(skill.name)}\`
- Page: ${SITE_URL}/skills/${skill.name}
`;
    })
    .join("\n");

  const profileBlocks = profiles
    .map(
      (profile) => `### ${profile.name}

${profile.description}

- Skills: ${profile.skills.join(", ")}
- Install: \`${profileInstallCommand(profile.name)}\`
- Page: ${SITE_URL}/profiles/${profile.name}
`,
    )
    .join("\n");

  const postBlocks = posts
    .map(
      (post) => `### ${post.title}

Date: ${post.date}
URL: ${SITE_URL}/blog/${post.slug}

${post.body}
`,
    )
    .join("\n---\n\n");

  return `${llmIndexText()}

## How FlareSkill works

Skills live in Git as directories with SKILL.md. registry/index.json lists names, versions, checksums, and dependencies. flareskill install downloads, validates, and copies the skill into the agent folder (.cursor/skills/, .claude/skills/, .agents/skills/, or .flareskill/skills/). Project installs write flareskill.lock so teammates can reproduce the same set.

Useful commands:

\`\`\`
npx flareskill search security
npx flareskill outdated
npx flareskill update
npx flareskill install
npx flareskill profile install frontend
\`\`\`

The public catalog on ${SITE_URL} is generated at deploy time from registry/index.json in the GitHub repository.

## Skill details

${skillBlocks}

## Profile details

${profileBlocks}

## Blog posts

${postBlocks}

## Legal

Privacy and terms: ${SITE_URL}/privacy and ${SITE_URL}/terms. The CLI and skills are MIT licensed, provided as-is. You are responsible for reviewing skills before installing them.
`;
}

export function plainTextResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
