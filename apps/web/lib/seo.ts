import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_TITLE =
  "FlareSkill — AI Agent Skills Registry";

export const SITE_DESCRIPTION =
  "Discover and install open-source AI agent skills for Cursor, Claude Code, and Codex. Browse agent skills, profiles, and versioned packages with one CLI.";

export function humanizeSkillName(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path === "/" ? "/" : path },
    openGraph: {
      title,
      description,
      url,
      siteName: "FlareSkill",
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
