import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How the FlareSkill AI agent skills registry handles information. No accounts; theme preference stays in your browser.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="prose">
      <p className="kicker">Legal</p>
      <h1>Privacy policy</h1>
      <p className="lede">
        The FlareSkill website is a public catalog. We do not run user accounts
        on this site.
      </p>
      <h2>What this site is</h2>
      <p>
        flareskill.vercel.app lists skills and profiles from the open-source
        FlareSkill repository and links to GitHub, npm, and DeepWiki. Install
        commands run on your machine via the FlareSkill CLI, not in your
        browser.
      </p>
      <h2>What we collect</h2>
      <p>
        This site does not ask you to create an account, and it does not use
        first-party analytics cookies. Theme preference is stored in your
        browser with localStorage so light or dark mode can persist on this
        device.
      </p>
      <p>
        The site is hosted on Vercel. Vercel may process standard request data
        such as IP address, user agent, and timestamps to operate the
        service. See Vercel’s own privacy documentation for that processing.
      </p>
      <h2>Outbound services</h2>
      <p>
        Links leave this site for GitHub, npm, and DeepWiki. Those services
        have their own policies. Weekly download counts shown on this site are
        requested from the public npm API.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy: open an issue on{" "}
        <a href="https://github.com/nad33mahm3d/flareskill">GitHub</a>.
      </p>
      <p className="disclaimer">
        This page is a plain-language description, not legal advice.
      </p>
      <p>
        <Link href="/terms">Terms of use</Link>
      </p>
    </article>
  );
}
