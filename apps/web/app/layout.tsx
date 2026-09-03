import { Outfit, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlareSkill Registry",
    template: "%s · FlareSkill",
  },
  description:
    "Browse and install reusable AI agent skills for Cursor, Claude Code, and Codex.",
  verification: {
    google: "81XMJzsvyrqjIjtxkg3o3YPQtNmB5X6kf911jsFpU6w",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="glow" aria-hidden="true" />
        <header className="site-header">
          <Link className="brand" href="/">
            <img src="/logo.svg" width={32} height={32} alt="" />
            FlareSkill
          </Link>
          <nav>
            <Link href="/">Skills</Link>
            <Link href="/profiles">Profiles</Link>
            <a href="https://deepwiki.com/nad33mahm3d/flareskill">DeepWiki</a>
            <a href="https://github.com/nad33mahm3d/flareskill">GitHub</a>
            <a className="nav-cta" href="https://www.npmjs.com/package/flareskill">
              npm
            </a>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <span>Open source · MIT</span>
          <span className="footer-links">
            <a href="https://github.com/nad33mahm3d/flareskill">GitHub</a>
            <a href="https://deepwiki.com/nad33mahm3d/flareskill">DeepWiki</a>
            <a href="https://www.npmjs.com/package/flareskill">npm</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
