/** Video links that DORIS TV accepts for Journal stories. Playback happens on the platform. */
export const VIDEO_HOST_PATTERN = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|instagram\.com)\//i;

/** The platform name for a video link, for display. */
export function videoPlatform(url: string): string {
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/vimeo\.com/i.test(url)) return "Vimeo";
  if (/instagram\.com/i.test(url)) return "Instagram";
  return "the platform";
}

/** The embeddable player address for a video link, or null if the link can't be played here. */
export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const ig = url.match(/instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
  if (ig) return `https://www.instagram.com/${ig[1] === "reels" ? "reel" : ig[1]}/${ig[2]}/embed`;
  return null;
}
