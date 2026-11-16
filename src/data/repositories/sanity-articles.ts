import { cacheLife } from "next/cache";
import { groq } from "next-sanity";
import { sanityClient, sanityConfigured, imageUrl } from "../../../sanity/client";
import type { ArticleBlock, JournalArticle, JournalCategory } from "@/data/types";

const STORIES_QUERY = groq`*[_type == "journalStory" && status == "published" && defined(slug.current)] | order(publishedAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  author,
  featured,
  publishedAt,
  coverImage,
  coverAlt,
  body
}`;

type SanityBlock = {
  _type: string;
  style?: string;
  children?: { text?: string }[];
};

type SanityStory = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: JournalCategory;
  author?: string;
  featured?: boolean;
  publishedAt?: string;
  coverImage?: unknown;
  coverAlt?: string;
  body?: SanityBlock[];
};

const CATEGORIES: JournalCategory[] = ["Interview", "Essay", "Production Notes", "Retrospective", "Video"];

function toBlocks(body: SanityBlock[] = []): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  for (const b of body) {
    if (b._type !== "block") continue;
    const text = (b.children ?? []).map((c) => c.text ?? "").join("").trim();
    if (!text) continue;
    if (b.style === "h2") blocks.push({ type: "h2", text });
    else if (b.style === "blockquote") blocks.push({ type: "quote", text });
    else blocks.push({ type: "p", text });
  }
  return blocks;
}

function toArticle(s: SanityStory): JournalArticle {
  const blocks = toBlocks(s.body);
  const words = blocks.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : 0), 0);
  const publishedAt = s.publishedAt ?? new Date().toISOString();
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    deck: s.excerpt,
    coverImage: s.coverImage ? imageUrl(s.coverImage) : "",
    coverAlt: s.coverAlt || s.title,
    category: CATEGORIES.includes(s.category as JournalCategory) ? (s.category as JournalCategory) : "Essay",
    author: s.author || "DORIS TV",
    publishedAt,
    readingTime: Math.max(1, Math.round(words / 220)),
    featured: Boolean(s.featured),
    status: "published",
    body: blocks,
  };
}

/** Published stories from Sanity. Returns [] when Sanity is not configured or unreachable. */
export async function fetchSanityArticles(): Promise<JournalArticle[]> {
  "use cache";
  cacheLife("minutes");
  if (!sanityConfigured) return [];
  try {
    const stories = await sanityClient.fetch<SanityStory[]>(STORIES_QUERY);
    return stories.map(toArticle);
  } catch (err) {
    console.error("Sanity: could not load Journal stories, using local stories only", err);
    return [];
  }
}
