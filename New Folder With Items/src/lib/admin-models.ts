export interface AdminField {
  name: string;
  label: string;
  type: "text" | "number" | "float" | "textarea" | "checkbox" | "date" | "select" | "media";
  options?: string[];
  required?: boolean;
}

export interface AdminModel {
  key: string;
  label: string;
  singular: string;
  columns: { name: string; label: string }[];
  fields: AdminField[];
  statusField?: { name: string; options: string[] };
  creatable: boolean;
  /** When set, rows expose a "Gallery (N)" button that opens the MediaManagerModal. */
  galleryEntity?: "vehicle" | "property" | "product" | "project";
  /** Row field used to label the entity inside the gallery modal. */
  galleryLabelField?: string;
}

export const ADMIN_MODELS: AdminModel[] = [
  {
    key: "vehicles",
    label: "Vehicles",
    singular: "vehicle",
    creatable: true,
    galleryEntity: "vehicle",
    galleryLabelField: "model",
    columns: [
      { name: "make", label: "Make" }, { name: "model", label: "Model" }, { name: "powertrain", label: "Type" },
      { name: "priceNGN", label: "Price ₦" }, { name: "rangeKm", label: "Range km" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "make", label: "Make", type: "text", required: true },
      { name: "model", label: "Model", type: "text", required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "powertrain", label: "Powertrain", type: "select", options: ["BEV", "PHEV", "HEV"], required: true },
      { name: "bodyStyle", label: "Body style", type: "text", required: true },
      { name: "priceNGN", label: "Price (₦)", type: "number", required: true },
      { name: "rangeKm", label: "Range (km)", type: "number", required: true },
      { name: "batteryKwh", label: "Battery (kWh)", type: "float", required: true },
      { name: "accel", label: "0–100 (s)", type: "float", required: true },
      { name: "chargeKw", label: "Max DC charge (kW)", type: "number", required: true },
      { name: "chargeTime", label: "Charge time", type: "text", required: true },
      { name: "seats", label: "Seats", type: "number", required: true },
      { name: "colors", label: "Colors (JSON)", type: "textarea", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "featured", label: "Featured", type: "checkbox" },
    ],
  },
  {
    key: "properties",
    label: "Properties",
    singular: "property",
    creatable: true,
    galleryEntity: "property",
    galleryLabelField: "title",
    columns: [
      { name: "title", label: "Title" }, { name: "type", label: "Type" }, { name: "city", label: "City" },
      { name: "priceNGN", label: "Rent ₦/yr" }, { name: "nightlyNGN", label: "Nightly ₦" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["shortlet", "residential", "commercial", "warehousing"], required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "city", label: "City", type: "text", required: true },
      { name: "priceNGN", label: "Annual rent (₦)", type: "number", required: true },
      { name: "nightlyNGN", label: "Nightly rate (₦, shortlet)", type: "number" },
      { name: "serviceNGN", label: "Service charge (₦)", type: "number" },
      { name: "depositNGN", label: "Deposit (₦)", type: "number" },
      { name: "cautionNGN", label: "Caution (₦)", type: "number" },
      { name: "beds", label: "Beds", type: "number", required: true },
      { name: "baths", label: "Baths", type: "number", required: true },
      { name: "sqm", label: "Size (m²)", type: "number", required: true },
      { name: "amenities", label: "Amenities (JSON array)", type: "textarea", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "featured", label: "Featured", type: "checkbox" },
    ],
  },
  {
    key: "products",
    label: "Products",
    singular: "product",
    creatable: true,
    galleryEntity: "product",
    galleryLabelField: "name",
    columns: [
      { name: "name", label: "Name" }, { name: "category", label: "Dept" },
      { name: "priceNGN", label: "Price ₦" }, { name: "stock", label: "Stock" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Department", type: "select", options: ["solar", "inverters", "electronics", "smart-home", "enterprise"], required: true },
      { name: "priceNGN", label: "Price (₦)", type: "number", required: true },
      { name: "stock", label: "Stock level", type: "number", required: true },
      { name: "variants", label: "Variants (JSON)", type: "textarea" },
      { name: "specs", label: "Specs (JSON)", type: "textarea" },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "featured", label: "Featured", type: "checkbox" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    singular: "project",
    creatable: true,
    galleryEntity: "project",
    galleryLabelField: "title",
    columns: [
      { name: "title", label: "Title" }, { name: "sector", label: "Sector" },
      { name: "status", label: "Status" }, { name: "year", label: "Year" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "sector", label: "Sector", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["Completed", "Ongoing"], required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "valueBand", label: "Contract value band", type: "text", required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "client", label: "Client", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "challenge", label: "Engineering challenge", type: "textarea", required: true },
      { name: "solution", label: "Solution", type: "textarea", required: true },
    ],
  },
  {
    key: "tenders",
    label: "Tenders",
    singular: "tender",
    creatable: true,
    columns: [
      { name: "refNo", label: "Ref" }, { name: "title", label: "Title" },
      { name: "category", label: "Category" }, { name: "status", label: "Status" },
    ],
    fields: [
      { name: "refNo", label: "Reference no.", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "closingDate", label: "Closing date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["OPEN", "CLOSED"], required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
  },
  {
    key: "jobs",
    label: "Jobs",
    singular: "job",
    creatable: true,
    columns: [
      { name: "title", label: "Title" }, { name: "division", label: "Division" },
      { name: "location", label: "Location" }, { name: "type", label: "Type" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "division", label: "Division", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["Full-time", "Contract", "Hybrid"], required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "open", label: "Open for applications", type: "checkbox" },
    ],
  },
  {
    key: "posts",
    label: "Insights",
    singular: "post",
    creatable: true,
    columns: [
      { name: "title", label: "Title" }, { name: "division", label: "Division" }, { name: "author", label: "Author" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "division", label: "Division", type: "text", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "body", label: "Body (paragraphs separated by blank lines, '## ' for headings)", type: "textarea", required: true },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "readMins", label: "Read time (mins)", type: "number", required: true },
    ],
  },
  {
    key: "branding",
    label: "Branding",
    singular: "branding",
    creatable: true,
    columns: [
      { name: "siteName", label: "Site name" }, { name: "tagline", label: "Tagline" },
    ],
    fields: [
      { name: "siteName", label: "Site name", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "logoLightUrl", label: "Logo — light mode (upload or URL; blank = SVG wordmark)", type: "media" },
      { name: "logoDarkUrl", label: "Logo — dark mode (upload or URL; blank = SVG wordmark)", type: "media" },
      { name: "faviconUrl", label: "Favicon (upload .ico/.png or URL)", type: "media" },
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    singular: "nav item",
    creatable: true,
    columns: [
      { name: "label", label: "Label" }, { name: "location", label: "Location" },
      { name: "url", label: "URL" }, { name: "displayOrder", label: "Order" }, { name: "isVisible", label: "Visible" },
    ],
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "url", label: "URL / path", type: "text", required: true },
      { name: "location", label: "Location", type: "select", options: ["HEADER", "FOOTER_MAIN", "FOOTER_QUICK", "FOOTER_LEGAL"], required: true },
      { name: "target", label: "Open in", type: "select", options: ["_self", "_blank"], required: true },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isVisible", label: "Visible", type: "checkbox" },
    ],
  },
  {
    key: "social",
    label: "Social links",
    singular: "social link",
    creatable: true,
    columns: [
      { name: "platform", label: "Platform" }, { name: "iconKey", label: "Icon" }, { name: "displayOrder", label: "Order" },
    ],
    fields: [
      { name: "platform", label: "Platform name", type: "text", required: true },
      { name: "url", label: "Profile URL", type: "text", required: true },
      { name: "iconKey", label: "Icon", type: "select", options: ["linkedin", "x", "instagram", "facebook", "whatsapp", "youtube", "link"], required: true },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isVisible", label: "Visible", type: "checkbox" },
    ],
  },
  {
    key: "leadership",
    label: "Leadership",
    singular: "leader",
    creatable: true,
    columns: [
      { name: "name", label: "Name" }, { name: "role", label: "Role" }, { name: "displayOrder", label: "Order" }, { name: "isActive", label: "Active" },
    ],
    fields: [
      { name: "name", label: "Full name", type: "text", required: true },
      { name: "role", label: "Role / title", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea", required: true },
      { name: "avatarUrl", label: "Avatar (upload a file or paste a URL)", type: "media" },
      { name: "linkedIn", label: "LinkedIn URL", type: "text" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "credentials",
    label: "Credentials",
    singular: "credential",
    creatable: true,
    columns: [
      { name: "title", label: "Credential" }, { name: "authority", label: "Authority" },
      { name: "licenseNumber", label: "Number" }, { name: "isActive", label: "Active" },
    ],
    fields: [
      { name: "title", label: "Title (e.g. FIRS Tax Clearance Certificate)", type: "text", required: true },
      { name: "authority", label: "Issuing authority", type: "text", required: true },
      { name: "licenseNumber", label: "Registration / licence number", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["bidpack", "corporate", "tax", "procurement", "professional", "financial"], required: true },
      { name: "documentUrl", label: "Document — upload (bid pack ≤100MB · standard ≤10MB) or paste URL", type: "media" },
      { name: "verificationUrl", label: "External verification URL", type: "text" },
      { name: "expiryDate", label: "Expiry date (drives status pill)", type: "date" },
      { name: "fileSizeInBytes", label: "File size in bytes (auto-set on upload; set manually for URLs)", type: "number" },
      { name: "validUntil", label: "Legacy validity text (optional)", type: "text" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "pagecontent",
    label: "Page content",
    singular: "page",
    creatable: true,
    columns: [
      { name: "pageSlug", label: "Page" }, { name: "heroTitle", label: "Hero title" },
    ],
    fields: [
      { name: "pageSlug", label: "Page slug (home, about, energy, autos…)", type: "text", required: true },
      { name: "heroTitle", label: "Hero title", type: "text", required: true },
      { name: "heroSubtitle", label: "Hero subtitle", type: "textarea", required: true },
      { name: "heroVideos", label: "Hero video URLs (JSON array)", type: "textarea" },
      { name: "heroImages", label: "Hero image URLs (JSON array)", type: "textarea" },
      { name: "bodyJson", label: "Body sections (JSON)", type: "textarea" },
    ],
  },
  {
    key: "plans",
    label: "Pricing plans",
    singular: "plan",
    creatable: true,
    columns: [
      { name: "division", label: "Division" }, { name: "title", label: "Plan" },
      { name: "price", label: "Price" }, { name: "currency", label: "CCY" }, { name: "isActive", label: "Active" },
    ],
    fields: [
      { name: "division", label: "Division", type: "select", options: ["construction", "energy", "it", "smart-home", "real-estate", "autos", "commerce"], required: true },
      { name: "title", label: "Plan title", type: "text", required: true },
      { name: "price", label: "Price (0 = quoted to spec)", type: "float", required: true },
      { name: "currency", label: "Currency", type: "select", options: ["NGN", "USD", "EUR"], required: true },
      { name: "billingCycle", label: "Billing cycle", type: "select", options: ["one-time", "monthly", "annual"], required: true },
      { name: "scope", label: "Scope line (e.g. 4-bed duplex)", type: "text" },
      { name: "features", label: "Features (JSON array of strings)", type: "textarea", required: true },
      { name: "ctaText", label: "CTA text", type: "text" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "highlight", label: "Highlight (most popular)", type: "checkbox" },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "gallery",
    label: "Media galleries",
    singular: "gallery image",
    creatable: true,
    columns: [
      { name: "entityRef", label: "Attached to" }, { name: "kind", label: "Kind" },
      { name: "isMain", label: "Main" }, { name: "displayOrder", label: "Order" },
    ],
    fields: [
      { name: "entityType", label: "Entity type", type: "select", options: ["vehicle", "property", "product", "project"], required: true },
      { name: "entitySlug", label: "Entity slug (e.g. byd-seal, wuse-atrium-2bed)", type: "text", required: true },
      { name: "url", label: "Image — upload a file or paste a URL", type: "media", required: true },
      { name: "kind", label: "Kind", type: "select", options: ["image", "video"], required: true },
      { name: "altText", label: "Alt text", type: "text" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isMain", label: "Main thumbnail (unchecks others on this item)", type: "checkbox" },
    ],
  },
  {
    key: "showcase",
    label: "Showcase media",
    singular: "asset",
    creatable: true,
    columns: [
      { name: "category", label: "Category" }, { name: "entityId", label: "Entity" },
      { name: "kind", label: "Kind" }, { name: "isHeroCover", label: "Hero" },
    ],
    fields: [
      { name: "category", label: "Category", type: "select", options: ["ecommerce", "realestate", "autos", "construction", "page"], required: true },
      { name: "entityId", label: "Entity slug (product/property/vehicle/project slug)", type: "text", required: true },
      { name: "url", label: "Media (upload a file or paste a URL)", type: "media", required: true },
      { name: "kind", label: "Kind", type: "select", options: ["image", "video"], required: true },
      { name: "altText", label: "Alt text", type: "text" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isHeroCover", label: "Use as hero cover", type: "checkbox" },
    ],
  },
  {
    key: "siteconfig",
    label: "Site config",
    singular: "config entry",
    creatable: true,
    columns: [
      { name: "key", label: "Key" }, { name: "value", label: "Value" },
    ],
    fields: [
      { name: "key", label: "Key (e.g. fx_rates)", type: "text", required: true },
      { name: "value", label: "Value (JSON)", type: "textarea", required: true },
    ],
  },
  {
    key: "bookings",
    label: "Bookings",
    singular: "booking",
    creatable: false,
    columns: [
      { name: "ref", label: "Ref" }, { name: "name", label: "Guest" },
      { name: "totalNGN", label: "Total ₦" }, { name: "status", label: "Status" },
    ],
    fields: [],
    statusField: { name: "status", options: ["PENDING", "CONFIRMED", "CANCELLED", "BLOCKED"] },
  },
  {
    key: "orders",
    label: "Orders",
    singular: "order",
    creatable: false,
    columns: [
      { name: "ref", label: "Ref" }, { name: "name", label: "Customer" },
      { name: "totalNGN", label: "Total ₦" }, { name: "method", label: "Method" }, { name: "status", label: "Status" },
    ],
    fields: [],
    statusField: { name: "status", options: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
  },
  {
    key: "tickets",
    label: "Tickets",
    singular: "ticket",
    creatable: false,
    columns: [
      { name: "ref", label: "Ref" }, { name: "name", label: "Reporter" },
      { name: "severity", label: "Severity" }, { name: "status", label: "Status" },
    ],
    fields: [],
    statusField: { name: "status", options: ["OPEN", "IN_PROGRESS", "RESOLVED"] },
  },
  {
    key: "synclog",
    label: "Sync log",
    singular: "sync run",
    creatable: false,
    columns: [
      { name: "source", label: "Source" }, { name: "status", label: "Status" },
      { name: "itemCount", label: "Items" }, { name: "executedAt", label: "Executed" },
    ],
    fields: [],
  },
  {
    key: "essleads",
    label: "ESS leads",
    singular: "ESS lead",
    creatable: false,
    columns: [
      { name: "fullName", label: "Name" }, { name: "email", label: "Email" },
      { name: "dailyKwh", label: "kWh/day" }, { name: "recommendedBattery", label: "Battery" },
      { name: "status", label: "Status" },
    ],
    fields: [],
  },
  {
    key: "shquotes",
    label: "Smart-home quotes",
    singular: "quote",
    creatable: false,
    columns: [
      { name: "propertyType", label: "Property" }, { name: "zoneCount", label: "Zones" },
      { name: "estimatedCost", label: "Est. ₦" }, { name: "clientPhone", label: "Phone" },
    ],
    fields: [],
  },
];

export function getAdminModel(key: string): AdminModel | undefined {
  return ADMIN_MODELS.find((m) => m.key === key);
}
