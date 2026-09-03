import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-${i}`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`${keyPrefix}-${i}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={`${keyPrefix}-${i}`}>{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2];
        const external = href.startsWith("http");
        nodes.push(
          <a
            key={`${keyPrefix}-${i}`}
            href={href}
            {...(external
              ? { rel: "noreferrer", target: "_blank" }
              : {})}
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = match.index + token.length;
    i += 1;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

export function Markdown({ source }: { source: string }): ReactNode {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre key={key} className="code">
          <code data-lang={lang || undefined}>{code.join("\n")}</code>
        </pre>,
      );
      key += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={key}>
          {items.map((item, idx) => (
            <li key={idx}>{inline(item, `li-${key}-${idx}`)}</li>
          ))}
        </ul>,
      );
      key += 1;
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i += 1;
      }
      blocks.push(
        <ol key={key}>
          {items.map((item, idx) => (
            <li key={idx}>{inline(item, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>,
      );
      key += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key}>{inline(line.slice(4), `h3-${key}`)}</h3>);
      key += 1;
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key}>{inline(line.slice(3), `h2-${key}`)}</h2>);
      key += 1;
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(<h1 key={key}>{inline(line.slice(2), `h1-${key}`)}</h1>);
      key += 1;
      i += 1;
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !lines[i].startsWith("```") && !/^\d+\. /.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(<p key={key}>{inline(para.join(" "), `p-${key}`)}</p>);
    key += 1;
  }

  return <>{blocks}</>;
}
