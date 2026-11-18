import { cacheLife } from "next/cache";
import { groq } from "next-sanity";
import { sanityClient, sanityConfigured, imageUrl } from "../../../sanity/client";
import type { ArticleBlock, JournalArticle, JournalCategory } from "@/data/types";

const STORIES_QUERY = groq`*[_type == "journalStory" && status == "published" && defined(slug.current)] | order(publishedAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  "collectionName": collection->name,
  category,
  author,
  featured,
  publishedAt,
  coverImage,
  coverAlt,
  videoUrl,
  body
}`;

type SanityBlock = {
  _type: string;
  asset?: unknown;
  alt?: string;
  caption?: string;
  url?: string;
  style?: string;
  children?: { text?: string }[];
};

type SanityStory = {
  videoUrl?: string;
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: JournalCategory;
  collectionName?: string;
  author?: string;
  featured?: boolean;
  publishedAt?: string;
  coverImage?: unknown;
  coverAlt?: string;
  body?: SanityBlock[];
};

function toBlocks(body: SanityBlock[] = []): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  for (const b of body) {
    if (b._type === "videoLink") {
      if (b.url) blocks.push({ type: "video", url: b.url });
      continue;
    }
    if (b._type === "image") {
      if (b.asset) blocks.push({ type: "image", alt: (b.alt as string) || "", caption: (b.caption as string) || undefined, src: imageUrl(b) });
      continue;
    }
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
    videoUrl: s.videoUrl || undefined,
    coverAlt: s.coverAlt || s.title,
    category: s.collectionName || s.category || "Essay",
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
  cacheLife({ stale: 60, revalidate: 30, expire: 3600 });
  if (!sanityConfigured) return [];
  try {
    const stories = await sanityClient.fetch<SanityStory[]>(STORIES_QUERY);
    return stories.map(toArticle);
  } catch (err) {
    console.error("Sanity: could not load Journal stories, using local stories only", err);
    return [];
  }
}
