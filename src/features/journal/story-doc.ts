import { VIDEO_HOST_PATTERN } from "@/lib/video";

/**
 * The story body is stored as a Tiptap document (JSON). These helpers read it back as plain text,
 * so the form can count characters and check the story has enough written in it.
 */
type DocNode = { type?: string; text?: string; attrs?: Record<string, unknown>; content?: DocNode[] };

function collect(node: DocNode | undefined, out: string[]) {
  if (!node) return;
  if (typeof node.text === "string") out.push(node.text);
  for (const child of node.content ?? []) collect(child, out);
}

export function storyText(body: string): string {
  if (!body) return "";
  try {
    const doc = JSON.parse(body) as DocNode;
    const parts: string[] = [];
    collect(doc, parts);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return body.trim();
  }
}

/** True if the body contains at least one video link, and every video link is an accepted platform. */
export function storyVideoLinksValid(body: string): boolean {
  if (!body) return true;
  try {
    const doc = JSON.parse(body) as DocNode;
    const urls: string[] = [];
    const walk = (n: DocNode | undefined) => {
      if (!n) return;
      if (n.type === "videoLink" && typeof n.attrs?.url === "string") urls.push(n.attrs.url);
      for (const c of n.content ?? []) walk(c);
    };
    walk(doc);
    return urls.every((u) => VIDEO_HOST_PATTERN.test(u));
  } catch {
    return true;
  }
}
