import { SITE_URL, GITHUB_URL, NPM_URL } from "./site";
import { SITE_DESCRIPTION } from "./seo";
import { readingTimeMinutes, type BlogPost } from "./blog";
import type { RegistrySkill } from "./registry";

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "FlareSkill",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        sameAs: [GITHUB_URL, NPM_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "FlareSkill — AI Agent Skills Registry",
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "flareskill",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        url: NPM_URL,
        downloadUrl: NPM_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: SITE_DESCRIPTION,
        keywords: "AI skills, agent skills, Cursor, Claude Code, Codex",
      },
    ],
  };
}

export function skillJsonLd(skill: RegistrySkill): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: skill.name,
    description: skill.description,
    version: skill.version,
    codeRepository: GITHUB_URL,
    url: `${SITE_URL}/skills/${skill.name}`,
    programmingLanguage: "Markdown",
    license: `https://opensource.org/licenses/${skill.license}`,
    author: {
      "@type": "Person",
      name: skill.author,
    },
    keywords: [skill.category, ...skill.tags].join(", "),
  };
}

export function blogPostJsonLd(post: BlogPost): Record<string, unknown>[] {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const minutes = readingTimeMinutes(post.body);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      url,
      mainEntityOfPage: url,
      timeRequired: `PT${minutes}M`,
      author: {
        "@type": "Organization",
        name: "FlareSkill",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "FlareSkill",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    },
  ];
}
