# Launch checklist

Use this after shipping registry website changes.

## Live QA (automated spot-check)

Confirm on production:

| URL | Expect |
| --- | ------ |
| https://flareskill.vercel.app/ | 200, title/description, theme |
| https://flareskill.vercel.app/sitemap.xml | 200, lists skills/blog/legal |
| https://flareskill.vercel.app/robots.txt | Sitemap line present |
| https://flareskill.vercel.app/llm.txt | Plain-text catalog |
| https://flareskill.vercel.app/blog | Guides index |
| https://flareskill.vercel.app/privacy | Privacy page |

Last verified: 2026-09-04 — home, sitemap, robots, llm.txt, blog, privacy all returned 200; Google verification meta and Open Graph tags present.

## Google Search Console

1. Open [Search Console](https://search.google.com/search-console) for `flareskill.vercel.app`.
2. If ownership is not verified, use the HTML tag already in the site metadata (`google-site-verification` in `apps/web/app/layout.tsx`).
3. **Sitemaps** → add `https://flareskill.vercel.app/sitemap.xml` → Submit.
4. Optionally **URL Inspection** → request indexing for `/` and `/blog/getting-started`.

There is no public API to submit a sitemap without your Google account; this step is one-time in the Console UI.
