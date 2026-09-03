import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="hero">
      <p className="kicker">404</p>
      <h1>Not found</h1>
      <p className="lede">That page is not in the registry.</p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/">
          Back to skills
        </Link>
        <Link className="btn btn-ghost" href="/blog">
          Read the blog
        </Link>
      </div>
    </section>
  );
}
