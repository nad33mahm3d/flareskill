import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FlareSkill Registry",
    template: "%s · FlareSkill",
  },
  description:
    "Browse and install reusable AI agent skills for Cursor, Claude Code, and Codex.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            FlareSkill
          </Link>
          <nav>
            <Link href="/">Skills</Link>
            <Link href="/profiles">Profiles</Link>
            <a href="https://github.com/nad33mahm3d/flareskill">GitHub</a>
            <a href="https://www.npmjs.com/package/flareskill">npm</a>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          Open source · MIT ·{" "}
          <a href="https://github.com/nad33mahm3d/flareskill">nad33mahm3d/flareskill</a>
        </footer>
      </body>
    </html>
  );
}
