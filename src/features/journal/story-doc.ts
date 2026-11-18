import { VIDEO_HOST_PATTERN } from "@/lib/video";
import type { ArticleBlock } from "@/data/types";

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

export type Doc = { type?: string; text?: string; attrs?: Record<string, unknown>; marks?: unknown[]; content?: Doc[] };

const plain = (n?: Doc): string => (n?.text ? n.text : (n?.content ?? []).map(plain).join(""));

/** Turns the story editor's document into the blocks the Journal page already knows how to show. */
export function docToBlocks(doc: Doc | null | undefined): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  for (const node of doc?.content ?? []) {
    if (node.type === "paragraph") {
      const text = plain(node).trim();
      if (text) out.push({ type: "p", text });
    } else if (node.type === "heading") {
      const text = plain(node).trim();
      if (text) out.push({ type: "h2", text });
    } else if (node.type === "blockquote") {
      const text = (node.content ?? []).map(plain).join(" ").trim();
      if (text) out.push({ type: "quote", text });
    } else if (node.type === "bulletList") {
      for (const item of node.content ?? []) {
        const text = plain(item).trim();
        if (text) out.push({ type: "p", text: `• ${text}` });
      }
    } else if (node.type === "image") {
      const src = String(node.attrs?.src ?? "");
      if (src) out.push({ type: "image", alt: String(node.attrs?.alt ?? ""), src });
    } else if (node.type === "videoLink") {
      const url = String(node.attrs?.url ?? "");
      if (url) out.push({ type: "video", url });
    }
  }
  return out;
}

