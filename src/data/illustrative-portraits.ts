import type { ImageAsset } from "@/data/images";

/**
 * Pexels portraits used as ILLUSTRATIVE images on fictional filmmaker profiles.
 * They are not the filmmaker: every card and profile says "Illustrative photograph", and the
 * credit appears in the footer. Replace each entry with the filmmaker's own portrait (with
 * permission) through `portraitUrl` when it is supplied.
 */
const portrait = (file: string, author: string, id: string, slug: string): ImageAsset => ({
  src: `/images/people/${file}.jpg`,
  alt: "Portrait photograph, illustrative",
  caption: "Illustrative photograph.",
  focal: "50% 25%",
  credit: { author, license: "Pexels License", sourceUrl: `https://www.pexels.com/photo/${slug}-${id}/`, via: "Pexels" },
});

export const ILLUSTRATIVE_PORTRAITS: Record<string, ImageAsset> = {
  "ngozi-ihejirika": portrait("woman-denim", "Elka Elias", "39598425", "portrait-of-smiling-woman-in-denim-jacket-at-night"),
  "temi-adeyemi": portrait("woman-traditional", "Darkshade Photos", "36845523", "portrait-of-a-woman-in-traditional-african-attire"),
  "esi-mensah-boateng": portrait("woman-hijab", "𝐂𝐝𝐞𝐞𝐐_ 𝐩𝐡𝐨𝐭𝐨𝐠𝐫𝐚𝐩𝐡𝐘", "38272154", "portrait-of-a-young-woman-in-traditional-nigerian-attire"),
  "wanjiru-kamau": portrait("woman-natural-hair", "Kenechukwu Emmanuel", "37421442", "portrait-of-a-young-woman-with-natural-hairstyle"),
  "lerato-dlamini": portrait("woman-attire", "Tosin Olowoleni", "36786033", "portrait-of-african-woman-in-traditional-attire"),
  "selam-tesfaye": portrait("woman-headwrap", "Creative KG", "36536385", "smiling-woman-in-colorful-headwrap-and-white-dress"),
  "nadia-el-sayed": portrait("woman-sunglasses", "Oluwaseun Adekoya", "17798580", "african-woman-wearing-sunglasses"),
  "claudine-uwase": portrait("woman-traditional-smile", "Bakarii_photography", "37038761", "smiling-woman-in-vibrant-traditional-attire"),
  "moussa-ndiaye": portrait("man-blue-attire", "LekePOV", "33511978", "young-african-man-in-traditional-blue-attire"),
  "amara-kone": portrait("man-indoors", "Bobography", "35730557", "man-in-traditional-nigerian-attire-posing-indoors"),
};
