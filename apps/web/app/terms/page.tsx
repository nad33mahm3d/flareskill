import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Terms for using the FlareSkill website, CLI, and AI agent skills registry. MIT-licensed software provided as-is.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="prose">
      <p className="kicker">Legal</p>
      <h1>Terms of use</h1>
      <p className="lede">
        By using this website or the FlareSkill CLI, you agree to these terms.
      </p>
      <h2>Software license</h2>
      <p>
        FlareSkill source code and official skills are released under the MIT
        License. They are provided “as is”, without warranty of any kind. You
        are responsible for reviewing skills before you install or run them.
      </p>
      <h2>The registry</h2>
      <p>
        Listings on this site describe community and official skills. Names,
        versions, and checksums can change when the Git repository is updated
        and the site is rebuilt. We may change, add, or remove catalog entries
        without notice.
      </p>
      <h2>Your use</h2>
      <p>
        Do not use FlareSkill or this site to violate the law, other people’s
        rights, or the terms of Cursor, Anthropic, OpenAI, npm, GitHub, or
        other third parties. Skills are instructions for AI tools; they are not
        a substitute for professional advice.
      </p>
      <h2>Limitation</h2>
      <p>
        To the extent allowed by law, maintainers are not liable for damages
        arising from use of the site, the CLI, or any skill. If you cannot
        accept that, do not use the software.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these terms by publishing a new version on this page.
      </p>
      <p className="disclaimer">
        This page is a plain-language description, not legal advice.
      </p>
      <p>
        <Link href="/privacy">Privacy policy</Link>
      </p>
    </article>
  );
}
