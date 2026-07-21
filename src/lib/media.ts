/**
 * Central media registry — every image/video on the site resolves through here.
 * All images are Unsplash CDN (parameterized); videos are muted ambient loops
 * with a matching poster so a failed stream degrades to a still, and a failed
 * still degrades to the division-tinted gradient painted by <MediaImage>.
 */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export interface DivisionMedia {
  /** Pre-process: concept, blueprint, design */
  pre: string;
  /** In-process: execution, grit */
  process: string;
  /** Completion: the luxe result */
  done: string;
  /** Extra gallery frames */
  gallery: string[];
  video?: { src: string; poster: string };
}

export const MEDIA: Record<string, DivisionMedia> = {
  construction: {
    pre: U("photo-1503387762-592deb58ef4e"),
    process: U("photo-1541888946425-d81bb19240f5"),
    done: U("photo-1486406146926-c627a92ad1ab", 1920),
    gallery: [U("photo-1503387762-592deb58ef4e"), U("photo-1541888946425-d81bb19240f5"), U("photo-1486406146926-c627a92ad1ab")],
  },
  energy: {
    pre: U("photo-1509391366360-2e959784a276"),
    process: U("photo-1509389928833-fe62aef36deb"),
    done: U("photo-1466611653911-95081537e5b7"),
    gallery: [U("photo-1509391366360-2e959784a276"), U("photo-1466611653911-95081537e5b7")],
    video: {
      src: "https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-on-a-sunny-day-41617-large.mp4",
      poster: U("photo-1466611653911-95081537e5b7"),
    },
  },
  it: {
    pre: U("photo-1461749280684-dccba630e2f6"),
    process: U("photo-1558494949-ef010cbdcc31"),
    done: U("photo-1550751827-4bd374c3f58b"),
    gallery: [U("photo-1558494949-ef010cbdcc31"), U("photo-1550751827-4bd374c3f58b"), U("photo-1461749280684-dccba630e2f6"), U("photo-1555949963-aa79dcee981c")],
    video: {
      src: "https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4",
      poster: U("photo-1550751827-4bd374c3f58b", 1920),
    },
  },
  "real-estate": {
    pre: U("photo-1600607687939-ce8a6c25118c"),
    process: U("photo-1541888946425-d81bb19240f5"),
    done: U("photo-1600585154340-be6161a56a0c"),
    gallery: [U("photo-1600585154340-be6161a56a0c"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1600596542815-ffad4c1539a9"), U("photo-1618221195710-dd6b41faaea6")],
  },
  autos: {
    pre: U("photo-1542282088-fe8426682b8f"),
    process: U("photo-1617788138017-80ad40651399"),
    done: U("photo-1563720223185-11003d516935"),
    gallery: [U("photo-1563720223185-11003d516935"), U("photo-1617788138017-80ad40651399"), U("photo-1542282088-fe8426682b8f")],
    video: {
      src: "https://assets.mixkit.co/videos/preview/mixkit-charging-an-electric-car-42171-large.mp4",
      poster: U("photo-1563720223185-11003d516935", 1920),
    },
  },
  commerce: {
    pre: U("photo-1581092160607-ee22621dd758"),
    process: U("photo-1586528116311-ad8dd3c8310d"),
    done: U("photo-1553413077-190dd305871c"),
    gallery: [U("photo-1586528116311-ad8dd3c8310d"), U("photo-1581092160607-ee22621dd758"), U("photo-1553413077-190dd305871c")],
  },
  "smart-home": {
    pre: U("photo-1600607687920-4e2a09cf159d"),
    process: U("photo-1581092160607-ee22621dd758"),
    done: U("photo-1600607687939-ce8a6c25118c"),
    gallery: [U("photo-1600607687920-4e2a09cf159d"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1558002038-1055907df827")],
  },
};

/** Homepage hero ambient loop — IT/cyber texture behind the graphite field. */
export const HERO_VIDEO = {
  src: "https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4",
  poster: U("photo-1550751827-4bd374c3f58b", 1920),
};

/** Property photography by type — dramatic, warm interior light. */
const PROPERTY_SETS: Record<string, string[]> = {
  shortlet: [U("photo-1618221195710-dd6b41faaea6"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1600596542815-ffad4c1539a9")],
  residential: [U("photo-1600585154340-be6161a56a0c"), U("photo-1600596542815-ffad4c1539a9"), U("photo-1600607687920-4e2a09cf159d")],
  commercial: [U("photo-1486406146926-c627a92ad1ab"), U("photo-1497366216548-37526070297c"), U("photo-1497366811353-6870744d04b2")],
  warehousing: [U("photo-1553413077-190dd305871c"), U("photo-1586528116311-ad8dd3c8310d"), U("photo-1565610222536-ef125c59da2e")],
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function propertyImage(type: string, slug: string): string {
  const set = PROPERTY_SETS[type] ?? PROPERTY_SETS.residential;
  return set[hash(slug) % set.length];
}

export function propertyGallery(type: string, slug: string): string[] {
  const set = PROPERTY_SETS[type] ?? PROPERTY_SETS.residential;
  const start = hash(slug) % set.length;
  return [0, 1, 2].map((i) => set[(start + i) % set.length]);
}

/** Store product imagery by department. */
const PRODUCT_SETS: Record<string, string[]> = {
  solar: [U("photo-1509391366360-2e959784a276"), U("photo-1508514177221-188b1cf16e9d"), U("photo-1548337138-e87d889cc369")],
  inverters: [U("photo-1581092160607-ee22621dd758"), U("photo-1581091226825-a6a2a5aee158")],
  electronics: [U("photo-1498049794561-7780e7231661"), U("photo-1517336714731-489689fd1ca8"), U("photo-1583394838336-acd977736f90")],
  "smart-home": [U("photo-1558002038-1055907df827"), U("photo-1600607687920-4e2a09cf159d")],
  enterprise: [U("photo-1558494949-ef010cbdcc31"), U("photo-1544197150-b99a580bb7a8")],
};

export function productImage(category: string, slug: string): string {
  const set = PRODUCT_SETS[category] ?? PRODUCT_SETS.enterprise;
  return set[hash(slug) % set.length];
}

export function productGalleryFor(category: string, slug: string): string[] {
  const set = PRODUCT_SETS[category] ?? PRODUCT_SETS.enterprise;
  const start = hash(slug) % set.length;
  return set.map((_, i) => set[(start + i) % set.length]);
}

/** Vehicle detail gallery — charging / drivetrain / cabin narrative. */
export const VEHICLE_GALLERY = [
  { src: U("photo-1563720223185-11003d516935"), label: "Ultra-rapid charging, ready" },
  { src: U("photo-1617788138017-80ad40651399"), label: "Battery pack & motor assembly" },
  { src: U("photo-1542282088-fe8426682b8f"), label: "Digital cabin & range telemetry" },
];

/** 8-sector hero cover matrix (full-bleed division/page banners). */
export const HERO_COVERS: Record<string, string> = {
  construction: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=80",
  energy: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
  it: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80",
  "real-estate": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  autos: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=80",
  commerce: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80",
  "smart-home": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=80",
  about: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  insights: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
};
