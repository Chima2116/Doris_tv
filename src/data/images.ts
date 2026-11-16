/**
 * Photography manifest. Every real photograph the interface uses is declared here with its
 * source and licence. Credits are NEVER invented: a credit is shown only because it is recorded
 * here, and anything we don't have an asset for is listed in docs/ASSET-REQUIREMENTS.md.
 */
export type ImageAsset = {
  src: string;
  alt: string;
  /** What the photograph actually shows (used as the visible caption). Not tied to any fictional story. */
  caption: string;
  /** CSS object-position, so crops keep the subject. */
  focal: string;
  /** Absent for photographs supplied through the Studio, which carry no structured licence. */
  credit?: {
    author: string;
    license: "CC0" | "CC BY-SA 4.0" | "CC BY 4.0" | "Pexels License";
    sourceUrl: string;
    /** Where the photograph was obtained. Defaults to Wikimedia Commons. */
    via?: "Pexels";
  };
};

export const IMAGES = {
  homeHero: {
    src: "/images/home/hero-nollywood-set.jpg",
    alt: "A film crew on location in the sun, with a camera operator at the tripod and a large white reflector beside a puddle",
    caption: "Behind the scenes on a Nollywood production.",
    focal: "50% 48%",
    credit: {
      author: "MediaMOF",
      license: "CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nollywood_BTS_38.jpg",
    },
  },
  crewNairobi: {
    src: "/images/home/crew-nairobi-railways.jpg",
    alt: "A film crew in high-visibility vests shooting beside the railway tracks in Nairobi",
    caption: "A film crew shooting at Nairobi Railways, Kenya.",
    focal: "50% 40%",
    credit: {
      author: "Cecimercy Wanza (Ceci)",
      license: "CC0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Real_Strike_Studios_Film_crew_on_set_(2024).jpg",
    },
  },
  fespacoEntrance: {
    src: "/images/home/fespaco-entrance.jpg",
    alt: "A sculpture of a man holding a camera at the entrance to the FESPACO grounds in Ouagadougou",
    caption: "A camera sculpture at the entrance to FESPACO, Ouagadougou, Burkina Faso.",
    focal: "30% 45%",
    credit: {
      author: "ZIZIEN Rachiratou Nathalie",
      license: "CC0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:L%27art_au_sein_du_fespaco.jpg",
    },
  },
  crewSeated: {
    src: "/images/journal/crew-seated-location.jpg",
    alt: "A small film crew resting between setups on a street, with a camera on a stand and a building under construction behind",
    caption: "A film crew between setups on location.",
    focal: "50% 55%",
    credit: { author: "Aj Collins Artistry", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/a-group-of-men-sitting-on-chairs-and-talking-28321911/", via: "Pexels" },
  },
  crewStreet: {
    src: "/images/journal/crew-street-setup.jpg",
    alt: "A crew with a camera on a tripod and a director talking on an unpaved street beside a white wall",
    caption: "A crew setting up a shot on a street.",
    focal: "50% 50%",
    credit: { author: "Director Chenchi", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/team-of-filmmakers-setting-up-outdoor-shot-36181973/", via: "Pexels" },
  },
  lagosStreet: {
    src: "/images/journal/lagos-street.jpg",
    alt: "A busy Lagos street seen from above, lined with tall mixed-use buildings and heavy traffic",
    caption: "A busy street in Lagos, Nigeria.",
    focal: "50% 40%",
    credit: { author: "Aminu Fahd", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/bustling-street-scene-in-lagos-nigeria-38784176/", via: "Pexels" },
  },
  cameraMonitor: {
    src: "/images/journal/camera-monitor.jpg",
    alt: "A camera operator wearing headphones looks at the monitor on a professional camera",
    caption: "A camera operator at the monitor, Dar es Salaam, Tanzania.",
    focal: "50% 35%",
    credit: { author: "Japhet Kweba", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/professional-cameraman-at-work-in-tanzania-32926960/", via: "Pexels" },
  },
  lagosMarket: {
    src: "/images/journal/lagos-market-sunset.jpg",
    alt: "A Lagos street market at sunset with rows of yellow buses, umbrellas and vendors under a golden sky",
    caption: "A street market and bus terminal at sunset in Lagos, Nigeria.",
    focal: "50% 60%",
    credit: { author: "Bamidele Olamilekan", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/bustling-lagos-street-market-scene-at-sunset-30583818/", via: "Pexels" },
  },
  spotlightDoc: {
    src: "/images/journal/director-nairobi.jpg",
    alt: "A man wearing headphones and a blue hooded top operates a video camera outdoors in front of a stone building",
    caption: "A camera operator filming outdoors in Nairobi, Kenya. Illustrative photograph, not a portrait of the featured filmmaker.",
    focal: "50% 30%",
    credit: { author: "Meshack Kitemi", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/director-holding-a-camera-20233642/", via: "Pexels" },
  },
  interviewStadium: {
    src: "/images/journal/interview-stadium.jpg",
    alt: "Two people being interviewed in stadium seats, with a video camera set up in front of them",
    caption: "An interview being filmed in stadium seats.",
    focal: "50% 55%",
    credit: { author: "Khaliifah  hussein", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/outdoor-interview-in-stadium-seats-with-video-camera-35061609/", via: "Pexels" },
  },
  gradingSuite: {
    src: "/images/journal/grading-suite.jpg",
    alt: "A colour-grading suite with footage and scopes on a large monitor in a dim room",
    caption: "A colour-grading suite with footage on screen.",
    focal: "40% 55%",
    credit: { author: "Ron Lach", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/backview-of-a-female-editor-in-front-of-a-computer-8100063/", via: "Pexels" },
  },
  cameraSetupAbuja: {
    src: "/images/journal/camera-setup-abuja.jpg",
    alt: "Two crew members setting up a camera on open sandy ground",
    caption: "Two crew members setting up a camera on open ground in Abuja, Nigeria.",
    focal: "50% 55%",
    credit: { author: "Abdullahi Santuraki", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/outdoor-photoshoot-scene-in-nigerian-desert-setting-39825097/", via: "Pexels" },
  },
  openAirCinema: {
    src: "/images/journal/open-air-cinema.jpg",
    alt: "An open-air cinema with a large screen, rows of chairs and string lights at sunset",
    caption: "An open-air cinema screen at sunset.",
    focal: "50% 60%",
    credit: { author: "Beyzaa", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/people-sitting-in-open-air-cinema-18125140/", via: "Pexels" },
  },
  cameraKigali: {
    src: "/images/journal/camera-kigali.jpg",
    alt: "A young camera operator behind a video camera on a tripod at an indoor event",
    caption: "A camera operator filming an event in Kigali, Rwanda.",
    focal: "45% 45%",
    credit: { author: "Josh Toxic", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/young-cameraperson-filming-an-event-in-kigali-36424379/", via: "Pexels" },
  },
  streetEquipment: {
    src: "/images/journal/street-equipment.jpg",
    alt: "Two men in traditional clothing walking along a street carrying video equipment",
    caption: "Two men carrying video equipment along a street.",
    focal: "40% 50%",
    credit: { author: "Kaybee Photography", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/street-scene-with-people-in-traditional-attire-30709468/", via: "Pexels" },
  },
  editorDark: {
    src: "/images/journal/editor-dark.jpg",
    alt: "An editor working at dual monitors in a dimly lit studio",
    caption: "An editor working at dual monitors in a dim studio.",
    focal: "60% 50%",
    credit: { author: "Cemrecan Yurtman", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/video-editor-working-in-dark-17147713/", via: "Pexels" },
  },
  cameramanJohannesburg: {
    src: "/images/journal/cameraman-johannesburg.jpg",
    alt: "A cameraman in a striped polo shirt checks his professional camera on a rooftop above the city",
    caption: "A cameraman at work in Johannesburg, South Africa.",
    focal: "60% 45%",
    credit: { author: "Thobile Nhlapo", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/camera-guy-17942869/", via: "Pexels" },
  },
  tripodOutdoors: {
    src: "/images/journal/tripod-outdoors.jpg",
    alt: "A man in a suit standing beside a video camera on a tripod outdoors in the sun",
    caption: "A camera operator beside a tripod outdoors.",
    focal: "50% 55%",
    credit: { author: "Juba Mind", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/man-with-a-camera-on-a-tripod-14349309/", via: "Pexels" },
  },
  eventBujumbura: {
    src: "/images/journal/event-bujumbura.jpg",
    alt: "A camera operator filming an outdoor event in front of a large crowd",
    caption: "A camera operator filming an outdoor event in Bujumbura, Burundi.",
    focal: "50% 50%",
    credit: { author: "Chris wade NTEZICIMPA", license: "Pexels License", sourceUrl: "https://www.pexels.com/photo/man-making-a-live-broadcasting-17823215/", via: "Pexels" },
  },
} satisfies Record<string, ImageAsset>;
