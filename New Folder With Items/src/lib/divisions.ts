export interface DivisionMeta {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  accent: string; // hex
  href: string;
  description: string;
  links: { label: string; href: string }[];
}

export const DIVISIONS: DivisionMeta[] = [
  {
    slug: "construction",
    name: "Construction & Engineering",
    short: "Construction",
    tagline: "Infrastructure delivered to standard, on schedule.",
    accent: "#D97706",
    href: "/divisions/construction",
    description: "Civil works, structural engineering and design-build delivery for public and private clients across Nigeria.",
    links: [
      { label: "Project portfolio", href: "/divisions/construction#portfolio" },
      { label: "Tenders & procurement", href: "/divisions/construction#tenders" },
      { label: "Vendor registration", href: "/divisions/construction#vendor" },
    ],
  },
  {
    slug: "energy",
    name: "Renewable Energy",
    short: "Energy",
    tagline: "Power that answers to engineering.",
    accent: "#16A34A",
    href: "/divisions/energy",
    description: "Hybrid micro-grids, commercial solar and storage systems engineered for Nigerian load profiles.",
    links: [
      { label: "Solar ROI estimator", href: "/divisions/energy#estimator" },
      { label: "Solutions", href: "/divisions/energy#solutions" },
      { label: "Maintenance request", href: "/divisions/energy#maintenance" },
    ],
  },
  {
    slug: "it",
    name: "Information Technology",
    short: "IT & Security",
    tagline: "Your end-to-end IT partner on the ground.",
    accent: "#6366F1",
    href: "/divisions/it",
    description: "Cybersecurity, cloud, software & AI engineering, and full device-lifecycle IT infrastructure across Nigeria & West Africa.",
    links: [
      { label: "Services", href: "/divisions/it#services" },
      { label: "Device lifecycle", href: "/divisions/it#lifecycle" },
      { label: "Compliance checker", href: "/divisions/it#readiness" },
      { label: "Helpdesk", href: "/divisions/it#helpdesk" },
    ],
  },
  {
    slug: "smart-home",
    name: "Smart Home & Security",
    short: "Smart Home",
    tagline: "Buildings that think, doors that answer to you.",
    accent: "#A855F7",
    href: "/divisions/smart-home",
    description: "Home automation, access control, CCTV and integrated security systems for residential and commercial facilities.",
    links: [
      { label: "Residential automation", href: "/divisions/smart-home#residential" },
      { label: "Commercial & facilities", href: "/divisions/smart-home#commercial" },
      { label: "Book a walkthrough", href: "/divisions/smart-home#consult" },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    short: "Real Estate",
    tagline: "Space that works as hard as you do.",
    accent: "#0D9488",
    href: "/divisions/real-estate",
    description: "Shortlets, residential and commercial space across Abuja, Lagos and Port Harcourt — booked in minutes.",
    links: [
      { label: "Browse properties", href: "/divisions/real-estate#listings" },
      { label: "Shortlet booking", href: "/divisions/real-estate#listings" },
      { label: "Tenant maintenance", href: "/divisions/real-estate#maintenance" },
    ],
  },
  {
    slug: "autos",
    name: "EV & Hybrid Autos",
    short: "Autos",
    tagline: "The quiet future of Nigerian roads.",
    accent: "#38BDF8",
    href: "/divisions/autos",
    description: "Electric and hybrid vehicles with honest specs, transparent Naira pricing and charging support.",
    links: [
      { label: "Vehicle marketplace", href: "/divisions/autos#marketplace" },
      { label: "TCO calculator", href: "/divisions/autos#tco" },
      { label: "Book a test drive", href: "/divisions/autos#marketplace" },
    ],
  },
  {
    slug: "commerce",
    name: "eCommerce",
    short: "Store",
    tagline: "Enterprise-grade hardware, retail-grade checkout.",
    accent: "#E11D48",
    href: "/divisions/commerce",
    description: "Solar components, inverters, electronics and smart-home hardware — stocked, priced and delivered.",
    links: [
      { label: "Shop the store", href: "/divisions/commerce#store" },
      { label: "B2B procurement", href: "/divisions/commerce#b2b" },
      { label: "Track an order", href: "/divisions/commerce/track" },
    ],
  },
];

export function getDivision(slug: string): DivisionMeta | undefined {
  return DIVISIONS.find((d) => d.slug === slug);
}

export const COMPANY = {
  name: "Greyfusion Limited",
  rc: "RC 1120352",
  address: "Suite A-6, Emab Plaza, Wuse 2, Abuja",
  phones: ["0809 202 4484", "0905 555 4471"],
  whatsapp: "2349055554471",
  email: "hello@greyfusion.com.ng",
  hours: "Mon–Fri 8am–5pm · Showroom & stores Sat 9am–6pm",
  site: "www.greyfusion.com.ng",
  offices: ["Abuja (HQ) · Emab Plaza, Wuse 2", "Lagos · 14b Adeola Odeku St, Victoria Island", "Port Harcourt · 32 Trans-Amadi Layout"],
};
