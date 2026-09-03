import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  formatPostDate,
  formatReadingTime,
  getAdjacentPosts,
  getBlogPost,
  getBlogPosts,
  readingTimeMinutes,
} from "../../../lib/blog";
import { blogPostJsonLd, JsonLd } from "../../../lib/json-ld";
import { Markdown } from "../../../lib/markdown";
import { pageMetadata } from "../../../lib/seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getBlogPost(slug);
    if (!post) {
      return { title: "Post" };
    }
    return pageMetadata({
      title: `${post.title} | AI Agent Skills`,
      description: `${post.description} Learn AI skills and agent skills with FlareSkill.`,
      path: `/blog/${post.slug}`,
      type: "article",
    });
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    notFound();
  }

  const minutes = readingTimeMinutes(post.body);
  const { prev, next } = getAdjacentPosts(slug);

  return (
    <article className="post">
      <JsonLd data={blogPostJsonLd(post)} />
      <Link className="back" href="/blog">
        ← All posts
      </Link>

      <header className="post-header">
        <p className="kicker">Guide</p>
        <h1>{post.title}</h1>
        <p className="post-lede">{post.description}</p>
        <div className="post-meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{formatReadingTime(minutes)}</span>
        </div>
      </header>

      <div className="prose post-body">
        <Markdown source={post.body} />
      </div>

      <footer className="post-footer">
        <div className="post-nav">
          {prev ? (
            <Link className="post-nav-link" href={`/blog/${prev.slug}`}>
              <span className="post-nav-label">Previous</span>
              <span className="post-nav-title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="post-nav-link post-nav-next"
              href={`/blog/${next.slug}`}
            >
              <span className="post-nav-label">Next</span>
              <span className="post-nav-title">{next.title}</span>
            </Link>
          ) : null}
        </div>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/#skills">
            Browse AI skills
          </Link>
          <Link className="btn btn-ghost" href="/blog">
            More guides
          </Link>
        </div>
      </footer>
    </article>
  );
}
