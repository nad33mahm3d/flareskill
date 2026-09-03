import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  body: string;
};

const BLOG_DIR = join(process.cwd(), "content/blog");

function parseFrontmatter(raw: string): {
  title: string;
  date: string;
  description: string;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Blog post is missing frontmatter");
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = value;
  }
  return {
    title: meta.title ?? "Untitled",
    date: meta.date ?? "",
    description: meta.description ?? "",
    body: match[2].trim(),
  };
}

export function getBlogPosts(): BlogPost[] {
  const files = readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const parsed = parseFrontmatter(
        readFileSync(join(BLOG_DIR, file), "utf8"),
      );
      return { slug, ...parsed };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function formatPostDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** ~200 wpm; fenced code counts at half weight. */
export function readingTimeMinutes(body: string): number {
  let codeWords = 0;
  const withoutCode = body.replace(/```[\s\S]*?```/g, (block) => {
    codeWords += Math.ceil(
      block.trim().split(/\s+/).filter(Boolean).length / 2,
    );
    return " ";
  });
  const words = withoutCode
    .replace(/[#*`[\]()>-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil((words + codeWords) / 200));
}

export function formatReadingTime(minutes: number): string {
  return minutes === 1 ? "1 min read" : `${minutes} min read`;
}

export function getAdjacentPosts(slug: string): {
  prev?: BlogPost;
  next?: BlogPost;
} {
  const posts = getBlogPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return {};
  }
  return {
    prev: posts[index + 1],
    next: posts[index - 1],
  };
}
