import type { Metadata } from "next";
import Link from "next/link";
import { BottomCta } from "../bottom-cta";
import {
  formatPostDate,
  formatReadingTime,
  getBlogPosts,
  readingTimeMinutes,
} from "../../lib/blog";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog — AI Agent Skills Guides",
  description:
    "Guides on installing AI skills, using agent skills across Cursor, Claude Code, and Codex, and shipping FlareSkill profiles.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <>
      <section className="hero hero-compact">
        <p className="kicker">Guides</p>
        <h1>AI agent skills blog</h1>
        <p className="lede">
          Practical writing on installing AI skills, wiring agent skills into
          Cursor, Claude Code, and Codex, and shipping skill profiles.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/blog/getting-started">
            Get started
          </Link>
          <Link className="btn btn-ghost" href="/#skills">
            Browse AI skills
          </Link>
        </div>
      </section>
      <div className="grid grid-2">
        {posts.map((post) => {
          const minutes = readingTimeMinutes(post.body);
          return (
            <Link className="card" href={`/blog/${post.slug}`} key={post.slug}>
              <p className="blog-date">
                {formatPostDate(post.date)}
                <span aria-hidden="true"> · </span>
                {formatReadingTime(minutes)}
              </p>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </Link>
          );
        })}
      </div>
      <BottomCta />
    </>
  );
}
