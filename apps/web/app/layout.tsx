import { Newsreader, Outfit, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { getNpmStats } from "../lib/npm";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  pageMetadata,
} from "../lib/seo";
import {
  DEEPWIKI_URL,
  GITHUB_URL,
  NPM_URL,
  SITE_URL,
} from "../lib/site";
import { HeaderCtas } from "./header-ctas";
import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const themeScript = `(function(){try{var s=localStorage.getItem("flareskill-theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

const base = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · FlareSkill",
  },
  description: SITE_DESCRIPTION,
  alternates: base.alternates,
  openGraph: {
    ...base.openGraph,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "81XMJzsvyrqjIjtxkg3o3YPQtNmB5X6kf911jsFpU6w",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const npm = await getNpmStats();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body>
        <Script id="flareskill-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <div className="glow" aria-hidden="true" />
        <div className="site-header-wrap">
          <header className="site-header">
            <Link className="brand" href="/">
              <img src="/logo.svg" width={32} height={32} alt="FlareSkill" />
              FlareSkill
            </Link>
            <div className="header-tools">
              <nav aria-label="Primary">
                <Link href="/#skills">Skills</Link>
                <Link href="/profiles">Profiles</Link>
                <Link href="/blog">Blog</Link>
                <a href={DEEPWIKI_URL}>Docs</a>
              </nav>
              <ThemeToggle />
              <HeaderCtas stats={npm} />
            </div>
          </header>
        </div>
        <main className="site-main" id="content">
          {children}
        </main>
        <div className="site-footer-wrap">
          <footer className="site-footer">
            <div>
              <p className="footer-brand">FlareSkill</p>
              <p className="footer-note">
                Open-source registry and CLI for AI agent skills. Install once,
                reuse across Cursor, Claude Code, and Codex.
              </p>
            </div>
            <div className="footer-col">
              <span>Product</span>
              <Link href="/">AI skills</Link>
              <Link href="/profiles">Profiles</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/blog/getting-started">Get started</Link>
            </div>
            <div className="footer-col">
              <span>Legal</span>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/llm.txt">llm.txt</Link>
            </div>
            <div className="footer-col">
              <span>Elsewhere</span>
              <a href={GITHUB_URL}>GitHub</a>
              <a href={NPM_URL}>npm</a>
              <a href={DEEPWIKI_URL}>DeepWiki</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
