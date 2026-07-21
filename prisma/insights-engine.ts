/**
 * "Thinking that ships" — deterministic 200-post insights generator.
 * 8 verticals × 25 posts, each interpolated from vertical-specific angle/metric/
 * legislative banks so no two read alike. Seeded PRNG → reproducible across runs.
 */

export interface GeneratedPost {
  title: string;
  slug: string;
  division: string;
  excerpt: string;
  body: string;
  author: string;
  coverImage: string;
  readMins: number;
  ageDays: number; // days before "now" for publishedAt
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

interface Vertical {
  key: string;
  label: string;
  authors: string[];
  covers: string[];
  angles: string[];
  subjects: string[];
  metrics: string[];
  tags: string[]; // Nigerian legislative / regulatory
  bodyIntro: string[];
  sections: { h: string; p: string[] }[];
}

function mm(): string {
  return "";
}
void mm;

const VERTICALS: Vertical[] = [
  {
    key: "construction",
    label: "Construction",
    authors: ["Ibrahim Suleiman", "Engr. Olumide Bankole", "GF Engineering Desk"],
    covers: [U("photo-1541888946425-d81bb19240f5"), U("photo-1503387762-592deb58ef4e"), U("photo-1486406146926-c627a92ad1ab")],
    angles: ["The Real Cost of", "Why Nigerian Sites Fail at", "A Field Guide to", "Engineering Discipline in", "What Auditors Look For in", "Rethinking", "The Quiet Economics of", "Getting", "Specifying"],
    subjects: ["Subgrade Stabilisation", "Concrete Curing in Harmattan", "Drainage That Lasts", "Design-Build Delivery", "Rebar Procurement", "Pavement Longevity", "Site Safety Culture", "Bill-of-Quantities Accuracy", "Precast Adoption", "Expansive-Clay Foundations", "Value Engineering", "Final-Account Discipline"],
    metrics: ["a 3.1% final-account variance", "CBR values below 4%", "96km of carriageway", "an LTIFR of 0.41", "40-tonne axle loads", "9m clear-span eaves", "a 25-year storm design", "₦640M in earthworks savings"],
    tags: ["COREN", "SON MANCAP", "the National Building Code", "BPP procurement rules", "Federal Ministry of Works specs", "Eurocode 2"],
    bodyIntro: [
      "On Nigerian sites, the difference between a structure that lasts and one that fails is rarely dramatic — it is decided in the bill of quantities, months before anyone pours concrete.",
      "Ask any site engineer what kills a project and they will name the weather, the funding, or the client. The honest answer is usually the specification nobody read carefully.",
    ],
    sections: [
      { h: "Where the money actually goes", p: ["Priced honestly, the line items clients skip — stabilisation, drainage, compaction QA — are the ones that determine whether the asset survives its first wet season.", "We tie interim payments to density cores and mat-temperature logs precisely because a road that passes cores also passes final account without dispute."] },
      { h: "What the standard demands", p: ["Compliance is not a certificate on a wall; it is a set of decisions made under time pressure. Holding the line on quality is cheaper than the maintenance bill that follows cutting it.", "The corridor that respects its geotechnical report outlives the officials who commissioned it."] },
    ],
  },
  {
    key: "energy",
    label: "Energy",
    authors: ["Dr. Funmilayo Ashiru", "GF Energy Desk", "Engr. Olumide Bankole"],
    covers: [U("photo-1509391366360-2e959784a276"), U("photo-1466611653911-95081537e5b7"), U("photo-1508514177221-188b1cf16e9d")],
    angles: ["The Real Cost of", "Sizing", "Beyond Diesel:", "The Economics of", "Engineering", "A Practical Guide to", "Why", "Rethinking", "Getting Honest About"],
    subjects: ["a Diesel Hour", "Hybrid Micro-Grids", "Battery Storage", "Commercial Solar", "O&M Contracts", "Load Audits", "Grid-Forming Inverters", "Solar-Paired Charging", "Peak-Shaving", "C&I Payback Periods", "Harmattan Yield Loss", "Genset Displacement"],
    metrics: ["₦420–₦560 per kWh of diesel power", "a 41-month payback", "99.2% uptime", "an 81% cut in diesel spend", "4.2–6.2 kWh/m²/day irradiance", "6,000-cycle LiFePO₄ banks", "a 2.4MW/4.8MWh plant", "63% lower energy cost per tonne"],
    tags: ["NERC", "the Electricity Act 2023", "NEMSA", "Band A tariffs", "DisCo interconnection rules", "the Energy Transition Plan"],
    bodyIntro: [
      "Ask a facility manager what an hour of generator runtime costs and you will get a fuel number. The problem is that fuel is barely half the bill.",
      "When we instrument a site for two weeks — actual load curves, not nameplate guesses — the honest cost of power almost always surprises the board.",
    ],
    sections: [
      { h: "The four lines your logbook skips", p: ["Maintenance, depreciation, the overhaul cliff and downtime — priced together, they push the true cost of diesel power far above the grid, and far above a properly sized hybrid system.", "None of this requires believing anything about the climate. It requires believing your own meter data."] },
      { h: "Sizing from telemetry, not thumb rules", p: ["Motor inrush collapses inverter-led grids; grid-forming inverters with 2C-rated strings absorb it. The design input is measured load, not a catalogue.", "A system guaranteed in the contract is worth more than one promised in the brochure."] },
    ],
  },
  {
    key: "it",
    label: "IT & Security",
    authors: ["Tobi Adeleke", "GF Security Operations", "Christine Chinasa"],
    covers: [U("photo-1550751827-4bd374c3f58b"), U("photo-1558494949-ef010cbdcc31"), U("photo-1461749280684-dccba630e2f6")],
    angles: ["What Actually Moved the Needle on", "A CISO's Guide to", "The Plain-English Case for", "Shipping", "Hardening", "Why", "Getting to", "Operationalising", "The 90-Day Path to"],
    subjects: ["ISO 27001", "SOC 2 Readiness", "24/7 SOC Operations", "Zero-Trust Identity", "Cloud FinOps", "Managed DevOps", "Incident Response", "Data-Loss Prevention", "AI in Production", "Device-Lifecycle Fulfilment", "NDPR Compliance", "Threat Hunting"],
    metrics: ["1.8-second endpoint containment", "certification in 11 months", "a 26-minute median deploy", "14,206 events/min ingested", "zero unplanned downtime across 40 workloads", "a 24–48h quoting SLA", "MFA on 100% of admin access", "a 6-month evidence window"],
    tags: ["NDPR", "NITDA", "the Data Protection Act 2023", "SOC 2 Type II", "NIST CSF 2.0", "CBN cybersecurity guidelines"],
    bodyIntro: [
      "When a Nigerian bank asked us to take them to ISO 27001, the previous estimate was 24 months. We signed for 14 and delivered in 11 — by removing three delays, not by working miracles.",
      "The most-repeated question in a boardroom security review is 'are we certified?'. The honest follow-up — 'would we survive the sampling?' — is the one worth answering first.",
    ],
    sections: [
      { h: "Evidence as a by-product, not a project", p: ["The month before an audit is traditionally a scramble of screenshot archaeology. Wire each control to produce its own evidence continuously and the audit becomes an export.", "This is also why the certificate survives surveillance audits without the annual panic."] },
      { h: "Scope discipline", p: ["The single biggest schedule killer in certification is scope creep dressed as thoroughness. A tight, defensible scope statement cuts the control population without weakening the story the certificate tells regulators.", "Detection you can measure beats detection you can only describe."] },
    ],
  },
  {
    key: "realestate",
    label: "Real Estate",
    authors: ["Halima Yusuf", "GF Lettings Desk", "GF Real Estate"],
    covers: [U("photo-1600585154340-be6161a56a0c"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1600596542815-ffad4c1539a9")],
    angles: ["The Occupancy Math Behind", "What Nobody Shows You About", "Pricing", "The Honest Economics of", "Building", "A Landlord's Guide to", "Why", "Underwriting"],
    subjects: ["Abuja Shortlets", "Service-Charge Discipline", "Build-to-Rent", "Commercial Voids", "Warehouse Yields", "Tenant Retention", "Estate Power Systems", "Facility Management", "Off-Plan Risk", "Diaspora Lettings", "Caution-Fee Structures", "Mixed-Use Developments"],
    metrics: ["96% stabilised occupancy", "a 62% shortlet occupancy floor", "operating costs at 38–45% of revenue", "a 210kWp rooftop array", "half of nights booked direct", "a 21-day arrears policy", "9m eaves and dock levellers", "sub-1% void rates"],
    tags: ["the Lagos Tenancy Law", "FCT land-use regulations", "REDAN standards", "stamp-duty rules", "the Land Use Act", "estate service-charge governance"],
    bodyIntro: [
      "Abuja's shortlet market runs on a seductive pitch: furnish an apartment, harvest nightly rates that triple the long-let rent. The pitch is not false. It is incomplete in ways that bankrupt first-timers.",
      "Gross yield is a vanity metric. The number that matters is what lands after housekeeping, power, commissions and the void weeks nobody advertises.",
    ],
    sections: [
      { h: "Power is the product", p: ["Read a hundred Abuja reviews and count the complaints: power dominates. Hybrid solar converts the city's biggest operational risk into a marketing line.", "If your plan says 'generator when needed', your review score has already been written."] },
      { h: "The occupancy flywheel", p: ["High occupancy is not luck; it is response time. Enquiries answered within five minutes convert at triple the rate of hour-old replies.", "Same-day confirmation, keyless entry and fast maintenance compound into direct repeat bookings that escape commission entirely."] },
    ],
  },
  {
    key: "autos",
    label: "EV & Autos",
    authors: ["Emeka Nwosu", "GF Mobility Desk", "GF Autos"],
    covers: [U("photo-1563720223185-11003d516935"), U("photo-1617788138017-80ad40651399"), U("photo-1542282088-fe8426682b8f")],
    angles: ["A Field Guide to", "The Honest Numbers on", "Why", "Rethinking", "The 5-Year Truth About", "Charging Reality:", "Debunking", "Fleet Economics of"],
    subjects: ["Charging an EV in Nigeria", "EV Total Cost of Ownership", "Range Anxiety", "BEV vs Hybrid", "Depot Charging", "Battery Longevity", "Solar-Paired Mobility", "Trade-In Valuations", "Fleet Electrification", "Resale Value", "Fast-Charging Corridors", "Home Wallbox Installs"],
    metrics: ["88% of charging done at home", "6.2 km/kWh efficiency", "an 8× lower cost per kilometre", "570km of real-world range", "18 minutes to 80% on 800V", "a 60-vehicle fleet transition", "45km of range restored per hour", "under 7% of energy from public chargers"],
    tags: ["the National Automotive Policy", "NADDC incentives", "import-duty waivers on EVs", "NERC charging tariffs", "the Energy Transition Plan", "SON vehicle standards"],
    bodyIntro: [
      "Every prospective EV buyer asks the same first question — where will I charge? Two years of fleet telematics across three Nigerian cities gives a better answer than evangelism or fear.",
      "Range anxiety is mostly a planning failure. Buy the range you need for your worst regular week, install the wallbox before the car arrives, and the maths stops being frightening.",
    ],
    sections: [
      { h: "Home is the filling station", p: ["Across our fleet, the overwhelming majority of charging happens overnight at home or depot on AC power. The requirement is a dedicated circuit and load management, not a national network.", "Several of our customers now drive on sunlight in the most literal sense."] },
      { h: "The grid is unreliable; charging is not", p: ["An EV is not a freezer — it needs enough energy across the night, not continuous power. Band A areas cover it on all but the worst weeks; solar pairing covers the rest.", "Ignore anyone who talks about charging without showing you kilowatt-hours."] },
    ],
  },
  {
    key: "ecommerce",
    label: "eCommerce",
    authors: ["Kemi Alade", "GF Commerce Desk", "GF Procurement"],
    covers: [U("photo-1586528116311-ad8dd3c8310d"), U("photo-1581092160607-ee22621dd758"), U("photo-1553413077-190dd305871c")],
    angles: ["Why 80% of", "The Logistics Behind", "Getting", "The Hidden Cost of", "Sizing", "A Buyer's Guide to", "Fixing", "Building"],
    subjects: ["Inverter Returns", "48-Hour Delivery", "Bulk Solar Procurement", "Stock Accuracy", "Last-Mile Fulfilment", "Warranty Claims", "B2B Payment Terms", "Component Sourcing", "Battery Compatibility", "Cold-Chain Hardware", "Returns Reduction", "Multi-Brand Sourcing"],
    metrics: ["a sub-1% damage rate", "99.5% stock accuracy", "48-hour delivery in three cities", "returns halved after a sizing panel", "214 stores supplied", "a 4-working-hour dispatch SLA", "30-day terms for approved accounts", "bulk pricing from 10 units"],
    tags: ["SON MANCAP", "SONCAP import rules", "FIRS VAT", "NAFDAC where applicable", "consumer-protection guidelines", "Customs HS classification"],
    bodyIntro: [
      "Our returns desk keeps honest statistics, and they point at an uncomfortable truth: customers rarely return inverters because the hardware failed. They return them because the hardware was never going to fit their load.",
      "Most returns are not product failures. They are information failures — and information is cheaper to ship than a replacement.",
    ],
    sections: [
      { h: "Sizing to the surge, not the bill", p: ["A 3.5kVA inverter carries a home comfortably until the borehole pump starts. Motors draw multiples of rated power on start-up; size to survive the worst simultaneous start.", "Our product pages publish surge ratings precisely so this arithmetic is possible before checkout."] },
      { h: "The battery-voltage trap", p: ["Right inverter, wrong-voltage battery bank accounts for a quarter of category returns on its own. Above 3kW of sustained load, 48V stops being a preference and becomes physics.", "Buy the audit before the inverter. Both are in the store."] },
    ],
  },
  {
    key: "governance",
    label: "Governance",
    authors: ["Kemi Alade", "Adaeze Okonkwo", "GF Corporate Office"],
    covers: [U("photo-1486406146926-c627a92ad1ab"), U("photo-1454165804606-c3d57bc86b40"), U("photo-1450101499163-c8848c66ca85")],
    angles: ["The Board's Guide to", "Building", "Why", "Getting Serious About", "A Practical View of", "Structuring", "What Regulators Expect from", "Documenting"],
    subjects: ["Procurement Integrity", "ESG Reporting", "Tender Compliance", "Anti-Money-Laundering Controls", "Audit-Committee Discipline", "Conglomerate Governance", "Whistleblower Frameworks", "Related-Party Transactions", "Data-Protection Governance", "Sustainability Disclosure", "Enterprise Risk", "Board Independence"],
    metrics: ["procurement above ₦25M via open tender", "an externally chaired audit committee", "annual ISO surveillance audits", "a two-tier board structure", "38% of revenue from green lines", "1,200+ local jobs supported", "zero statutory-filing lapses", "a documented risk register with budget authority"],
    tags: ["the CAMA 2020", "the FRC Code of Corporate Governance", "SCUML/EFCC AML rules", "BPP procurement thresholds", "NDPR", "FIRS statutory filings"],
    bodyIntro: [
      "Good governance is rarely the reason a company wins a contract, but bad governance is a common reason it loses one. For public and blue-chip clients, the due-diligence file is the first product they evaluate.",
      "A conglomerate is only as trustworthy as its weakest subsidiary's controls. We run one standard across eight business units precisely so no division becomes the exception.",
    ],
    sections: [
      { h: "Procurement that survives scrutiny", p: ["Contracts above a defined threshold run through open competitive tender — including our own subsidiaries, which win no work without bidding for it.", "Confident governance publishes its own rules and invites the audit."] },
      { h: "Risk with an owner", p: ["Most risk registers stall in committee. Give the register a single owner with delegated spend authority and mitigations happen in days, not quarters.", "Auditors cite the decision log as evidence of commitment — the hardest clause to fake."] },
    ],
  },
  {
    key: "macroeconomy",
    label: "Macroeconomy",
    authors: ["Kemi Alade", "GF Strategy Desk", "Adaeze Okonkwo"],
    covers: [U("photo-1451187580459-43490279c0fa"), U("photo-1526304640581-d334cdbbf45e"), U("photo-1611974789855-9c2a0a7236a3")],
    angles: ["What", "Reading", "The Business Case Under", "Planning Capex Through", "How", "Navigating", "The Naira Reality of", "Positioning for"],
    subjects: ["FX Volatility", "the 2023 Subsidy Removal", "Naira Devaluation", "Customs FX Benchmarks", "Interest-Rate Cycles", "Import Substitution", "the Electricity Act 2023", "Diaspora Remittances", "Inflation-Indexed Contracts", "the Energy Transition Plan", "Local-Content Rules", "West African Trade"],
    metrics: ["a customs FX benchmark near ₦1,530/$", "double-digit policy rates", "an 8× cost gap between diesel and solar kilometres", "48MW of import-substituting capacity", "a 3-city logistics footprint", "ECOWAS regional reach", "naira-denominated pricing discipline", "18 months of margin compression"],
    tags: ["the CBN", "Nigeria Customs Service FX rates", "the Finance Act", "NOGICD local-content rules", "the Electricity Act 2023", "AfCFTA"],
    bodyIntro: [
      "Capex decisions in Nigeria are made against a moving exchange rate, a moving policy rate, and a moving fuel price. The businesses that survive are the ones that price for the volatility instead of hoping it pauses.",
      "When the naira moves, the temptation is to freeze. The better response is to re-underwrite: which of our costs are dollarised, which of our prices can follow, and where does the customs benchmark leave the margin?",
    ],
    sections: [
      { h: "Pricing for a moving rate", p: ["We align international invoicing to the Nigeria Customs Service statutory FX benchmark, so conversions are defensible rather than opportunistic.", "Naira-first pricing with transparent conversion beats a dollar sticker that scares off the domestic buyer."] },
      { h: "Where the opportunity hides", p: ["Every devaluation cycle rewards import substitution. Locally deployed solar, locally fulfilled IT and locally built infrastructure all gain relative advantage as the naira weakens.", "The macro headwind for importers is a tailwind for capacity built on the ground."] },
    ],
  },
];

export function generateInsights(): GeneratedPost[] {
  const rng = mulberry32(20260721);
  const posts: GeneratedPost[] = [];
  const usedSlugs = new Set<string>();

  for (const v of VERTICALS) {
    for (let i = 0; i < 25; i++) {
      const angle = v.angles[Math.floor(rng() * v.angles.length)];
      const subject = v.subjects[i % v.subjects.length];
      const metric = v.metrics[Math.floor(rng() * v.metrics.length)];
      const metric2 = v.metrics[Math.floor(rng() * v.metrics.length)];
      const tag = v.tags[Math.floor(rng() * v.tags.length)];
      const author = v.authors[Math.floor(rng() * v.authors.length)];
      const cover = v.covers[Math.floor(rng() * v.covers.length)];
      const intro = v.bodyIntro[Math.floor(rng() * v.bodyIntro.length)];

      let title = `${angle} ${subject}`.replace(/\s+/g, " ").trim();
      // Vary a few titles with a metric hook for realism
      if (rng() > 0.6) title = `${subject}: ${metric.charAt(0).toUpperCase()}${metric.slice(1)}`;

      let slug = slugify(title);
      let n = 2;
      while (usedSlugs.has(slug)) slug = `${slugify(title)}-${n++}`;
      usedSlugs.add(slug);

      const excerpt = `A working note on ${subject.toLowerCase()} for Nigerian operators — grounded in ${metric} and read against ${tag}. Evidence over adjectives, as always.`;

      const bodyParts: string[] = [intro];
      for (const sec of v.sections) {
        bodyParts.push(`## ${sec.h}`);
        for (const para of sec.p) bodyParts.push(para);
      }
      bodyParts.push("## What it means for your next decision");
      bodyParts.push(
        `Read against ${tag}, the practical takeaway is simple: the operators who win here are the ones who measure ${metric2} before they commit capital, not after. Greyfusion publishes the assumptions behind these numbers because confident analysis survives scrutiny.`
      );
      bodyParts.push(
        `If this maps to something you're planning, the ${v.label} desk answers with a working model, not a brochure — talk to us before the decision, not after.`
      );

      const body = bodyParts.join("\n\n");
      const readMins = 5 + Math.floor(rng() * 5);
      const ageDays = 5 + Math.floor(rng() * 540); // spread across ~18 months

      posts.push({ title, slug, division: v.key, excerpt, body, author, coverImage: cover, readMins, ageDays });
    }
  }

  return posts;
}
