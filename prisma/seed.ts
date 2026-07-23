/* Greyfusion Limited — seed script. Run: npm run db:seed */
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { generateInsights } from "./insights-engine";
import { scryptSync, randomBytes } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const dbPath = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath) });
const prisma = new PrismaClient({ adapter });

const day = 86_400_000;
const now = Date.now();
const d = (offsetDays: number) => new Date(now + offsetDays * day);

const vehicles = [
  { slug: "byd-dolphin", make: "BYD", model: "Dolphin", year: 2026, powertrain: "BEV", bodyStyle: "Hatchback", priceNGN: 28_500_000, rangeKm: 340, batteryKwh: 44.9, accel: 10.9, chargeKw: 60, chargeTime: "30–80% in 29 min (DC)", seats: 5, colors: [{ name: "Coral Pink", hex: "#E8A9B0" }, { name: "Surf Blue", hex: "#5B8DB8" }, { name: "Polar White", hex: "#E8EAED" }], summary: "The sensible first EV: compact, efficient and cheap to run. Real-world 340km covers a week of Abuja commuting on one charge.", featured: true },
  { slug: "mg4-ev", make: "MG", model: "MG4 EV", year: 2025, powertrain: "BEV", bodyStyle: "Hatchback", priceNGN: 32_000_000, rangeKm: 435, batteryKwh: 64, accel: 7.9, chargeKw: 140, chargeTime: "10–80% in 26 min (DC)", seats: 5, colors: [{ name: "Volcano Orange", hex: "#E2583E" }, { name: "Black Pearl", hex: "#22262C" }, { name: "Dover White", hex: "#E8EAED" }], summary: "Rear-driven, sharp to steer, and the quickest-charging car under ₦35M. The enthusiast's budget EV.", featured: false },
  { slug: "byd-atto-3", make: "BYD", model: "Atto 3", year: 2026, powertrain: "BEV", bodyStyle: "SUV", priceNGN: 38_000_000, rangeKm: 420, batteryKwh: 60.5, accel: 7.3, chargeKw: 88, chargeTime: "30–80% in 29 min (DC)", seats: 5, colors: [{ name: "Forest Green", hex: "#3E5E4C" }, { name: "Ski White", hex: "#E8EAED" }, { name: "Parkour Red", hex: "#B33A2E" }], summary: "The family-SUV default. Blade battery, generous cabin, and ground clearance that respects Nigerian estate roads.", featured: true },
  { slug: "toyota-corolla-cross-hybrid", make: "Toyota", model: "Corolla Cross Hybrid", year: 2026, powertrain: "HEV", bodyStyle: "SUV", priceNGN: 42_000_000, rangeKm: 850, batteryKwh: 1.3, accel: 11.0, chargeKw: 0, chargeTime: "Self-charging hybrid — no plug", seats: 5, colors: [{ name: "Celestite Grey", hex: "#8B939E" }, { name: "Attitude Black", hex: "#1A1D22" }, { name: "Platinum White", hex: "#E8EAED" }], summary: "No plug, no anxiety: 4.3L/100km in traffic and Toyota's hybrid system with a decade of tropical proof behind it.", featured: true },
  { slug: "hyundai-kona-electric", make: "Hyundai", model: "Kona Electric", year: 2026, powertrain: "BEV", bodyStyle: "SUV", priceNGN: 45_000_000, rangeKm: 490, batteryKwh: 65.4, accel: 7.8, chargeKw: 102, chargeTime: "10–80% in 41 min (DC)", seats: 5, colors: [{ name: "Abyss Black", hex: "#1A1D22" }, { name: "Atlas White", hex: "#E8EAED" }, { name: "Neoteric Yellow", hex: "#D9C756" }], summary: "490km of range and Hyundai's 8-year battery warranty. The long-legged crossover for interstate drivers.", featured: false },
  { slug: "byd-seal", make: "BYD", model: "Seal RWD", year: 2026, powertrain: "BEV", bodyStyle: "Sedan", priceNGN: 52_000_000, rangeKm: 570, batteryKwh: 82.5, accel: 5.9, chargeKw: 150, chargeTime: "30–80% in 26 min (DC)", seats: 5, colors: [{ name: "Arctic Blue", hex: "#7FA8C9" }, { name: "Cosmos Black", hex: "#1A1D22" }, { name: "Aurora White", hex: "#E8EAED" }], summary: "Cell-to-body structure, 570km range, and executive-sedan composure. Our best-selling EV to private buyers.", featured: true },
  { slug: "hyundai-tucson-phev", make: "Hyundai", model: "Tucson PHEV", year: 2025, powertrain: "PHEV", bodyStyle: "SUV", priceNGN: 55_000_000, rangeKm: 800, batteryKwh: 13.8, accel: 8.2, chargeKw: 7, chargeTime: "Full charge in 2h (AC wallbox)", seats: 5, colors: [{ name: "Amazon Grey", hex: "#5B6470" }, { name: "White Cream", hex: "#E8EAED" }, { name: "Deep Sea", hex: "#2F4858" }], summary: "62km of silent electric commuting, petrol freedom for the East trip. The both-worlds machine.", featured: false },
  { slug: "toyota-camry-hybrid", make: "Toyota", model: "Camry Hybrid", year: 2026, powertrain: "HEV", bodyStyle: "Sedan", priceNGN: 58_000_000, rangeKm: 900, batteryKwh: 1.6, accel: 7.8, chargeKw: 0, chargeTime: "Self-charging hybrid — no plug", seats: 5, colors: [{ name: "Precious Metal", hex: "#8B939E" }, { name: "Midnight Black", hex: "#1A1D22" }, { name: "Emotional Red", hex: "#B33A2E" }], summary: "The director's car, reinvented: 900km per tank, near-silent pull-away, and legendary resale value.", featured: false },
  { slug: "nissan-ariya", make: "Nissan", model: "Ariya", year: 2025, powertrain: "BEV", bodyStyle: "SUV", priceNGN: 62_000_000, rangeKm: 500, batteryKwh: 87, accel: 7.6, chargeKw: 130, chargeTime: "10–80% in 35 min (DC)", seats: 5, colors: [{ name: "Aurora Green", hex: "#4C6B5C" }, { name: "Burgundy", hex: "#6B2E3E" }, { name: "Pearl White", hex: "#E8EAED" }], summary: "A lounge on wheels — flat floor, haptic cabin, 500km range. Quietly one of the best-built EVs on sale.", featured: false },
  { slug: "kia-ev6", make: "Kia", model: "EV6", year: 2026, powertrain: "BEV", bodyStyle: "Crossover", priceNGN: 68_000_000, rangeKm: 528, batteryKwh: 77.4, accel: 5.2, chargeKw: 240, chargeTime: "10–80% in 18 min (350kW DC)", seats: 5, colors: [{ name: "Runway Red", hex: "#B33A2E" }, { name: "Moonscape", hex: "#5B6470" }, { name: "Snow White", hex: "#E8EAED" }], summary: "800-volt architecture: 18 minutes to 80% on a fast charger. The one that makes petrol feel slow twice.", featured: true },
  { slug: "tesla-model-3", make: "Tesla", model: "Model 3 RWD", year: 2025, powertrain: "BEV", bodyStyle: "Sedan", priceNGN: 75_000_000, rangeKm: 513, batteryKwh: 60, accel: 6.1, chargeKw: 170, chargeTime: "10–80% in 27 min (DC)", seats: 5, colors: [{ name: "Pearl White", hex: "#E8EAED" }, { name: "Deep Blue", hex: "#2F4470" }, { name: "Solid Black", hex: "#1A1D22" }], summary: "Software-first driving with the efficiency benchmark of the class. Imported to order, fully warranted by us.", featured: false },
  { slug: "mercedes-eqe-350", make: "Mercedes-Benz", model: "EQE 350+", year: 2025, powertrain: "BEV", bodyStyle: "Sedan", priceNGN: 95_000_000, rangeKm: 620, batteryKwh: 89, accel: 6.4, chargeKw: 170, chargeTime: "10–80% in 32 min (DC)", seats: 5, colors: [{ name: "Obsidian Black", hex: "#1A1D22" }, { name: "High-tech Silver", hex: "#B8BEC6" }, { name: "Sodalite Blue", hex: "#2F4470" }], summary: "620km of range wrapped in S-Class hush. The chairman's statement that boards can defend.", featured: true },
];

const properties = [
  { slug: "wuse-atrium-2bed", title: "The Wuse Atrium — 2-Bed Executive Shortlet", type: "shortlet", location: "Wuse 2", city: "Abuja", priceNGN: 0, nightlyNGN: 145_000, serviceNGN: 0, depositNGN: 0, cautionNGN: 100_000, beds: 2, baths: 2, sqm: 92, amenities: ["24/7 power (solar hybrid)", "Starlink WiFi", "Smart lock entry", "Netflix + DSTV", "Gym access", "Daily housekeeping option", "Secure parking", "CCTV estate"], summary: "Our flagship shortlet: a 92m² two-bed in the Wuse Atrium with hybrid solar power that has not blinked in 14 months. Four minutes from Emab Plaza, walkable to Wuse 2's restaurant strip.", featured: true },
  { slug: "wuse-atrium-studio", title: "The Wuse Atrium — Studio Suite", type: "shortlet", location: "Wuse 2", city: "Abuja", priceNGN: 0, nightlyNGN: 85_000, serviceNGN: 0, depositNGN: 0, cautionNGN: 50_000, beds: 1, baths: 1, sqm: 48, amenities: ["24/7 power (solar hybrid)", "Fibre WiFi", "Smart TV", "Kitchenette", "Secure parking", "Weekly housekeeping"], summary: "A compact, quiet studio for business travel — desk with monitor, blackout curtains and coffee that respects your 7am call.", featured: false },
  { slug: "vi-skyline-3bed", title: "Skyline Residence — 3-Bed Waterview Shortlet", type: "shortlet", location: "Victoria Island", city: "Lagos", priceNGN: 0, nightlyNGN: 250_000, serviceNGN: 0, depositNGN: 0, cautionNGN: 150_000, beds: 3, baths: 3, sqm: 160, amenities: ["Lagoon view", "Inverter + gen backup", "Concierge 24/7", "Pool + gym", "Chef on request", "Airport pickup", "Secure parking"], summary: "160m² on the 11th floor with a lagoon view that resets your cortisol. Hosts board retreats, film crews and families who outgrew hotels.", featured: true },
  { slug: "gra-ph-shortlet", title: "Garden City Loft — 1-Bed Shortlet", type: "shortlet", location: "GRA Phase 2", city: "Port Harcourt", priceNGN: 0, nightlyNGN: 95_000, serviceNGN: 0, depositNGN: 0, cautionNGN: 60_000, beds: 1, baths: 1, sqm: 64, amenities: ["24/7 power", "Fibre WiFi", "Washer/dryer", "Secure estate", "Housekeeping"], summary: "The PH crew-change favourite: five minutes from Trans-Amadi, laundry in-unit, and power that survives the grid.", featured: false },
  { slug: "katampe-terrace-4bed", title: "Katampe Terrace — 4-Bed Terrace Duplex", type: "residential", location: "Katampe Extension", city: "Abuja", priceNGN: 9_500_000, nightlyNGN: 0, serviceNGN: 850_000, depositNGN: 1_000_000, cautionNGN: 500_000, beds: 4, baths: 5, sqm: 240, amenities: ["All rooms en-suite", "BQ", "Solar-ready roof", "Estate security", "Green area", "Borehole water"], summary: "240m² of family logic: all-en-suite rooms, a proper BQ, and an estate that enforces its service charge. Diplomatic-zone quiet, mainland pricing.", featured: true },
  { slug: "gwarinpa-3bed-flat", title: "6th Avenue Court — 3-Bed Flat", type: "residential", location: "Gwarinpa", city: "Abuja", priceNGN: 4_200_000, nightlyNGN: 0, serviceNGN: 350_000, depositNGN: 400_000, cautionNGN: 200_000, beds: 3, baths: 3, sqm: 130, amenities: ["POP finishing", "Fitted kitchen", "Car port ×2", "Water treatment", "Gated close"], summary: "A clean, honestly-priced 3-bed in Gwarinpa's most liquid rental corridor. Ready for immediate move-in.", featured: false },
  { slug: "lekki-2bed-flat", title: "Marwa Gardens — 2-Bed Apartment", type: "residential", location: "Lekki Phase 1", city: "Lagos", priceNGN: 7_800_000, nightlyNGN: 0, serviceNGN: 1_200_000, depositNGN: 650_000, cautionNGN: 400_000, beds: 2, baths: 2, sqm: 105, amenities: ["24/7 estate power", "Pool + gym", "Elevator", "Concierge", "Visitor parking"], summary: "Phase 1 without the flood stories: raised development, serviced to an actual standard, five minutes from the toll gate.", featured: false },
  { slug: "asokoro-5bed-detached", title: "Asokoro Ridge — 5-Bed Detached + Pool", type: "residential", location: "Asokoro", city: "Abuja", priceNGN: 15_000_000, nightlyNGN: 0, serviceNGN: 1_500_000, depositNGN: 2_000_000, cautionNGN: 1_000_000, beds: 5, baths: 6, sqm: 420, amenities: ["Private pool", "2-room BQ", "Study + cinema", "Full solar system", "Panic room", "Landscaped 1,100m² plot"], summary: "A 420m² statement on Asokoro ridge with a full Greyfusion solar installation — the power bill is a rounding error.", featured: true },
  { slug: "wuse-office-floor", title: "Emab Corridor — 380m² Office Floor", type: "commercial", location: "Wuse 2", city: "Abuja", priceNGN: 18_000_000, nightlyNGN: 0, serviceNGN: 2_400_000, depositNGN: 3_000_000, cautionNGN: 1_500_000, beds: 0, baths: 4, sqm: 380, amenities: ["Open floor plate", "3-phase + inverter backup", "2 passenger lifts", "40 parking bays (shared)", "Fibre from 2 providers"], summary: "An uninterrupted 380m² floor plate in the Emab commercial corridor — fit out to your plan, power and fibre already solved.", featured: false },
  { slug: "vi-retail-unit", title: "Adeola Odeku — Prime Retail Unit", type: "commercial", location: "Victoria Island", city: "Lagos", priceNGN: 22_000_000, nightlyNGN: 0, serviceNGN: 2_800_000, depositNGN: 3_500_000, cautionNGN: 1_800_000, beds: 0, baths: 2, sqm: 210, amenities: ["12m street frontage", "Double-height ceiling", "Dedicated transformer", "Loading bay", "Signage rights"], summary: "210m² with twelve metres of Adeola Odeku frontage. Footfall you can bank, signage rights included.", featured: false },
  { slug: "idu-warehouse-1200", title: "Idu Industrial — 1,200m² Warehouse", type: "warehousing", location: "Idu Industrial District", city: "Abuja", priceNGN: 14_500_000, nightlyNGN: 0, serviceNGN: 900_000, depositNGN: 2_000_000, cautionNGN: 1_000_000, beds: 0, baths: 2, sqm: 1200, amenities: ["9m eaves height", "2 dock levellers", "40-tonne access road", "Fire hydrant system", "Fenced yard 2,000m²", "24/7 security"], summary: "1,200m² clear-span with 9m eaves and rail-corridor logistics access. FMCG and pharma tenants next door.", featured: false },
  { slug: "trans-amadi-warehouse", title: "Trans-Amadi — 800m² Warehouse + Yard", type: "warehousing", location: "Trans-Amadi", city: "Port Harcourt", priceNGN: 11_000_000, nightlyNGN: 0, serviceNGN: 700_000, depositNGN: 1_500_000, cautionNGN: 800_000, beds: 0, baths: 2, sqm: 800, amenities: ["7.5m eaves", "Gantry-crane ready", "Oil & gas zone proximity", "Hardstanding yard", "Security post"], summary: "800m² in the heart of PH's industrial engine — crane-ready structure, laydown yard, and the address your logistics team wants.", featured: false },
];

const products = [
  { slug: "gf-p580m-panel", name: "GF-P580M 580W TOPCon Bifacial Panel", category: "solar", priceNGN: 185_000, stock: 240, variants: [{ label: "Pack", options: ["Single", "Pallet of 36"] }], specs: [{ k: "Rated power", v: "580Wp" }, { k: "Efficiency", v: "22.6%" }, { k: "Cell type", v: "N-type TOPCon bifacial" }, { k: "Warranty", v: "30-yr linear / 12-yr product" }, { k: "Dimensions", v: "2278 × 1134 × 30 mm" }], summary: "Our flagship utility-grade module — the same panel on the Zenith Agro plant roof.", featured: true },
  { slug: "gf-p450m-panel", name: "GF-P450M 450W Mono PERC Panel", category: "solar", priceNGN: 120_000, stock: 380, variants: [{ label: "Pack", options: ["Single", "Pallet of 31"] }], specs: [{ k: "Rated power", v: "450Wp" }, { k: "Efficiency", v: "21.3%" }, { k: "Warranty", v: "25-yr linear" }], summary: "The residential workhorse: proven PERC cells at the best naira-per-watt in our catalogue.", featured: false },
  { slug: "gf-bat-15k", name: "GF-BAT-15K 15.36kWh LiFePO₄ Battery", category: "solar", priceNGN: 6_900_000, stock: 18, variants: [{ label: "Comms", options: ["CAN", "RS485"] }], specs: [{ k: "Capacity", v: "15.36 kWh" }, { k: "Chemistry", v: "LiFePO₄" }, { k: "Cycle life", v: "6,000 @ 80% DoD" }, { k: "Peak discharge", v: "150A" }, { k: "Warranty", v: "10 years" }], summary: "Rack-mount storage engineered for 35°C ambient — the backbone of our hybrid installs.", featured: true },
  { slug: "gf-bat-5k", name: "GF-BAT-5K 5.12kWh Wall-Mount Battery", category: "solar", priceNGN: 2_450_000, stock: 42, variants: [{ label: "Colour", options: ["Graphite", "White"] }], specs: [{ k: "Capacity", v: "5.12 kWh" }, { k: "Chemistry", v: "LiFePO₄" }, { k: "Cycle life", v: "6,000 @ 80% DoD" }, { k: "Stackable", v: "Up to 6 units (30.7 kWh)" }], summary: "Start with one, stack to six. The apartment-friendly battery that grows with your load.", featured: false },
  { slug: "gf-inv-10k", name: "GF-INV-10K 10kW Hybrid Inverter", category: "inverters", priceNGN: 4_800_000, stock: 14, variants: [{ label: "Phase", options: ["Single-phase", "Three-phase"] }], specs: [{ k: "Rated output", v: "10 kW" }, { k: "Max efficiency", v: "97.6%" }, { k: "MPPT", v: "2 trackers, 22A each" }, { k: "Parallel", v: "Up to 10 units" }, { k: "Warranty", v: "5 years (ext. to 10)" }], summary: "Whole-home or light-commercial hybrid with generator input and UPS-grade 10ms transfer.", featured: true },
  { slug: "gf-inv-6k", name: "GF-INV-6K 6kW Hybrid Inverter", category: "inverters", priceNGN: 2_400_000, stock: 26, variants: [{ label: "Phase", options: ["Single-phase"] }], specs: [{ k: "Rated output", v: "6 kW" }, { k: "Max efficiency", v: "97.3%" }, { k: "MPPT", v: "2 trackers" }, { k: "Warranty", v: "5 years" }], summary: "The 3-bedroom sweet spot: runs ACs on solar by day, silent battery power by night.", featured: false },
  { slug: "gf-inv-3-5k", name: "GF-INV-3.5K 3.5kVA Hybrid Inverter", category: "inverters", priceNGN: 1_350_000, stock: 3, variants: [{ label: "Phase", options: ["Single-phase"] }], specs: [{ k: "Rated output", v: "3.5 kVA" }, { k: "Max efficiency", v: "96.8%" }, { k: "Warranty", v: "3 years" }], summary: "Entry-level hybrid for flats and small offices — fridge, lights, WiFi and TV without drama.", featured: false },
  { slug: "gf-mount-kit", name: "Roof Mounting Kit (8-Panel, Pitched)", category: "solar", priceNGN: 165_000, stock: 55, variants: [{ label: "Roof", options: ["Aluzinc longspan", "Stone-coated", "Concrete"] }], specs: [{ k: "Capacity", v: "8 panels" }, { k: "Material", v: "Anodised aluminium" }, { k: "Wind rating", v: "160 km/h" }], summary: "Rails, mid/end clamps and roof hooks — everything between panel and roof, engineered as a kit.", featured: false },
  { slug: "gf-tv-65-qled", name: 'Fusion View 65" QLED 4K Smart TV', category: "electronics", priceNGN: 1_250_000, stock: 12, variants: [{ label: "Size", options: ['55"', '65"', '75"'] }], specs: [{ k: "Panel", v: "QLED 4K 120Hz" }, { k: "OS", v: "Google TV" }, { k: "Power draw", v: "140W typical — inverter friendly" }], summary: "Cinema-grade QLED chosen for low power draw — pairs beautifully with battery evenings.", featured: false },
  { slug: "gf-laptop-pro14", name: "FusionBook Pro 14 (Ultra 7 / 32GB / 1TB)", category: "electronics", priceNGN: 1_850_000, stock: 9, variants: [{ label: "RAM/Storage", options: ["16GB / 512GB", "32GB / 1TB"] }], specs: [{ k: "CPU", v: "Intel Core Ultra 7" }, { k: "Display", v: '14" 2.8K OLED' }, { k: "Battery", v: "70Wh — full workday" }, { k: "Warranty", v: "2 years on-site (Abuja/Lagos)" }], summary: "The consultant's machine: OLED clarity, all-day battery, and on-site warranty service.", featured: false },
  { slug: "gf-earbuds-anc", name: "Fusion Buds ANC Pro", category: "electronics", priceNGN: 145_000, stock: 60, variants: [{ label: "Colour", options: ["Graphite", "White", "Vermilion"] }], specs: [{ k: "ANC", v: "-42dB adaptive" }, { k: "Battery", v: "8h + 24h case" }, { k: "Rating", v: "IPX5" }], summary: "Generator hum, cancelled. Our best-selling stocking-filler for open-plan sanity.", featured: false },
  { slug: "gf-cam-kit4", name: "SecureSight 4-Camera PoE Kit", category: "smart-home", priceNGN: 385_000, stock: 21, variants: [{ label: "Storage", options: ["1TB NVR", "2TB NVR"] }], specs: [{ k: "Resolution", v: "4MP colour night vision" }, { k: "Power", v: "PoE — one cable per camera" }, { k: "App", v: "iOS/Android with offline recording" }], summary: "Four 4MP PoE cameras plus NVR, installed in a day. Works through NEPA outages on 30W.", featured: true },
  { slug: "gf-smart-lock", name: "GateGuard Smart Lock (Fingerprint + App)", category: "smart-home", priceNGN: 185_000, stock: 34, variants: [{ label: "Finish", options: ["Matte black", "Brushed steel"] }], specs: [{ k: "Access", v: "Fingerprint, PIN, card, app, key" }, { k: "Battery", v: "8,000 openings per charge" }, { k: "Rating", v: "IP65 outdoor" }], summary: "Five ways in for you, none for anyone else. The shortlet operator's favourite.", featured: false },
  { slug: "gf-video-doorbell", name: "GateGuard Video Doorbell Pro", category: "smart-home", priceNGN: 145_000, stock: 30, variants: [{ label: "Power", options: ["Wired", "Battery"] }], specs: [{ k: "Resolution", v: "2K HDR, 160° view" }, { k: "Talk", v: "Two-way, noise-cancelled" }, { k: "Storage", v: "Local SD + encrypted cloud" }], summary: "See and speak to the gate from anywhere — pairs with GateGuard locks for one-tap entry.", featured: false },
  { slug: "gf-ac-controller", name: "FusionSense Smart AC Controller", category: "smart-home", priceNGN: 95_000, stock: 48, variants: [{ label: "Pack", options: ["Single", "3-pack"] }], specs: [{ k: "Compatibility", v: "Any remote-controlled split AC" }, { k: "Sensing", v: "Temp + humidity + occupancy" }, { k: "Savings", v: "Up to 30% cooling energy" }], summary: "Turns any split AC into a scheduled, occupancy-aware smart unit — the cheapest kWh is the one you don't cool an empty room with.", featured: false },
  { slug: "gf-mesh-wifi", name: "FusionMesh WiFi 6 (3-Pack)", category: "smart-home", priceNGN: 295_000, stock: 27, variants: [{ label: "Pack", options: ["2-pack", "3-pack"] }], specs: [{ k: "Standard", v: "WiFi 6 AX3000" }, { k: "Coverage", v: "Up to 550m²" }, { k: "Backhaul", v: "Wired or wireless" }], summary: "Dead zones die here. Duplex-wide coverage with roaming that video calls don't notice.", featured: false },
  { slug: "gf-rack-server", name: "FusionEdge R2 Rack Server (Xeon / 64GB)", category: "enterprise", priceNGN: 4_200_000, stock: 5, variants: [{ label: "Config", options: ["Xeon Silver / 64GB / 4×2TB", "Xeon Gold / 128GB / 8×2TB"] }], specs: [{ k: "Form factor", v: "2U rack" }, { k: "PSU", v: "Dual hot-swap 800W" }, { k: "Warranty", v: "3-yr NBD on-site" }], summary: "On-prem compute for banks and agencies that keep data in-country. Deployed by our IT division.", featured: false },
  { slug: "gf-ups-3kva", name: "PowerBridge 3kVA Online UPS", category: "enterprise", priceNGN: 850_000, stock: 16, variants: [{ label: "Runtime", options: ["Internal batteries", "External bank ready"] }], specs: [{ k: "Topology", v: "Double-conversion online" }, { k: "Transfer", v: "0ms" }, { k: "Output", v: "Pure sine wave" }], summary: "Zero-millisecond transfer for server rooms and medical equipment. NEPA never touches your load.", featured: false },
  { slug: "gf-switch-48", name: "FusionNet 48-Port PoE+ Managed Switch", category: "enterprise", priceNGN: 620_000, stock: 0, variants: [{ label: "Uplink", options: ["4×10G SFP+"] }], specs: [{ k: "Ports", v: "48 × GbE PoE+ (740W budget)" }, { k: "Management", v: "L2+ CLI/Web" }, { k: "Warranty", v: "Limited lifetime" }], summary: "One switch for the whole floor — cameras, APs and phones on a single PoE budget.", featured: false },
];

const projects = [
  { slug: "karu-jikwoyi-dual-carriageway", title: "Karu–Jikwoyi Dual Carriageway", sector: "Roads & Highways", status: "Completed", location: "FCT, Abuja", valueBand: "₦8B – ₦12B", year: 2024, client: "FCT Ministry of Works", summary: "9.6km of dual carriageway with 14 box culverts, solar street lighting and pedestrian infrastructure, delivered through two rainy seasons without a single lost-time incident.", challenge: "The corridor crosses three seasonal streams and carried live traffic of 22,000 vehicles daily. Conventional phasing would have closed the route for eight months — politically and economically unacceptable — while lateritic subgrade CBR values as low as 4% ruled out standard pavement design.", solution: "We ran night-shift half-carriageway construction with precast box culverts cast off-site, cutting stream-crossing closures to 72 hours each. The pavement was redesigned as cement-stabilised subbase over geogrid, lifting effective CBR above 30% and shaving ₦640M off the earthworks bill — savings returned to the client against solar lighting." },
  { slug: "zenith-agro-microgrid", title: "Zenith Agro 2.4MW Hybrid Micro-Grid", sector: "Industrial / Energy", status: "Completed", location: "Kaduna State", valueBand: "₦2.5B – ₦4B", year: 2025, client: "Zenith Agro Group", summary: "A 2.4MWp solar array with 4.8MWh of storage and synchronised 1.5MVA generator backup powering a rice-processing complex — 99.2% uptime since commissioning.", challenge: "Milling loads spike 6× in under a second when hullers engage, which collapses conventional inverter-led grids. Diesel gensets ran 22 hours daily at ₦38M monthly, and the 33kV feeder averaged eleven outages a week.", solution: "Our energy division specified grid-forming inverters with 2C-rated battery strings to absorb motor inrush, while the construction division delivered the substation and cable trenching as one contract. Generator runtime fell to 90 minutes a day; the plant's energy cost per tonne of rice dropped 63%." },
  { slug: "meridian-hq-fitout", title: "Meridian Trust Bank — HQ Structural Retrofit", sector: "Commercial Buildings", status: "Completed", location: "Central Business District, Abuja", valueBand: "₦1B – ₦2.5B", year: 2023, client: "Meridian Trust Bank", summary: "Structural strengthening and full MEP replacement of a 9-storey banking headquarters — occupied throughout, zero branch downtime.", challenge: "A 2001-era frame showed carbonation-induced rebar corrosion in 40% of sampled columns, but the bank could not vacate: trading floors and the data centre had to run through construction with vibration limits of 2mm/s.", solution: "Carbon-fibre wrapping and low-vibration hydro-demolition let us strengthen columns floor by floor at night. The data centre was migrated to an interim modular room built by our IT division in the car park — then back — with switchovers during trading holidays. Handover came in 11 days early." },
  { slug: "idu-logistics-park", title: "Idu Rail-Linked Logistics Park — Phase 1", sector: "Industrial / Warehousing", status: "Ongoing", location: "Idu, Abuja", valueBand: "₦4B – ₦8B", year: 2026, client: "Harmattan Foods / GF Real Estate JV", summary: "Four 1,200m² clear-span warehouses with rail siding access, 40-tonne pavements and a 600kWp solar canopy — Phase 1 of a 12-unit park.", challenge: "Black cotton soil across 60% of the site swells and shrinks seasonally, historically condemning Idu slabs to early failure, while the programme demanded steel erection to start before the rains.", solution: "We excavated and replaced 1.2m of expansive clay with cement-stabilised laterite under a monolithic post-tensioned slab — faster and 18% cheaper than piling. Steel packages were fabricated in parallel in Kaduna, letting erection begin nine days after slab cure." },
  { slug: "unity-mfb-branch-rollout", title: "Unity MicroFinance — 12-Branch Design-Build", sector: "Commercial Buildings", status: "Completed", location: "Nationwide (6 states)", valueBand: "₦1B – ₦2.5B", year: 2024, client: "Unity MicroFinance Bank", summary: "Twelve identical 280m² branch buildings delivered across six states in 40 weeks using a kit-of-parts design — every branch solar-powered from day one.", challenge: "Identical branches, wildly different sites: soil conditions from Sokoto sand to Bayelsa swamp, six state approval regimes, and a hard CBN licensing deadline that fined the client per late branch.", solution: "One structural kit, three foundation variants pre-engineered per soil class. Regional subcontractor cells from our 240-firm bench built four branches each while a flying QA team enforced a single standard. All twelve passed CBN inspection first time; the client's fine exposure: zero." },
  { slug: "eko-atlantic-office-struct", title: "Delta Deepwater Services — Operations Base", sector: "Oil & Gas Infrastructure", status: "Ongoing", location: "Onne, Rivers State", valueBand: "₦2.5B – ₦4B", year: 2026, client: "Delta Deepwater Services", summary: "A marine-grade operations base: 3-storey office block, 900m² workshop with 20-tonne overhead crane, and chloride-resistant concrete throughout.", challenge: "Salt-laden air and a high water table demanded durability detailing beyond standard practice; the client's insurers required a 50-year design life certification on the crane runway beams.", solution: "We specified GGBS-blended concrete with 60mm cover and stainless rebar in splash zones, validated by 90-day chloride migration testing. Crane runways were designed to Eurocode fatigue class with third-party certification from the outset — insurance sign-off came without a single query." },
  { slug: "wuse-atrium-development", title: "The Wuse Atrium Residences", sector: "Residential Development", status: "Completed", location: "Wuse 2, Abuja", valueBand: "₦2.5B – ₦4B", year: 2023, client: "Greyfusion Real Estate", summary: "Our own 38-unit residential development: build-to-rent apartments over retail, hybrid solar power plant, and 96% occupancy since opening.", challenge: "As both developer and contractor we set ourselves a brutal brief: hotel-grade uptime on power and water in central Abuja at rents the upper-middle market would actually pay — with a 20-month construction window on a tight urban site.", solution: "A 210kWp rooftop array with 430kWh storage was designed into the structure, not bolted on, cutting diesel to a backup role. Modular bathroom pods manufactured off-site saved 11 weeks. The building now serves as our permanent proof-of-concept — prospective clients tour it weekly." },
  { slug: "gwagwalada-water-scheme", title: "Gwagwalada Township Water Reticulation", sector: "Water Infrastructure", status: "Completed", location: "Gwagwalada, FCT", valueBand: "₦1B – ₦2.5B", year: 2022, client: "FCT Water Board", summary: "42km of HDPE reticulation, two 1,500m³ elevated tanks and 3,800 metered connections serving a township of 90,000.", challenge: "Legacy asbestos-cement mains had a 60% loss rate and undocumented routing; excavation risked cutting the very supply residents depended on during works.", solution: "We ran new HDPE mains in parallel corridors with night-time tie-ins zone by zone, keeping supply live throughout. GIS as-builts and district metering were handed over with the works — the Board now measures losses below 12% and bills what it pumps." },
];

const tenders = [
  { refNo: "GF-RFP-2026-014", title: "Supply of 1,200 tonnes of reinforcement steel (BS4449 B500B)", category: "Supply — Steel & Rebar", closingDate: d(5), status: "OPEN", description: "Supply and delivery of high-yield deformed bars (12mm–32mm) to the Idu Logistics Park site in three call-off batches between September and December 2026. Mill certificates and SONCAP required. Bid security: 2% bank guarantee." },
  { refNo: "GF-RFP-2026-015", title: "Subcontract: 4.2km stormwater drainage — Idu Logistics Park", category: "Civil Works", closingDate: d(12), status: "OPEN", description: "Precast U-drain supply and installation including excavation in stabilised laterite, 900mm–1500mm sections, with 14-week programme. COREN-supervised QA; plant schedule to accompany bid." },
  { refNo: "GF-RFP-2026-016", title: "O&M subcontract: 14 commercial solar sites (Abuja cluster)", category: "Energy Services", closingDate: d(21), status: "OPEN", description: "Two-year operations and maintenance of 14 grid-tied and hybrid sites totalling 3.1MWp: quarterly IV-curve tracing, thermal inspection, inverter servicing and 4-hour fault response SLA. NIMASA-style penalty regime applies." },
  { refNo: "GF-RFP-2026-017", title: "Framework: HVAC installation partners (Abuja / Lagos / PH)", category: "Mechanical / HVAC", closingDate: d(30), status: "OPEN", description: "Three-year framework for VRF and ducted-split installation across commercial fit-out projects. Applicants must show OEM certification (Daikin, LG or Midea) and at least three completed projects above ₦120M." },
  { refNo: "GF-RFP-2026-012", title: "Supply of 3,000 solar street-lighting poles with fittings", category: "Supply — Electrical", closingDate: d(3), status: "OPEN", description: "Galvanised 9m poles with 80W integrated solar luminaires for highway projects, delivered to Abuja and Kaduna depots. Type-test certificates and 5-year warranty mandatory. Closing imminent — late bids will not be opened." },
  { refNo: "GF-RFP-2026-009", title: "Haulage framework: heavy plant mobilisation (nationwide)", category: "Plant Hire / Logistics", closingDate: d(-6), status: "CLOSED", description: "Nationwide low-loader haulage of excavators, pavers and cranes. This tender closed on schedule; award letters issued. Register as a vendor to be notified of the next framework cycle." },
];

const jobs = [
  { slug: "senior-structural-engineer", title: "Senior Structural Engineer", division: "Construction", location: "Abuja", type: "Full-time", summary: "Lead structural design and site supervision on commercial and industrial projects up to ₦4B.", description: "You will own structural packages from concept to as-built across 3–4 concurrent projects: design in Eurocodes/BS, check subcontractor shop drawings, and hold the line on site quality. Requirements: COREN registration, 7+ years post-NYSC with at least 3 in design-and-build, proficiency in Prota/ETABS and a portfolio you can defend under questioning. You'll mentor two graduate engineers and report to the Division MD." },
  { slug: "solar-project-engineer", title: "Solar Project Engineer", division: "Energy", location: "Abuja / field", type: "Full-time", summary: "Design and commission hybrid solar systems from 50kWp to multi-MW micro-grids.", description: "PVSyst modelling, single-line diagrams, battery sizing from telemetry, and hands-on commissioning weeks on client sites. Requirements: electrical engineering degree, 4+ years in C&I solar, deep familiarity with grid-forming hybrid inverters, and a driving licence — our sites are where the sun is, not where the office is. COREN or NEMSA certification is a strong plus." },
  { slug: "soc-analyst-l2", title: "SOC Analyst (L2)", division: "IT", location: "Abuja (24/7 shift)", type: "Full-time", summary: "Triage, investigate and contain incidents in our 24/7 security operations centre.", description: "You sit at the sharp end of the SOC that protects Nigerian banks: EDR investigations, SIEM tuning, threat hunting and incident containment with a 1.8-second isolation benchmark to beat. Requirements: 3+ years blue-team experience, comfort with KQL/Sigma, and at least one of GCIH, BTL2 or equivalent hands-on certification. Shift allowance, training budget, and a clear path to L3/IR lead." },
  { slug: "devops-engineer", title: "DevOps Engineer", division: "IT", location: "Hybrid — Abuja", type: "Hybrid", summary: "Build and run CI/CD, IaC and observability for client platforms.", description: "Terraform, GitHub Actions, Kubernetes and the discipline to leave everything better documented than you found it. You'll onboard client teams onto pipelines that cut deploy times from days to minutes, and carry a light on-call rotation with real compensation. Requirements: 4+ years, strong Linux fundamentals, one major cloud (AWS or Azure) at production depth." },
  { slug: "property-manager", title: "Property Manager", division: "Real Estate", location: "Abuja", type: "Full-time", summary: "Run a 60-unit residential and shortlet portfolio to a 96% occupancy standard.", description: "Tenant relations, service-charge administration, maintenance dispatch and shortlet turnover quality control. You'll manage two facility officers and a cleaning contractor, and you'll be judged on three numbers: occupancy, arrears, and maintenance response time. Requirements: 5+ years in property/facility management, ruthless documentation habits, and calm under tenant fire." },
  { slug: "ev-sales-executive", title: "EV Sales Executive", division: "Autos", location: "Abuja showroom", type: "Full-time", summary: "Sell electric mobility to first-time EV buyers — education first, close second.", description: "Most of our buyers have never driven an EV; you will be their first honest answer on range, charging and resale. Test drives, TCO walk-throughs, trade-in coordination and follow-through to delivery day. Requirements: 3+ years consultative sales (auto, insurance or premium retail), full driving licence, and genuine curiosity about the technology. Saturdays are showroom days; weekday off in lieu." },
  { slug: "ecommerce-ops-lead", title: "eCommerce Operations Lead", division: "Commerce", location: "Abuja", type: "Full-time", summary: "Own order-to-doorstep: inventory accuracy, dispatch SLAs and the 48-hour promise.", description: "You'll run warehouse ops, courier partnerships and the order desk — the machinery behind our 48-hour delivery promise in three cities. KPIs: stock accuracy above 99.5%, dispatch within 4 working hours, sub-1% damage rate. Requirements: 4+ years in ecommerce/FMCG operations, spreadsheet fluency that borders on showing off, and calm escalation instincts." },
  { slug: "automation-systems-engineer", title: "Automation & Security Systems Engineer", division: "Smart Home", location: "Abuja", type: "Full-time", summary: "Design and commission smart-home and access-control systems for residential and commercial sites.", description: "KNX/Zigbee/Z-Wave system design, CCTV and access-control commissioning, BMS integration and client handover training across 3–5 concurrent installations. Requirements: electrical/electronics degree, 3+ years in automation or security systems, fluency reading floor plans, and the patience to explain a scene controller to a retired general. Driving licence required; Lagos and PH travel occasional." },
  { slug: "quantity-surveyor", title: "Quantity Surveyor", division: "Construction", location: "Port Harcourt", type: "Contract", summary: "Cost management on the Delta Deepwater operations base — 18-month contract.", description: "Interim valuations, subcontractor accounts, variation pricing and final accounts on a live ₦3B+ marine-grade industrial project. Requirements: NIQS membership, 5+ years post-qualification including at least one oil-and-gas-adjacent project, and fluency with CESMM/NRM measurement. Contract runs to project close-out with extension likely into Phase 2." },
];

const posts = [
  {
    slug: "real-cost-of-a-diesel-hour",
    title: "The Real Cost of a Diesel Hour",
    division: "Energy",
    author: "Dr. Funmilayo Ashiru",
    readMins: 7,
    excerpt: "Your generator's logbook is lying to you. When you price a diesel hour honestly — fuel, wear, capital and downtime — solar-hybrid stops being an environmental decision and becomes an accounting one.",
    body: `Ask a facility manager what an hour of generator runtime costs and you will usually get a fuel number: litres burned times pump price. At ₦1,100 per litre and 40 litres an hour on a 250kVA set, that is ₦44,000 — painful, but apparently survivable. The problem is that fuel is barely half the bill.

## The four lines your logbook skips

Start with maintenance. A 250kVA diesel engine wants oil, filters and attention every 250 running hours. Priced honestly — parts, technician callouts, and the coolant nobody budgets — that adds roughly ₦180 per kWh generated. Then depreciation: a ₦28M generator run 5,000 hours a year is consuming its own ₦2.8M of value annually before overhaul reserves. Third, the overhaul cliff itself: top-end work at 10,000 hours, major rebuild at 20,000, each costing 30–60% of a new machine.

The fourth line is the one boards feel but never itemise: downtime. When the set trips on a Friday evening, you are not saving the diesel — you are paying for it in spoiled inventory, missed transactions and staff overtime. Across the industrial clients we audit, unplanned generator downtime costs between ₦3,000 and ₦11,000 per kVA per year.

## What the audit usually finds

When we instrument a site for two weeks — actual load curves, not nameplate guesses — the honest cost of diesel power lands between ₦420 and ₦560 per kWh. Band A grid power, when it shows, costs ₦225. A properly sized solar-hybrid system, amortised over its warranted life, delivers at ₦140–₦190 per kWh.

That spread is why our proposals lead with a payback period, not a sustainability slide. At Zenith Agro's rice complex, 2.4MW of solar with 4.8MWh of storage cut generator runtime from 22 hours a day to 90 minutes. Diesel spend fell 81%. The system cleared its capital cost in 41 months — faster than the client's own hurdle rate for plant investment.

## The decision, reframed

None of this requires believing anything about the climate. It requires believing your own meter data. Run the two-week audit, price the diesel hour honestly, and the question stops being whether you can afford solar-hybrid. It becomes how much longer you can afford the logbook fiction.

Our estimator on this site uses the same zone irradiance values and tariff assumptions we defend in audits. Start there; argue with the assumptions; then let a site survey settle it.`,
  },
  {
    slug: "why-nigerian-roads-fail-early",
    title: "Why Nigerian Roads Fail Early — and the Spec That Stops It",
    division: "Construction",
    author: "Ibrahim Suleiman",
    readMins: 8,
    excerpt: "Most premature road failures trace to three decisions made before any asphalt is laid. A veteran of 96km of carriageway explains where the money should actually go.",
    body: `Drive any federal corridor and you can read its construction history in the potholes. The failures cluster in patterns: alligator cracking where subgrade was never stabilised, edge collapse where drainage was value-engineered away, and rutting where a contractor chased tonnage instead of compaction. None of these begin at the surface. They begin in the bill of quantities.

## Failure one: pretending the subgrade is fine

Nigerian lateritic soils are honest materials with dishonest reputations. Tested properly, many corridors return CBR values of 4–8% in the wet season — far below what a standard pavement design assumes. The cheap response is to design for the dry-season number and hope. The correct response costs 8–12% more upfront: cement or lime stabilisation, or geogrid reinforcement, lifting the effective platform above CBR 30%. On the Karu–Jikwoyi corridor this redesign actually saved money overall, because a stronger platform allowed a thinner, cheaper pavement stack.

## Failure two: drainage as decoration

Water does not destroy roads dramatically; it destroys them administratively — one saturated wet season at a time. Side drains that stop 200m short of a discharge point, culverts sized from habit rather than catchment hydrology, medians that pond. Our rule on every corridor: the drainage design is reviewed by someone who did not produce it, against a 25-year storm, before earthworks begin. Boring, unglamorous, decisive.

## Failure three: paying for tonnes, not density

Asphalt contracts priced purely per tonne invite a specific fraud: material spread thick and rolled thin. The fix is procedural, not moral. We tie interim payments to density cores and mat temperature logs — every 500 tonnes, independently sampled. Contractors grumble for exactly one project, then discover that a road that passes cores also passes final account without dispute.

## What clients should actually demand

Three documents predict a road's lifespan better than any brand name: the wet-season geotechnical report, the drainage calculation package, and the compaction QA plan with payment linked to it. If a bid cannot produce all three, its low price is a loan you will repay through maintenance.

We publish our QA templates to clients because confident engineering survives scrutiny. Roads should outlive the officials who commission them — the specification is where that promise is kept or broken.`,
  },
  {
    slug: "iso-27001-in-11-months",
    title: "ISO 27001 in 11 Months: What Actually Moved the Needle",
    division: "IT",
    author: "Tobi Adeleke",
    readMins: 7,
    excerpt: "Meridian Trust Bank went from first gap assessment to certification in under a year. The accelerants were not tools — they were three unfashionable management decisions.",
    body: `When Meridian Trust Bank asked us to take them to ISO 27001, their previous consultants had estimated 24 months. We signed for 14 and delivered in 11. Nothing about that timeline required heroics; it required removing the three delays that quietly consume most certification programmes.

## Decision one: the risk register got an owner with budget

Most ISMS programmes stall in committee. Risks are identified, logged, discussed, and reassigned — a carousel that produces minutes instead of mitigations. Meridian's CIO broke the pattern by giving the risk register a single owner with delegated spend authority up to a defined threshold. Mitigation decisions that previously waited six weeks for a steering committee happened in six days. Auditors later cited the decision log as evidence of management commitment — the hardest clause to fake.

## Decision two: evidence became a by-product, not a project

The month before an audit is traditionally a scramble of screenshot archaeology. We refused to run it that way. Every control was wired to produce its own evidence continuously: access reviews exported automatically on completion, patch compliance snapshotted weekly, incident tickets templated with the fields Annex A asks about. By audit week, the evidence pack was an export, not an expedition. This is also why the certificate survives surveillance audits without the annual panic — the system documents itself.

## Decision three: scope discipline

The single biggest schedule killer in certification is scope creep dressed as thoroughness. Meridian certified its core banking environment and the SOC that protects it — not the staff canteen WiFi. A tight, defensible scope statement cut the control population by a third without weakening the security story the certificate tells regulators and correspondent banks.

## What it cost, honestly

Eleven months, a programme team of four (two ours, two theirs), and tooling the bank largely already owned. The expensive part was attention: a fortnightly management review that started on time and ended with decisions. If your organisation cannot sustain that meeting, no consultant can certify you — and one that promises otherwise is selling you a plaque, not a posture.

Run our eight-question readiness checker for a blunt first answer. It maps to the same domains an auditor samples first, and it will tell you which of these three decisions your organisation has actually made.`,
  },
  {
    slug: "charging-an-ev-in-lagos",
    title: "Charging an EV in Nigeria: A Practical Field Guide",
    division: "Autos",
    author: "Emeka Nwosu",
    readMins: 8,
    excerpt: "Range anxiety is mostly a planning failure. After 60 fleet EVs and two years of telematics, here is how charging actually works in Abuja, Lagos and Port Harcourt.",
    body: `Every prospective EV buyer asks the same first question — where will I charge? — and almost every answer they have heard is either evangelism or fear. Two years of running electric fleets in three Nigerian cities has given us something better than opinions: telematics. Here is what the data says.

## Home is the filling station

Across our fleet and private customers, 88% of charging happens at home or depot, overnight, on AC power. A 7.4kW wallbox restores about 45km of range per hour; parked from 9pm to 6am, that is a full daily commute several times over. The practical requirement is not a national charging network — it is a dedicated circuit, a competent installer, and load management so the wallbox defers to your inverter during outages. That last detail matters: our installations meter the house and throttle the car automatically when the battery bank is carrying the building.

## The grid is unreliable; charging is not

The obvious objection — NEPA — is real but overstated. An EV is not a freezer: it does not need continuous power, only enough energy across the night. Band A areas average sufficient supply hours for full overnight charging on all but the worst weeks. For everyone else, the arithmetic of solar pairing is compelling: 6kWp of panels generates roughly 150km of driving per day of sunshine. Several of our customers now drive on sunlight in the most literal sense, and their cost per kilometre embarrasses petrol by a factor of eight.

## Public charging: thinner than Lagos, better than rumour

Public DC charging in Nigeria remains sparse — our own network plus a handful of hotel and mall installations. But the fleet data shows public charging is a convenience layer, not a dependency: it accounted for under 7% of energy delivered last year, concentrated on interstate trips. For Abuja–Kaduna or Lagos–Ibadan runs, one mid-route DC stop of 20–30 minutes covers the corridor comfortably in a 400km-class car.

## What we tell buyers

Buy the range you need for your worst regular week, not your annual village trip — rent or take the hybrid for that. Install the wallbox before the car arrives. Pair with solar if you have the roof. And ignore anyone who talks about charging without showing you numbers: the infrastructure question has answers now, and they are measured in kilowatt-hours, not vibes.

Every vehicle listing on this site shows real-world range, not brochure range. Book a test drive and bring your commute with you.`,
  },
  {
    slug: "shortlet-economics-abuja",
    title: "Shortlet Economics in Abuja: The Occupancy Math Nobody Shows You",
    division: "Real Estate",
    author: "Halima Yusuf",
    readMins: 7,
    excerpt: "Instagram makes every shortlet look profitable. The spreadsheet disagrees more often than you'd think. Here is the honest arithmetic from a 96%-occupancy operator.",
    body: `Abuja's shortlet market runs on a seductive pitch: buy or lease an apartment, furnish it beautifully, and harvest nightly rates that annualise to three times the long-let rent. The pitch is not exactly false. It is incomplete in ways that quietly bankrupt first-time operators.

## Gross yield is a vanity metric

A two-bed in Wuse 2 at ₦145,000 a night sounds like ₦52M a year. It is not. Realistic stabilised occupancy for a well-run Abuja unit is 55–70%; ours run higher only because corporate contracts smooth the midweek troughs. At 62% occupancy, revenue is ₦32.8M — before the costs long-let landlords never meet: nightly-turnover housekeeping, linen depreciation, OTA commissions of 12–15%, payment fees, WiFi worth advertising, and the diesel-or-solar bill for the 24/7 power your reviews depend on. Well-run, all-in operating costs consume 38–45% of revenue. The honest net on that Wuse two-bed is ₦18–20M — still roughly double the long-let net, but earned, not harvested.

## Power is the product

Read one hundred Abuja shortlet reviews and count the complaints: power dominates. Guests forgive a dated sofa; they do not forgive a dead AC at 2am. This is why every unit in our portfolio sits on hybrid solar — it converts the city's biggest operational risk into a marketing line, and it is the single largest driver of our repeat-guest rate. If your business plan says "generator when needed", your review score has already been written.

## The occupancy flywheel

High occupancy is not luck; it is response time. Enquiries answered inside five minutes convert at triple the rate of hour-old replies. Same-day booking confirmation, keyless entry, and a maintenance dispatch that fixes before checkout — these operational habits compound into ranking, reviews and direct repeat bookings that escape OTA commission entirely. Half our nights now book direct.

## Should you enter?

If you can fund proper power, staff proper turnover, and answer your phone like a business, Abuja shortlets remain genuinely attractive — corporate demand is deep and undersupplied at the quality end. If you cannot, the long let will pay you almost as much and cost you your evenings back.

Or skip the operations entirely: our booking engine fills units we manage for owners under revenue share. The spreadsheet is available on request — including the ugly rows.`,
  },
  {
    slug: "inverter-sizing-returns",
    title: "Inverter Sizing: Why 80% of Returns Are Avoidable",
    division: "Commerce",
    author: "Kemi Alade",
    readMins: 6,
    excerpt: "The most-returned product category in our store is inverters — and almost every return traces to the same three sizing mistakes made before checkout.",
    body: `Our returns desk keeps honest statistics, and they point at an uncomfortable truth: customers rarely return inverters because the hardware failed. They return them because the hardware was never going to work for their load. The good news is that the three mistakes behind most returns are all avoidable at the point of purchase.

## Mistake one: sizing to the bill, not the surge

A 3.5kVA inverter comfortably carries a home whose appliances draw 2.5kW — until the borehole pump starts. Induction motors draw three to six times their rated power for the second they spin up, and an undersized inverter interprets that surge as a fault. The fix is a surge audit, not a bigger guess: list every motor load (pumps, compressors, AC units), multiply the largest by its start factor, and size to survive the worst simultaneous start. Our product pages publish surge ratings precisely so this arithmetic is possible before you pay.

## Mistake two: ignoring battery voltage mathematics

An inverter is only half a system. A 5kW load on a 24V battery bank pulls over 200 amps — cooking cables, tripping breakers and murdering batteries that were priced, not engineered. Above roughly 3kW of sustained load, 48V architecture stops being a preference and becomes physics. This single incompatibility — right inverter, wrong-voltage battery bank — accounts for a quarter of our category returns on its own.

## Mistake three: the generator handshake

Hybrid inverters charge from generators, but generators are dirty power sources: voltage sag, frequency wander. Budget sets below a certain quality simply fail the inverter's input tolerance, and the customer concludes the inverter is faulty. If your backup plan includes a generator, check the charging input specifications against your set — or ask us to. It is a two-minute question that prevents a two-week disappointment.

## What we changed

Every inverter listing in our store now carries a sizing panel: sustained rating, surge rating, required battery voltage and generator input tolerance. Our B2B desk runs free load audits for orders above ten units. Since introducing both, category returns have fallen by more than half — proof that most returns were never product failures. They were information failures, and information is cheaper to ship.

Buy the audit before the inverter. Both are in the store.`,
  },
];

// ─── 100-strong EV fleet: top makers across the US, China and the rest of the world ───
// Tuple: [make, model, year, powertrain, bodyStyle, priceNGN(millions), rangeKm, batteryKwh, 0-100s, maxDC kW, seats]
type EVRow = [string, string, number, string, string, number, number, number, number, number, number];
const EV_MODELS: EVRow[] = [
  // Tesla · USA
  ["Tesla", "Model Y", 2026, "BEV", "SUV", 68, 533, 75, 5.0, 250, 5],
  ["Tesla", "Model S", 2026, "BEV", "Sedan", 125, 634, 100, 3.2, 250, 5],
  ["Tesla", "Model X", 2026, "BEV", "SUV", 140, 576, 100, 3.9, 250, 7],
  ["Tesla", "Model 3 Performance", 2026, "BEV", "Sedan", 82, 528, 79, 3.1, 250, 5],
  ["Tesla", "Cybertruck", 2026, "BEV", "Truck", 150, 547, 123, 3.9, 250, 5],
  // BYD · China
  ["BYD", "Han EV", 2026, "BEV", "Sedan", 72, 605, 85.4, 3.9, 150, 5],
  ["BYD", "Tang EV", 2026, "BEV", "SUV", 85, 530, 108.8, 4.6, 170, 7],
  ["BYD", "Song Plus EV", 2026, "BEV", "SUV", 48, 505, 87, 8.5, 115, 5],
  ["BYD", "Seagull", 2026, "BEV", "Hatchback", 22, 305, 38.9, 9.0, 40, 5],
  ["BYD", "Qin Plus EV", 2026, "BEV", "Sedan", 34, 510, 57.6, 7.3, 80, 5],
  ["BYD", "Sealion 7", 2026, "BEV", "SUV", 62, 610, 82.5, 4.5, 230, 5],
  ["BYD", "Denza D9", 2026, "BEV", "Van", 88, 600, 103, 6.9, 166, 7],
  // Rivian · USA
  ["Rivian", "R1T", 2026, "BEV", "Truck", 140, 505, 135, 3.0, 220, 5],
  ["Rivian", "R1S", 2026, "BEV", "SUV", 150, 483, 135, 3.0, 220, 7],
  // Lucid · USA
  ["Lucid", "Air Pure", 2026, "BEV", "Sedan", 110, 660, 88, 4.5, 250, 5],
  ["Lucid", "Air Touring", 2026, "BEV", "Sedan", 130, 725, 92, 3.4, 250, 5],
  ["Lucid", "Air Grand Touring", 2026, "BEV", "Sedan", 170, 830, 112, 3.0, 300, 5],
  ["Lucid", "Gravity", 2026, "BEV", "SUV", 160, 708, 120, 3.4, 250, 7],
  // Ford · USA
  ["Ford", "Mustang Mach-E", 2026, "BEV", "SUV", 72, 490, 91, 5.1, 150, 5],
  ["Ford", "F-150 Lightning", 2026, "BEV", "Truck", 110, 515, 131, 4.0, 155, 5],
  ["Ford", "Explorer EV", 2026, "BEV", "SUV", 68, 602, 77, 5.3, 185, 5],
  // Chevrolet / GMC / Cadillac · USA
  ["Chevrolet", "Blazer EV", 2026, "BEV", "SUV", 62, 515, 85, 6.0, 190, 5],
  ["Chevrolet", "Equinox EV", 2026, "BEV", "SUV", 48, 513, 85, 5.9, 150, 5],
  ["Chevrolet", "Silverado EV", 2026, "BEV", "Truck", 130, 708, 205, 4.5, 350, 5],
  ["GMC", "Hummer EV", 2026, "BEV", "Truck", 175, 529, 212, 3.0, 350, 5],
  ["Cadillac", "Lyriq", 2026, "BEV", "SUV", 95, 502, 102, 4.9, 190, 5],
  ["Cadillac", "Escalade IQ", 2026, "BEV", "SUV", 185, 740, 205, 4.9, 350, 7],
  // Hyundai · Korea
  ["Hyundai", "Ioniq 5", 2026, "BEV", "SUV", 58, 507, 77.4, 5.1, 233, 5],
  ["Hyundai", "Ioniq 6", 2026, "BEV", "Sedan", 60, 614, 77.4, 5.1, 233, 5],
  ["Hyundai", "Ioniq 5 N", 2026, "BEV", "SUV", 92, 448, 84, 3.4, 240, 5],
  // Kia · Korea
  ["Kia", "EV9", 2026, "BEV", "SUV", 95, 541, 99.8, 5.3, 210, 7],
  ["Kia", "Niro EV", 2026, "BEV", "SUV", 45, 460, 64.8, 7.8, 80, 5],
  ["Kia", "EV3", 2026, "BEV", "SUV", 40, 605, 81.4, 7.5, 128, 5],
  // Genesis · Korea
  ["Genesis", "GV60", 2026, "BEV", "SUV", 85, 466, 77.4, 4.0, 233, 5],
  ["Genesis", "Electrified GV70", 2026, "BEV", "SUV", 95, 455, 77.4, 4.2, 233, 5],
  // Volkswagen · Germany
  ["Volkswagen", "ID.3", 2026, "BEV", "Hatchback", 42, 425, 58, 7.3, 120, 5],
  ["Volkswagen", "ID.4", 2026, "BEV", "SUV", 55, 550, 77, 6.2, 135, 5],
  ["Volkswagen", "ID.7", 2026, "BEV", "Sedan", 70, 621, 86, 6.5, 200, 5],
  ["Volkswagen", "ID.Buzz", 2026, "BEV", "Van", 78, 461, 82, 7.9, 170, 7],
  // Mercedes-Benz · Germany
  ["Mercedes-Benz", "EQS 450+", 2026, "BEV", "Sedan", 140, 782, 108, 6.2, 200, 5],
  ["Mercedes-Benz", "EQE SUV", 2026, "BEV", "SUV", 120, 550, 90.6, 4.9, 170, 5],
  ["Mercedes-Benz", "EQB", 2026, "BEV", "SUV", 78, 423, 66.5, 8.0, 100, 7],
  ["Mercedes-Benz", "EQS SUV", 2026, "BEV", "SUV", 155, 660, 108, 6.7, 200, 7],
  // BMW · Germany
  ["BMW", "i4", 2026, "BEV", "Sedan", 78, 590, 83.9, 5.7, 205, 5],
  ["BMW", "iX", 2026, "BEV", "SUV", 120, 630, 111.5, 4.6, 195, 5],
  ["BMW", "i5", 2026, "BEV", "Sedan", 95, 582, 83.9, 6.0, 205, 5],
  ["BMW", "i7", 2026, "BEV", "Sedan", 160, 625, 101.7, 4.7, 195, 5],
  ["BMW", "iX1", 2026, "BEV", "SUV", 68, 440, 66.5, 5.6, 130, 5],
  // Audi · Germany
  ["Audi", "Q4 e-tron", 2026, "BEV", "SUV", 72, 520, 82, 6.2, 175, 5],
  ["Audi", "Q8 e-tron", 2026, "BEV", "SUV", 110, 582, 114, 5.6, 170, 5],
  ["Audi", "e-tron GT", 2026, "BEV", "Sedan", 135, 501, 93.4, 4.1, 270, 5],
  ["Audi", "Q6 e-tron", 2026, "BEV", "SUV", 95, 625, 100, 5.9, 270, 5],
  // Porsche · Germany
  ["Porsche", "Taycan", 2026, "BEV", "Sedan", 180, 678, 105, 4.8, 320, 5],
  ["Porsche", "Macan EV", 2026, "BEV", "SUV", 150, 613, 100, 5.2, 270, 5],
  // Volvo / Polestar · Sweden
  ["Volvo", "EX30", 2026, "BEV", "SUV", 48, 480, 69, 5.3, 153, 5],
  ["Volvo", "EX90", 2026, "BEV", "SUV", 130, 600, 111, 4.9, 250, 7],
  ["Volvo", "XC40 Recharge", 2026, "BEV", "SUV", 65, 500, 82, 4.9, 200, 5],
  ["Polestar", "Polestar 2", 2026, "BEV", "Sedan", 72, 655, 82, 4.5, 205, 5],
  ["Polestar", "Polestar 3", 2026, "BEV", "SUV", 120, 610, 111, 4.7, 250, 5],
  ["Polestar", "Polestar 4", 2026, "BEV", "SUV", 110, 620, 100, 3.8, 200, 5],
  // NIO · China
  ["NIO", "ET5", 2026, "BEV", "Sedan", 68, 560, 75, 4.0, 140, 5],
  ["NIO", "ET7", 2026, "BEV", "Sedan", 95, 580, 100, 3.8, 140, 5],
  ["NIO", "ES6", 2026, "BEV", "SUV", 75, 490, 75, 4.6, 140, 5],
  ["NIO", "ES8", 2026, "BEV", "SUV", 110, 465, 100, 4.1, 140, 7],
  ["NIO", "ET9", 2026, "BEV", "Sedan", 150, 650, 120, 4.3, 600, 5],
  // XPeng · China
  ["XPeng", "P7", 2026, "BEV", "Sedan", 62, 576, 86.2, 4.3, 175, 5],
  ["XPeng", "G6", 2026, "BEV", "SUV", 55, 570, 87.5, 3.9, 280, 5],
  ["XPeng", "G9", 2026, "BEV", "SUV", 78, 570, 98, 3.9, 300, 5],
  ["XPeng", "X9", 2026, "BEV", "Van", 85, 640, 101.5, 5.7, 260, 7],
  // Li Auto · China (extended-range PHEV)
  ["Li Auto", "L7", 2026, "PHEV", "SUV", 72, 1100, 42.8, 5.3, 90, 5],
  ["Li Auto", "L9", 2026, "PHEV", "SUV", 95, 1100, 44.5, 5.3, 90, 6],
  ["Li Auto", "MEGA", 2026, "BEV", "Van", 110, 710, 102, 5.5, 520, 7],
  // Zeekr · China
  ["Zeekr", "001", 2026, "BEV", "Wagon", 72, 656, 100, 3.8, 360, 5],
  ["Zeekr", "007", 2026, "BEV", "Sedan", 60, 688, 75, 5.6, 360, 5],
  ["Zeekr", "X", 2026, "BEV", "SUV", 55, 476, 66, 3.7, 150, 5],
  ["Zeekr", "009", 2026, "BEV", "Van", 110, 702, 116, 4.5, 360, 7],
  // MG · China / UK
  ["MG", "ZS EV", 2026, "BEV", "SUV", 34, 440, 51.1, 8.4, 92, 5],
  ["MG", "Cyberster", 2026, "BEV", "Roadster", 90, 519, 77, 3.2, 144, 2],
  ["MG", "MG5 EV", 2026, "BEV", "Wagon", 33, 400, 61.1, 7.7, 87, 5],
  // GWM Ora · China
  ["Ora", "03", 2026, "BEV", "Hatchback", 30, 420, 63, 8.4, 67, 5],
  ["Ora", "07", 2026, "BEV", "Sedan", 48, 640, 83, 4.3, 88, 5],
  // Nissan / Toyota / Honda / Subaru · Japan
  ["Nissan", "Leaf", 2026, "BEV", "Hatchback", 34, 385, 62, 7.9, 100, 5],
  ["Toyota", "bZ4X", 2026, "BEV", "SUV", 55, 516, 71.4, 6.9, 150, 5],
  ["Toyota", "RAV4 Prime", 2026, "PHEV", "SUV", 58, 970, 18.1, 6.0, 0, 5],
  ["Honda", "Prologue", 2026, "BEV", "SUV", 60, 476, 85, 5.5, 150, 5],
  ["Subaru", "Solterra", 2026, "BEV", "SUV", 55, 460, 71.4, 6.9, 150, 5],
  // Others
  ["Fisker", "Ocean", 2026, "BEV", "SUV", 75, 707, 106, 3.9, 250, 5],
  ["Lotus", "Eletre", 2026, "BEV", "SUV", 200, 600, 112, 2.9, 350, 5],
  ["Smart", "#1", 2026, "BEV", "SUV", 40, 440, 66, 6.7, 150, 5],
  ["Jeep", "Wrangler 4xe", 2026, "PHEV", "SUV", 68, 600, 17.3, 6.0, 0, 5],
  ["Peugeot", "e-3008", 2026, "BEV", "SUV", 58, 525, 73, 8.8, 160, 5],
  ["Renault", "Megane E-Tech", 2026, "BEV", "SUV", 50, 470, 60, 7.4, 130, 5],
];

const EV_COLORS: { name: string; hex: string }[] = [
  { name: "Pearl White", hex: "#E8EAED" }, { name: "Solid Black", hex: "#1A1D22" },
  { name: "Titanium Grey", hex: "#8B939E" }, { name: "Deep Blue", hex: "#2B4C7E" },
  { name: "Fusion Red", hex: "#B33A2E" },
];

function evChargeTime(pt: string, chargeKw: number): string {
  if (pt === "HEV") return "Self-charging hybrid — no plug";
  if (pt === "PHEV") return "Home AC + engine range-extender";
  if (chargeKw >= 250) return "10–80% in ~18 min (ultra-rapid DC)";
  if (chargeKw >= 150) return "10–80% in ~28 min (DC)";
  if (chargeKw >= 90) return "30–80% in ~30 min (DC)";
  return "AC/DC — overnight or ~45 min top-up";
}

function evSummary(m: EVRow): string {
  const [make, model, , pt, body, , range, batt] = m;
  const kind = pt === "BEV" ? "battery-electric" : pt === "PHEV" ? "plug-in hybrid" : "hybrid";
  return `${make} ${model}: a ${kind} ${body.toLowerCase()} with ${range}km of real-world range from a ${batt}kWh pack. Imported, homologated and warranty-backed for Nigerian roads.`;
}

const EXTRA_VEHICLES = EV_MODELS.map((m) => {
  const [make, model, year, pt, body, priceM, range, batt, accel, charge, seats] = m;
  const slug = `${make} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    slug, make, model, year, powertrain: pt, bodyStyle: body,
    priceNGN: Math.round(priceM * 1_000_000), rangeKm: range, batteryKwh: batt, accel,
    chargeKw: charge, chargeTime: evChargeTime(pt, charge), seats,
    colors: EV_COLORS, summary: evSummary(m), featured: false,
  };
});

// ─── 100-strong property portfolio across Nigeria's major cities ───
const NG_AREAS: { city: string; area: string; tier: number }[] = [
  { city: "Lagos", area: "Banana Island", tier: 4 }, { city: "Lagos", area: "Ikoyi", tier: 4 },
  { city: "Lagos", area: "Victoria Island", tier: 3 }, { city: "Lagos", area: "Oniru", tier: 3 },
  { city: "Lagos", area: "Lekki Phase 1", tier: 3 }, { city: "Lagos", area: "Ikeja GRA", tier: 2 },
  { city: "Lagos", area: "Magodo GRA", tier: 2 }, { city: "Lagos", area: "Ajah", tier: 1 },
  { city: "Abuja", area: "Maitama", tier: 4 }, { city: "Abuja", area: "Asokoro", tier: 3 },
  { city: "Abuja", area: "Guzape", tier: 3 }, { city: "Abuja", area: "Wuse 2", tier: 2 },
  { city: "Abuja", area: "Jabi", tier: 2 }, { city: "Abuja", area: "Katampe Extension", tier: 2 },
  { city: "Abuja", area: "Gwarinpa", tier: 1 }, { city: "Abuja", area: "Life Camp", tier: 1 },
  { city: "Port Harcourt", area: "GRA Phase 2", tier: 2 }, { city: "Port Harcourt", area: "Woji", tier: 1 },
  { city: "Port Harcourt", area: "Trans Amadi", tier: 1 }, { city: "Ibadan", area: "Bodija", tier: 1 },
  { city: "Enugu", area: "Independence Layout", tier: 2 }, { city: "Uyo", area: "Ewet Housing", tier: 1 },
];

const RES_AMEN = ["24/7 power (solar hybrid)", "Fibre + Starlink ready", "Fitted kitchen", "Ensuite bedrooms", "Boys' quarters", "Secure estate + CCTV", "Borehole + treatment", "Ample parking"];
const SHORT_AMEN = ["24/7 power", "Fast WiFi", "Smart lock entry", "Netflix + DSTV", "Housekeeping option", "Secure parking", "Pool access"];
const COMM_AMEN = ["Central A/C", "Backup power", "Fibre internet", "Lift access", "Ample parking", "24/7 security", "Fire safety system"];
const WARE_AMEN = ["High-bay clearance", "Loading bays", "3-phase power", "Truck-accessible yard", "Gantry/forklift ready", "24/7 security", "Office annex"];

function pick<T>(arr: T[], n: number, seed: number): T[] {
  return arr.filter((_, i) => (i + seed) % arr.length < n).slice(0, n);
}

const EXTRA_PROPERTIES = NG_AREAS.flatMap((a, ai) => {
  const t = a.tier;
  const beds = 2 + (t % 4); // 2..5
  const baths = beds;
  return [
    {
      slug: `${a.area}-${beds}bed-home`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `${beds}-Bedroom Home — ${a.area}`, type: "residential", location: a.area, city: a.city,
      priceNGN: Math.round((6 + t * 6) * 1_000_000), nightlyNGN: 0, serviceNGN: Math.round(t * 400_000),
      depositNGN: 0, cautionNGN: 0, beds, baths, sqm: 140 + t * 60,
      amenities: pick(RES_AMEN, 6, ai), featured: t >= 3 && ai % 4 === 0,
      summary: `A ${beds}-bedroom home in ${a.area}, ${a.city} — ${140 + t * 60}m² of finished living space with reliable power and secure estate access. Priced as annual rent.`,
    },
    {
      slug: `${a.area}-shortlet`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `Serviced Shortlet — ${a.area}`, type: "shortlet", location: a.area, city: a.city,
      priceNGN: 0, nightlyNGN: Math.round((60 + t * 45) * 1_000), serviceNGN: 0, depositNGN: 0,
      cautionNGN: Math.round((40 + t * 30) * 1_000), beds: 1 + (t % 3), baths: 1 + (t % 3), sqm: 55 + t * 25,
      amenities: pick(SHORT_AMEN, 5, ai + 1), featured: t >= 3 && ai % 5 === 0,
      summary: `A serviced ${1 + (t % 3)}-bed shortlet in ${a.area}, ${a.city} with uninterrupted power and fast WiFi — booked nightly, ready for business or leisure stays.`,
    },
    {
      slug: `${a.area}-office-suite`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `Commercial Office Suite — ${a.area}`, type: "commercial", location: a.area, city: a.city,
      priceNGN: Math.round((8 + t * 10) * 1_000_000), nightlyNGN: 0, serviceNGN: Math.round(t * 800_000),
      depositNGN: 0, cautionNGN: 0, beds: 0, baths: 2, sqm: 180 + t * 120,
      amenities: pick(COMM_AMEN, 6, ai + 2), featured: false,
      summary: `${180 + t * 120}m² of fitted, air-conditioned office space in ${a.area}, ${a.city} with backup power and lift access. Annual lease.`,
    },
    {
      slug: `${a.area}-warehouse`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `Warehouse / Industrial Space — ${a.area}`, type: "warehousing", location: a.area, city: a.city,
      priceNGN: Math.round((10 + t * 8) * 1_000_000), nightlyNGN: 0, serviceNGN: 0, depositNGN: 0,
      cautionNGN: 0, beds: 0, baths: 2, sqm: 800 + t * 700,
      amenities: pick(WARE_AMEN, 6, ai + 3), featured: false,
      summary: `${800 + t * 700}m² warehouse in ${a.area}, ${a.city} with high-bay clearance, loading bays and 3-phase power on a truck-accessible yard. Annual lease.`,
    },
  ];
});

async function main(): Promise<void> {
  console.log("Seeding Greyfusion platform…");

  // Wipe in dependency order
  await prisma.siteConfiguration.deleteMany();
  await prisma.leadershipPersonnel.deleteMany();
  await prisma.corporateCredential.deleteMany();
  await prisma.dynamicPageContent.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.showcaseAsset.deleteMany();
  await prisma.entityMedia.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.socialMediaLink.deleteMany();
  await prisma.siteBranding.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.dailyAnalyticsSummary.deleteMany();
  await prisma.propertyBooking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.product.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.job.deleteMany();
  await prisma.post.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lead.deleteMany();

  const seedVehicles = [...vehicles, ...EXTRA_VEHICLES];
  for (const v of seedVehicles) {
    await prisma.vehicle.create({ data: { ...v, colors: JSON.stringify(v.colors) } });
  }
  console.log(`  ${seedVehicles.length} vehicles`);

  const seedProperties = [...properties, ...EXTRA_PROPERTIES];
  const propMap = new Map<string, string>();
  for (const p of seedProperties) {
    const created = await prisma.property.create({ data: { ...p, amenities: JSON.stringify(p.amenities) } });
    propMap.set(p.slug, created.id);
  }
  console.log(`  ${seedProperties.length} properties`);

  for (const p of products) {
    await prisma.product.create({ data: { ...p, variants: JSON.stringify(p.variants), specs: JSON.stringify(p.specs) } });
  }
  console.log(`  ${products.length} products`);

  // ─── External catalogue snapshot (Solar Village + Intavalto Retail) ───
  // Real products captured from the source sites so the storefront is populated on seed.
  // The 12-hour catalog sync (src/lib/cron/catalogSync.ts) refreshes these by slug and
  // pulls the full catalogues. Slugs are namespaced by source so nothing collides.
  interface ExternalProduct { slug: string; name: string; category: string; priceNGN: number; stock: number; summary: string; image: string }
  const externalProducts: ExternalProduct[] = [
    // Solar Village (solarvillage.africa) — inverters, batteries, panels, solar systems
    { slug: "solarvillage-gospower-gpeo-6kl1", name: "Gospower GPEO-6KL1 6kVA Inverter (Wi-Fi Dongle)", category: "inverters", priceNGN: 599000, stock: 12, summary: "6kVA Gospower off-grid inverter with internet Wi-Fi monitoring dongle. 3-year replacement plus 5-year warranty.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/6/k/6k002.jpg" },
    { slug: "solarvillage-felicity-ivem-3kva", name: "Felicity IVEM 3KVA 24V Off-Grid Solar Inverter IVEM3024", category: "inverters", priceNGN: 379000, stock: 18, summary: "Felicity 3KVA 24V single-phase off-grid pure sine wave solar inverter for homes and small offices.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/i/v/ivem3024-3.png" },
    { slug: "solarvillage-felicity-lpbf-15kwh", name: "Felicity LPBF 15kWh 48V 300Ah Lithium-Ion Battery", category: "inverters", priceNGN: 2297500, stock: 6, summary: "Felicity 15kWh 48V 300Ah LiFePO4 energy-storage battery with long cycle life for whole-home backup.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/i/m/img15.jpg" },
    { slug: "solarvillage-felicity-fla-15kwh", name: "Felicity FLA 15kWh 48V 300Ah Lithium-Ion Battery", category: "inverters", priceNGN: 2320000, stock: 5, summary: "Felicity FLA 15kWh 48V 300Ah lithium-ion battery pack engineered for deep-cycle solar storage.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/f/l/fla48300.5.png" },
    { slug: "solarvillage-cworth-1-8kwa-hybrid", name: "Cworth Energy 1.8kWa 12V Hybrid Inverter H1.8KL-1812", category: "inverters", priceNGN: 305000, stock: 22, summary: "Compact 1.8kWa 12V hybrid inverter with built-in MPPT charge controller for starter solar setups.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/6/k/6kwatt24_2.jpg" },
    { slug: "solarvillage-cworth-10kwh-lbc", name: "Cworth Energy 10kWh 48V LBC-48200C Lithium Battery", category: "inverters", priceNGN: 1608000, stock: 8, summary: "Cworth 10kWh 48V 200Ah LiFePO4 battery with smart BMS for reliable daily-cycle solar storage.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/l/b/lbc-48200c.jpg" },
    { slug: "solarvillage-cworth-5kwh-lbd", name: "Cworth Energy 5kWh 24V LiFePO4 Battery Pack LBD-24200C", category: "inverters", priceNGN: 940000, stock: 14, summary: "Cworth 5kWh 24V 200Ah LiFePO4 battery pack — a right-sized backup bank for apartments and shops.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/l/p/lpd3.jpg" },
    { slug: "solarvillage-bluecarbon-12-8kwh", name: "Blue Carbon 12.8kWh 48V 250Ah LiFePO4 Battery (Flat)", category: "inverters", priceNGN: 1650000, stock: 7, summary: "Blue Carbon 12.8kWh 48V 250Ah flat lithium-ion LiFePO4 battery for high-capacity residential storage.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/2/_/2_3_1.jpg" },
    { slug: "solarvillage-sako-liwall-5kwh", name: "SAKO Li-Wall 5kWh 24V 200Ah Lithium Battery (Smart BMS)", category: "inverters", priceNGN: 935000, stock: 16, summary: "SAKO Li-Wall wall-mounted 5kWh 24V 200Ah lithium battery with integrated smart BMS.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/4/8/48200cc1jj11.jpg" },
    { slug: "solarvillage-glow-220ah-tubular", name: "Glow Energy 220Ah Tubular Battery", category: "inverters", priceNGN: 300000, stock: 26, summary: "Glow Energy 220Ah deep-cycle tubular battery — dependable, affordable storage for inverter systems.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/g/l/glow-165.jpg" },
    { slug: "solarvillage-dyque-cube-15kw", name: "DYQUE CUBE 3-Phase Solar Power System 15kW/24kWh", category: "solar", priceNGN: 16929350, stock: 2, summary: "DYQUE CUBE all-in-one 3-phase solar energy system: 15kW inverter with 24kWh integrated storage.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/0/0/002.jpg" },
    { slug: "solarvillage-jinko-615w-panel", name: "Jinko 615W Half-Cell Bifacial Solar Panel", category: "solar", priceNGN: 149800, stock: 40, summary: "Jinko 615W monocrystalline half-cell bifacial solar panel — high yield for rooftop and ground arrays.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/c/1/c14ecbe593bf913eab286cc39f9f72bc_1__1.jpg" },
    { slug: "solarvillage-cworth-streetlight-100w", name: "Cworth Energy Solar Street Light C1-100W", category: "solar", priceNGN: 325000, stock: 30, summary: "All-in-one 100W solar street light with integrated panel, battery and motion sensing for estates and roads.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/c/1/c1_100w5.jpg" },
    { slug: "solarvillage-wakatek-300w-floodlight", name: "Wakatek WK-JS-300W Solar Floodlight", category: "solar", priceNGN: 79500, stock: 35, summary: "Wakatek 300W solar floodlight with remote control — bright, self-powered security lighting.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/f/l/flood_light_wakatek_300w_2.jpg" },
    { slug: "solarvillage-huawei-isite-6kva", name: "Huawei iSite Power-M 6kVA 15kWh All-in-One System", category: "solar", priceNGN: 6955000, stock: 3, summary: "Huawei iSite Power-M all-in-one 6kVA hybrid inverter with 15kWh lithium storage for premium sites.", image: "https://solarvillage.africa/media/catalog/product/cache/277b691ae0e13f352d9cf0e7760ab964/1/5/15kwh-front-1.jpg" },
    // Intavalto Retail (intavaltoretail.com) — smart-home / IoT
    { slug: "intavalto-aqara-water-leak-sensor-t1", name: "Aqara Water Leak Sensor T1", category: "smart-home", priceNGN: 49613, stock: 20, summary: "Detects water leaks and flooding and sends instant app alerts; works with other Aqara accessories to automate your home.", image: "https://intavaltoretail.com/wp-content/uploads/2026/07/Aqara_water_leak_sensor-1.webp" },
    { slug: "intavalto-aqara-climate-sensor-w100", name: "Aqara Climate Sensor W100", category: "smart-home", priceNGN: 106389, stock: 20, summary: "High-precision temperature and humidity sensor with a 3.4-inch LCD, Zigbee and Thread support, and 3 customisable buttons.", image: "https://intavaltoretail.com/wp-content/uploads/2026/07/AqaraclimatesensorW100_1.webp" },
    { slug: "intavalto-aqara-presence-fp300", name: "Aqara Presence Multi-Sensor FP300", category: "smart-home", priceNGN: 114494, stock: 20, summary: "PIR + 60GHz mmWave radar presence sensor with a 120° field of view and 6m range for precise occupancy detection.", image: "https://intavaltoretail.com/wp-content/uploads/2026/07/presence-sensor-fp300-online-version.png" },
  ];
  for (const ep of externalProducts) {
    const created = await prisma.product.create({
      data: { slug: ep.slug, name: ep.name, category: ep.category, priceNGN: ep.priceNGN, stock: ep.stock, variants: "[]", specs: "[]", summary: ep.summary, featured: false },
    });
    await prisma.entityMedia.create({
      data: { productId: created.id, url: ep.image, altText: ep.name, isMain: true, displayOrder: 0 },
    });
  }
  console.log(`  ${externalProducts.length} external products (Solar Village + Intavalto) with images`);

  for (const p of projects) await prisma.project.create({ data: p });
  console.log(`  ${projects.length} projects`);

  for (const t of tenders) await prisma.tender.create({ data: t });
  console.log(`  ${tenders.length} tenders`);

  for (const [i, j] of jobs.entries()) {
    await prisma.job.create({ data: { ...j, postedAt: d(-3 - i * 4), open: true } });
  }
  console.log(`  ${jobs.length} jobs`);

  // Original 6 curated posts stay as flagship long-reads; the engine adds 200 across 8 verticals.
  for (const [i, p] of posts.entries()) {
    await prisma.post.create({ data: { ...p, coverImage: "", publishedAt: d(-5 - i * 11) } });
  }
  const generated = generateInsights();
  for (const g of generated) {
    await prisma.post.create({
      data: {
        title: g.title, slug: g.slug, division: g.division, excerpt: g.excerpt,
        body: g.body, author: g.author, coverImage: g.coverImage, readMins: g.readMins,
        publishedAt: d(-g.ageDays),
      },
    });
  }
  console.log(`  ${posts.length + generated.length} insights posts (${posts.length} curated + ${generated.length} generated across 8 verticals)`);

  // Bookings: occupied + blocked ranges on shortlets
  const bookings = [
    { slug: "wuse-atrium-2bed", ref: "GF-BKG-20260701-1121", name: "Chinedu Okafor", email: "c.okafor@harmattanfoods.ng", phone: "0803 441 2210", start: 4, nights: 3, status: "CONFIRMED" },
    { slug: "wuse-atrium-2bed", ref: "GF-BKG-20260712-1188", name: "Aisha Mohammed", email: "aisha.m@unitymfb.ng", phone: "0812 774 0031", start: 12, nights: 5, status: "PENDING" },
    { slug: "wuse-atrium-2bed", ref: "GF-BKG-BLOCK-0001", name: "Maintenance block", email: "ops@greyfusion.com.ng", phone: "-", start: 24, nights: 2, status: "BLOCKED" },
    { slug: "vi-skyline-3bed", ref: "GF-BKG-20260708-1147", name: "Tunde Bakare", email: "tunde@giglogistics.ng", phone: "0705 118 9902", start: 6, nights: 4, status: "CONFIRMED" },
    { slug: "gra-ph-shortlet", ref: "GF-BKG-20260715-1201", name: "Blessing Eze", email: "b.eze@deltadeepwater.com", phone: "0908 232 4455", start: 9, nights: 7, status: "CONFIRMED" },
  ];
  for (const b of bookings) {
    const propertyId = propMap.get(b.slug);
    if (!propertyId) continue;
    const property = properties.find((p) => p.slug === b.slug);
    await prisma.propertyBooking.create({
      data: {
        ref: b.ref, propertyId, name: b.name, email: b.email, phone: b.phone,
        startDate: d(b.start), endDate: d(b.start + b.nights),
        totalNGN: (property?.nightlyNGN ?? 0) * b.nights, status: b.status,
      },
    });
  }
  console.log(`  ${bookings.length} bookings`);

  const tickets = [
    { ref: "GF-IT-20260716-0038", name: "Ngozi Adewale", email: "n.adewale@meridiantrust.ng", category: "Security incident", severity: "HIGH", description: "Multiple failed admin logins on the internet-banking bastion host from an unrecognised ASN between 02:10 and 02:26. MFA held; requesting log review and IP block confirmation.", status: "IN_PROGRESS" },
    { ref: "GF-IT-20260717-0041", name: "Samuel Adeyemi", email: "s.adeyemi@unitymfb.ng", category: "Cloud & infrastructure", severity: "MEDIUM", description: "Branch VPN tunnel to the Kano site drops every 4–6 hours since Tuesday's firmware update. Failover works but calls drop during renegotiation.", status: "OPEN" },
    { ref: "GF-IT-20260718-0042", name: "Kelechi Nwankwo", email: "k.nwankwo@sunmart.ng", category: "Access & identity", severity: "LOW", description: "Two new procurement staff need reader access to the supplier portal; manager approval attached in the email thread.", status: "OPEN" },
    { ref: "GF-IT-20260710-0029", name: "Fatima Bello", email: "f.bello@harmattanfoods.ng", category: "Email & collaboration", severity: "MEDIUM", description: "Finance shared mailbox intermittently rejects external mail with 550 5.7.1 since the DMARC policy change. Resolved after SPF include fix — please confirm and close.", status: "RESOLVED" },
  ];
  for (const t of tickets) {
    await prisma.ticket.create({ data: { ...t, createdAt: d(-Math.floor(Math.random() * 6) - 1) } });
  }
  console.log(`  ${tickets.length} tickets`);

  const orders = [
    {
      ref: "GF-ORD-20260714-4780", name: "Ifeanyi Umeh", email: "ifeanyi.umeh@gmail.com", phone: "0803 555 8821",
      address: "Plot 88, 6th Avenue, Gwarinpa", city: "Abuja", method: "transfer", status: "SHIPPED",
      items: [{ slug: "gf-inv-6k", name: "GF-INV-6K 6kW Hybrid Inverter", qty: 1, priceNGN: 2_400_000, variant: "Phase: Single-phase" }, { slug: "gf-bat-5k", name: "GF-BAT-5K 5.12kWh Wall-Mount Battery", qty: 2, priceNGN: 2_450_000, variant: "Colour: Graphite" }],
    },
    {
      ref: "GF-ORD-20260717-4805", name: "Sunmart Procurement", email: "procurement@sunmart.ng", phone: "01 448 2200",
      address: "14 Industrial Crescent, Ilupeju", city: "Lagos", method: "paystack", status: "PROCESSING",
      items: [{ slug: "gf-cam-kit4", name: "SecureSight 4-Camera PoE Kit", qty: 6, priceNGN: 385_000, variant: "Storage: 2TB NVR" }],
    },
    {
      ref: "GF-ORD-20260718-4812", name: "Amara Obi", email: "amara.obi@outlook.com", phone: "0902 118 7734",
      address: "3 Freedom Way, Lekki Phase 1", city: "Lagos", method: "pod", status: "PENDING",
      items: [{ slug: "gf-mesh-wifi", name: "FusionMesh WiFi 6 (3-Pack)", qty: 1, priceNGN: 295_000, variant: "Pack: 3-pack" }, { slug: "gf-smart-lock", name: "GateGuard Smart Lock (Fingerprint + App)", qty: 1, priceNGN: 185_000, variant: "Finish: Matte black" }],
    },
  ];
  for (const o of orders) {
    await prisma.order.create({
      data: {
        ...o, items: JSON.stringify(o.items),
        totalNGN: o.items.reduce((s, i) => s + i.priceNGN * i.qty, 0),
        createdAt: d(-Math.floor(Math.random() * 5) - 1),
      },
    });
  }
  console.log(`  ${orders.length} orders`);

  const leads = [
    { ref: "GF-PRJ-20260715-1042", type: "PROJECT_INTAKE", division: "construction", name: "Arch. Bola Shittu", email: "b.shittu@fctworks.gov.ng", phone: "0803 220 1144", subject: "", payload: { projectType: "Civil infrastructure", budgetBand: "Above ₦1B", timeline: "6–12 months", message: "Pre-qualification enquiry for the Phase 2 arterial road programme. Requesting capability deck and reference contacts." }, status: "CONTACTED" },
    { ref: "GF-VEN-20260716-2031", type: "VENDOR_REG", division: "construction", name: "Musa Garba", email: "info@garbasteel.ng", phone: "0806 700 4521", subject: "", payload: { company: "Garba Steel & Allied Ltd", rcNumber: "RC 884201", category: "Supply — steel & rebar", capacity: 450_000_000, yearsActive: 12 }, status: "NEW" },
    { ref: "GF-MNT-20260717-3310", type: "MAINTENANCE", division: "energy", name: "Grace Okon", email: "grace.okon@stpetersschool.ng", phone: "0812 220 9987", subject: "", payload: { requestType: "Existing system — fault callout", siteAddress: "St. Peters College, Life Camp, Abuja", systemDetails: "20kW hybrid, one string reading zero since Thursday storm. Breakers checked." }, status: "NEW" },
    { ref: "GF-TDR-20260717-5522", type: "TEST_DRIVE", division: "autos", name: "Deji Alabi", email: "deji.alabi@yahoo.com", phone: "0705 441 2200", subject: "", payload: { vehicle: "BYD Seal RWD", slug: "byd-seal", date: "2026-07-25", timeSlot: "11:00 – 13:00", location: "Abuja showroom — Emab Plaza axis" }, status: "NEW" },
    { ref: "GF-B2B-20260714-6104", type: "B2B_QUOTE", division: "commerce", name: "Nkechi Eze", email: "nkechi@brightestates.ng", phone: "0902 887 1123", subject: "", payload: { company: "Bright Estates Development", orderValue: 18_000_000, requirements: "40× GF-P450M panels, 6× GF-INV-6K, 12× GF-BAT-5K for an estate phase. Delivery Karsana, staged over 6 weeks." }, status: "CONTACTED" },
    { ref: "GF-APP-20260713-7718", type: "APPLICATION", division: "corporate", name: "Yusuf Abdullahi", email: "yusuf.abd@gmail.com", phone: "0810 300 5566", subject: "", payload: { role: "SOC Analyst (L2)", jobSlug: "soc-analyst-l2", linkedin: "linkedin.com/in/yusufabd", experience: 4, coverNote: "BTL2 certified. Currently L1 at a telco SOC handling 2,000 alerts/day; hunting experience with Sigma. I want the 1.8-second benchmark." }, status: "NEW" },
    { ref: "GF-ENQ-20260712-8804", type: "CONTACT", division: "real-estate", name: "Mrs. Adaora Nwachukwu", email: "adaora.n@gmail.com", phone: "0803 141 5980", subject: "", payload: { interest: "Renting residential", budget: 10_000_000, message: "Relocating from Enugu in September. Interested in Katampe Terrace — is a 2-year term possible?" }, status: "CONTACTED" },
    { ref: "GF-TRD-20260716-9917", type: "TRADE_IN", division: "autos", name: "Femi Ogunleye", email: "femi.ogun@hotmail.com", phone: "0708 992 3341", subject: "Trade-in: 2021 Toyota Camry", payload: { make: "Toyota", model: "Camry", year: "2021", mileage: "68000", condition: "Good", estimateLow: 15_200_000, estimateHigh: 18_900_000 }, status: "NEW" },
    { ref: "GF-CAP-20260711-0210", type: "CAPABILITY_DECK", division: "construction", name: "Engr. Peter Odili", email: "p.odili@deltadeepwater.com", phone: "0805 226 7719", subject: "", payload: { organisation: "Delta Deepwater Services" }, status: "CLOSED" },
    { ref: "GF-PRJ-20260718-1188", type: "PROJECT_INTAKE", division: "smart-home", name: "Col. Sani Bello (rtd.)", email: "sanibello@gmail.com", phone: "0803 118 7742", subject: "", payload: { facilityType: "Detached home / duplex", city: "Abuja", interest: "Full automation", details: "5-bed Asokoro property, existing Greyfusion solar install. Want lighting scenes, CCTV, gate automation and perimeter beams." }, status: "NEW" },
    { ref: "GF-ENQ-20260710-8719", type: "CONTACT", division: "it", name: "Hauwa Sani", email: "h.sani@kadunahealth.gov.ng", phone: "0803 700 2214", subject: "", payload: { service: "GRC / compliance", headcount: "101–500", message: "State health agency exploring NDPR + ISO 27001 alignment. Requesting scoping call." }, status: "NEW" },
  ];
  for (const [i, l] of leads.entries()) {
    await prisma.lead.create({ data: { ...l, payload: JSON.stringify(l.payload), createdAt: d(-i) } });
  }
  console.log(`  ${leads.length} leads`);

  // ─── Dynamic CMS seed ───
  await prisma.siteConfiguration.createMany({
    data: [
      { key: "fx_rates", value: JSON.stringify({ USD: 1580, EUR: 1720 }) },
      { key: "regional_badges", value: JSON.stringify(["ISO 9001:2015", "ISO 27001:2022", "SON MANCAP", "COREN", "NDPR", "ECOWAS operations"]) },
      { key: "footer_credits", value: JSON.stringify({ line: "Eight industries. One standard of execution." }) },
    ],
  });
  await prisma.dynamicPageContent.createMany({
    data: [
      {
        pageSlug: "home",
        heroTitle: "Eight Industries.",
        heroSubtitle: "Greyfusion Limited engineers, powers, builds, secures, automates, houses, moves, and supplies modern Africa — from federal road corridors to 48MW of deployed solar.",
        heroVideos: JSON.stringify(["https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-scanning-network-41584-large.mp4"]),
        heroImages: JSON.stringify(["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"]),
        bodyJson: JSON.stringify({ titleAccent: "Standard" }),
      },
      {
        pageSlug: "about",
        heroTitle: "A conglomerate run like a single machine.",
        heroSubtitle: "",
        heroVideos: "[]",
        heroImages: "[]",
        bodyJson: "{}",
      },
    ],
  });
  await prisma.pricingPlan.createMany({
    data: [
      { division: "smart-home", title: "Essential", price: 6_850_000, currency: "NGN", billingCycle: "one-time", scope: "2-bed apartment", displayOrder: 1, highlight: false, ctaText: "Start with a walkthrough", features: JSON.stringify(["Smart lock + video doorbell", "4× 4K PoE cameras + NVR", "Smart lighting, 6 zones", "App + voice control", "1-year support"]) },
      { division: "smart-home", title: "Signature", price: 12_500_000, currency: "NGN", billingCycle: "one-time", scope: "4-bed duplex", displayOrder: 2, highlight: true, ctaText: "Start with a walkthrough", features: JSON.stringify(["Everything in Essential", "Full lighting & AC automation", "Perimeter alarm + beams", "Gate automation w/ GSM", "Energy monitoring per circuit", "2-year support"]) },
      { division: "smart-home", title: "Estate & Commercial", price: 0, currency: "NGN", billingCycle: "one-time", scope: "Engineered to spec", displayOrder: 3, highlight: false, ctaText: "Start with a walkthrough", features: JSON.stringify(["Multi-unit access control", "Facility-wide CCTV command view", "BMS & fire integration", "Solar-hybrid pairing", "SLA-backed maintenance"]) },
      { division: "it", title: "Managed Care", price: 950_000, currency: "NGN", billingCycle: "monthly", scope: "Up to 25 seats", displayOrder: 1, highlight: false, ctaText: "Talk to the IT desk", features: JSON.stringify(["Helpdesk 8am–8pm", "Patch & endpoint management", "Backup monitoring", "Quarterly security review"]) },
      { division: "it", title: "Managed Care+ SOC", price: 2_800_000, currency: "NGN", billingCycle: "monthly", scope: "Up to 100 seats", displayOrder: 2, highlight: true, ctaText: "Talk to the IT desk", features: JSON.stringify(["Everything in Managed Care", "24/7 SOC monitoring", "EDR included", "Critical response < 5 min", "Compliance evidence pipeline"]) },
      { division: "energy", title: "O&M Assurance", price: 3_200_000, currency: "NGN", billingCycle: "annual", scope: "Per 100kWp under management", displayOrder: 1, highlight: false, ctaText: "Request O&M proposal", features: JSON.stringify(["Quarterly IV-curve tracing", "Thermal imaging inspection", "Inverter servicing", "4-hour fault response SLA", "Monthly yield reporting"]) },
    ],
  });
  await prisma.showcaseAsset.createMany({
    data: [
      { category: "realestate", entityId: "vi-skyline-3bed", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", kind: "image", altText: "Skyline Residence — twilight exterior", isHeroCover: true, displayOrder: 1 },
      { category: "ecommerce", entityId: "gf-p580m-panel", url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80", kind: "image", altText: "GF-P580M panels in the field", isHeroCover: true, displayOrder: 1 },
    ],
  });
  console.log("  CMS: 3 configs, 2 pages, 6 plans, 2 showcase assets");

  // ─── Division page content (admin-editable heroes) ───
  const divisionHeroes = [
    { pageSlug: "construction", heroTitle: "Infrastructure delivered to standard, on schedule.", heroSubtitle: "214 projects. 96km of carriageway. Zero abandoned sites. Greyfusion Construction is a COREN-registered, ISO 9001:2015-certified contractor with in-house engineering, plant and QS capability — which is why our bids carry programme guarantees, not caveats." },
    { pageSlug: "energy", heroTitle: "Power that answers to engineering.", heroSubtitle: "48MW deployed. 99.2% fleet uptime. Every system we ship is sized from measured load data and real irradiance — then guaranteed in the contract, not the brochure." },
    { pageSlug: "it", heroTitle: "Your end-to-end IT partner on the ground.", heroSubtitle: "From the SOC that certified a bank to the warehouse that fulfils Deel IT's Nigeria operations: security, software, data, AI and the full device lifecycle — one partner, enterprise accountability, West Africa reach." },
    { pageSlug: "smart-home", heroTitle: "Buildings that think. Doors that answer to you.", heroSubtitle: "Automation and security engineered for Nigerian realities: systems that ride through outages on your inverter, cameras that keep recording when the DVR walks away, and one app for everything from the gate to the generator. Residential, estate and commercial." },
    { pageSlug: "real-estate", heroTitle: "Space that works as hard as you do.", heroSubtitle: "A 96%-occupancy portfolio across Abuja, Lagos and Port Harcourt. Every listing shows the full cost — rent, service charge, deposit, caution — in Naira, before you ask." },
    { pageSlug: "autos", heroTitle: "The quiet future of Nigerian roads.", heroSubtitle: "Twelve electrified models in stock, real-world range figures we'll defend, and a charging team that has installed 60-vehicle depot infrastructure. No fuel queues in your future." },
    { pageSlug: "commerce", heroTitle: "Enterprise-grade hardware, retail-grade checkout.", heroSubtitle: "The same panels, inverters and batteries our energy division installs — plus electronics and smart-home kit — stocked in our warehouses, priced in Naira, delivered in 48 hours within Abuja, Lagos and Port Harcourt." },
  ];
  for (const h of divisionHeroes) {
    await prisma.dynamicPageContent.create({ data: { ...h, heroVideos: "[]", heroImages: "[]", bodyJson: "{}" } });
  }
  console.log(`  ${divisionHeroes.length} division hero rows`);

  // ─── Leadership personnel ───
  const leadership = [
    { name: "Engr. Olumide Bankole", role: "Group Managing Director", bio: "Civil engineer (COREN). Led ₦40B+ of federal and state infrastructure delivery before founding Greyfusion in 2011." },
    { name: "Adaeze Okonkwo", role: "Group Executive Director, Operations", bio: "Former plant director, 14 years in industrial operations across West Africa. Owns the group-wide delivery standard." },
    { name: "Ibrahim Suleiman", role: "MD, Construction & Engineering", bio: "Structural engineer; delivered the Karu–Jikwoyi corridor and three state secretariat complexes." },
    { name: "Dr. Funmilayo Ashiru", role: "MD, Renewable Energy", bio: "PhD Power Systems (Ibadan). Architect of the Zenith Agro 2.4MW hybrid plant and 48MW of deployed capacity." },
    { name: "Tobi Adeleke", role: "MD, Information Technology", bio: "CISSP, ex-big-four cyber lead. Built Greyfusion's 24/7 SOC and the Meridian Trust Bank ISO 27001 programme." },
    { name: "Halima Yusuf", role: "MD, Real Estate", bio: "18 years in property development and asset management; runs a 96%-occupancy portfolio across three cities." },
    { name: "Emeka Nwosu", role: "MD, Autos & Mobility", bio: "Led the GIG Logistics 60-vehicle EV transition; former OEM regional sales director." },
    { name: "Kemi Alade", role: "Group CFO", bio: "FCA. Keeps eight business units on one accountable balance sheet and one audit." },
    { name: "Christine Chinasa", role: "B2B Manager, Greyfusion IT", bio: "Runs the Deel IT fulfilment partnership and platform B2B desk — quoting, logistics and enterprise accounts across West Africa." },
  ];
  for (const [i, l] of leadership.entries()) {
    await prisma.leadershipPersonnel.create({ data: { ...l, displayOrder: i + 1, avatarUrl: "", linkedIn: "" } });
  }
  console.log(`  ${leadership.length} leadership records`);

  // ─── Corporate compliance vault (13 credentials) ───
  const yearEnd = new Date(new Date().getFullYear(), 11, 31);
  const soon = new Date(Date.now() + 18 * 86_400_000); // demonstrates "Expiring soon" pill
  const credentials = [
    { title: "Greyfusion Full Bid Pack (2026)", authority: "Greyfusion Limited — compiled dossier", licenseNumber: "GF/BIDPACK/2026", category: "bidpack", validUntil: "", expiryDate: yearEnd, fileSizeInBytes: 88_100_000, displayOrder: 0, verificationUrl: "" },
    { title: "CAC Certificate of Incorporation", authority: "Corporate Affairs Commission", licenseNumber: "RC 1120352", category: "corporate", validUntil: "", displayOrder: 1, verificationUrl: "https://search.cac.gov.ng" },
    { title: "FIRS VAT Registration", authority: "Federal Inland Revenue Service", licenseNumber: "VAT-2013-GF-448210", category: "tax", validUntil: "", displayOrder: 2 },
    { title: "FIRS Tax Clearance Certificate (TCC)", authority: "Federal Inland Revenue Service", licenseNumber: "TCC/2026/ABJ/104482", category: "tax", validUntil: "", expiryDate: yearEnd, displayOrder: 3 },
    { title: "ITF Certificate of Compliance", authority: "Industrial Training Fund", licenseNumber: "ITF/ABJ/2026/08841", category: "tax", validUntil: "31 Dec 2026", displayOrder: 4 },
    { title: "NSITF Compliance Certificate", authority: "Nigeria Social Insurance Trust Fund", licenseNumber: "NSITF/2026/114420", category: "tax", validUntil: "", expiryDate: soon, displayOrder: 5 },
    { title: "PENCOM Compliance Certificate", authority: "National Pension Commission", licenseNumber: "PENCOM/ABJ/CC/2026/22108", category: "tax", validUntil: "", expiryDate: yearEnd, displayOrder: 6 },
    { title: "BPP National Database Registration", authority: "Bureau of Public Procurement", licenseNumber: "BPP/NDCC/2026/41182", category: "procurement", validUntil: "", expiryDate: yearEnd, displayOrder: 7 },
    { title: "SCUML Certificate", authority: "Special Control Unit Against Money Laundering (EFCC)", licenseNumber: "SCUML/CERT/044821", category: "procurement", validUntil: "", displayOrder: 8, verificationUrl: "https://www.scuml.org" },
    { title: "NITDA Compliance Certificate", authority: "National Information Technology Development Agency", licenseNumber: "NITDA/CL/2026/00912", category: "professional", validUntil: "31 Dec 2026", displayOrder: 9 },
    { title: "COREN Certificate of Registration", authority: "Council for the Regulation of Engineering in Nigeria", licenseNumber: "COREN R.12,481", category: "professional", validUntil: "", displayOrder: 10 },
    { title: "NEMSA Electrical Contractor Licence", authority: "Nigeria Electricity Management Services Agency", licenseNumber: "NEMSA/EIL/2026/0482", category: "professional", validUntil: "31 Dec 2026", displayOrder: 11 },
    { title: "CPN Corporate Registration", authority: "Computer Professionals Registration Council of Nigeria", licenseNumber: "CPN/CORP/2024/1108", category: "professional", validUntil: "", displayOrder: 12 },
    { title: "Audited Financial Statements FY2025", authority: "Certified by Akintola-Bello & Co (ICAN)", licenseNumber: "GF/AFS/2025", category: "financial", validUntil: "", displayOrder: 13 },
  ];
  for (const c of credentials) {
    await prisma.corporateCredential.create({ data: { documentUrl: "", verificationUrl: "", expiryDate: null, fileSizeInBytes: 0, ...c } });
  }
  console.log(`  ${credentials.length} corporate credentials`);

  // ─── Demo relational galleries (EntityMedia) ───
  const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
  const bydSeal = await prisma.vehicle.findUnique({ where: { slug: "byd-seal" } });
  if (bydSeal) {
    await prisma.entityMedia.createMany({
      data: [
        { vehicleId: bydSeal.id, url: U("photo-1563720223185-11003d516935"), altText: "BYD Seal charging at dawn", isMain: true, displayOrder: 0 },
        { vehicleId: bydSeal.id, url: U("photo-1617788138017-80ad40651399"), altText: "BYD Seal battery & motor assembly", displayOrder: 1 },
        { vehicleId: bydSeal.id, url: U("photo-1542282088-fe8426682b8f"), altText: "BYD Seal digital cabin", displayOrder: 2 },
        { vehicleId: bydSeal.id, url: U("photo-1552519507-da3b142c6e3d"), altText: "BYD Seal on the road", displayOrder: 3 },
      ],
    });
  }
  const skyline = await prisma.property.findUnique({ where: { slug: "vi-skyline-3bed" } });
  if (skyline) {
    await prisma.entityMedia.createMany({
      data: [
        { propertyId: skyline.id, url: U("photo-1600585154340-be6161a56a0c"), altText: "Skyline Residence exterior at twilight", isMain: true, displayOrder: 0 },
        { propertyId: skyline.id, url: U("photo-1600607687939-ce8a6c25118c"), altText: "Floor-to-ceiling living space", displayOrder: 1 },
        { propertyId: skyline.id, url: U("photo-1600596542815-ffad4c1539a9"), altText: "Master suite", displayOrder: 2 },
        { propertyId: skyline.id, url: U("photo-1617806118233-18e1de247200"), altText: "Lagoon-view balcony", displayOrder: 3 },
      ],
    });
  }
  const panel = await prisma.product.findUnique({ where: { slug: "gf-p580m-panel" } });
  if (panel) {
    await prisma.entityMedia.createMany({
      data: [
        { productId: panel.id, url: U("photo-1509391366360-2e959784a276"), altText: "GF-P580M array in the field", isMain: true, displayOrder: 0 },
        { productId: panel.id, url: U("photo-1508514177221-188b1cf16e9d"), altText: "Panel close-up", displayOrder: 1 },
        { productId: panel.id, url: U("photo-1548337138-e87d889cc369"), altText: "Rooftop installation", displayOrder: 2 },
      ],
    });
  }
  const project = await prisma.project.findFirst({ where: { slug: "karu-jikwoyi-dual-carriageway" } });
  if (project) {
    await prisma.entityMedia.createMany({
      data: [
        { projectId: project.id, url: U("photo-1541888946425-d81bb19240f5"), altText: "Active carriageway construction", isMain: true, displayOrder: 0 },
        { projectId: project.id, url: U("photo-1503387762-592deb58ef4e"), altText: "Corridor blueprint stage", displayOrder: 1 },
        { projectId: project.id, url: U("photo-1486406146926-c627a92ad1ab"), altText: "Completed corridor", displayOrder: 2 },
      ],
    });
  }
  console.log("  4 demo galleries (vehicle, property, product, project)");

  // ─── V8: backfill a main cover + secondary gallery for EVERY entity ───
  // Every vehicle, property, product and project gets 3–4 real Unsplash photos so
  // the multi-image marketplace cards, carousels and lightboxes are fully populated.
  // Entities that already have admin/demo media (above) are skipped.
  const VEHICLE_SETS: Record<string, string[]> = {
    BEV: ["photo-1563720223185-11003d516935", "photo-1617788138017-80ad40651399", "photo-1542282088-fe8426682b8f", "photo-1552519507-da3b142c6e3d"],
    PHEV: ["photo-1552519507-da3b142c6e3d", "photo-1503376780353-7e6692767b70", "photo-1571607388263-1044f9ea01dd", "photo-1549927681-0b673b8243ab"],
    HEV: ["photo-1493238792000-8113da705763", "photo-1552519507-da3b142c6e3d", "photo-1583121274602-3e2820c69888", "photo-1517672651691-24622a91b550"],
  };
  const PROPERTY_SETS: Record<string, string[]> = {
    shortlet: ["photo-1618221195710-dd6b41faaea6", "photo-1600607687939-ce8a6c25118c", "photo-1600596542815-ffad4c1539a9", "photo-1560448204-e02f11c3d0e2"],
    residential: ["photo-1600585154340-be6161a56a0c", "photo-1600596542815-ffad4c1539a9", "photo-1600607687920-4e2a09cf159d", "photo-1617806118233-18e1de247200"],
    commercial: ["photo-1486406146926-c627a92ad1ab", "photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1568992687947-868a62a9f521"],
    warehousing: ["photo-1553413077-190dd305871c", "photo-1586528116311-ad8dd3c8310d", "photo-1565610222536-ef125c59da2e", "photo-1581092160607-ee22621dd758"],
  };
  const PRODUCT_SETS: Record<string, string[]> = {
    solar: ["photo-1509391366360-2e959784a276", "photo-1508514177221-188b1cf16e9d", "photo-1548337138-e87d889cc369", "photo-1466611653911-95081537e5b7"],
    inverters: ["photo-1581092160607-ee22621dd758", "photo-1581091226825-a6a2a5aee158", "photo-1620714223084-8fcacc6dfd8d", "photo-1526406915894-7bcd65f60845"],
    electronics: ["photo-1498049794561-7780e7231661", "photo-1517336714731-489689fd1ca8", "photo-1583394838336-acd977736f90", "photo-1555617981-dac3880eac6e"],
    "smart-home": ["photo-1558002038-1055907df827", "photo-1600607687920-4e2a09cf159d", "photo-1585771724684-38269d6639fd", "photo-1596207891316-23851be3cc10"],
    enterprise: ["photo-1558494949-ef010cbdcc31", "photo-1544197150-b99a580bb7a8", "photo-1550751827-4bd374c3f58b", "photo-1451187580459-43490279c0fa"],
  };
  const PROJECT_SETS: Record<string, string[]> = {
    Ongoing: ["photo-1541888946425-d81bb19240f5", "photo-1503387762-592deb58ef4e", "photo-1504307651254-35680f356dfd", "photo-1590274853856-f22d5ee3d228"],
    Completed: ["photo-1486406146926-c627a92ad1ab", "photo-1503387762-592deb58ef4e", "photo-1541888946425-d81bb19240f5", "photo-1487958449943-2429e8be8625"],
  };

  const allVehicles = await prisma.vehicle.findMany();
  for (const v of allVehicles) {
    const has = await prisma.entityMedia.count({ where: { vehicleId: v.id } });
    if (has > 0) continue;
    const ids = VEHICLE_SETS[v.powertrain] ?? VEHICLE_SETS.BEV;
    await prisma.entityMedia.createMany({
      data: ids.map((imgId, i) => ({ vehicleId: v.id, url: U(imgId), altText: `${v.make} ${v.model} — view ${i + 1}`, isMain: i === 0, displayOrder: i })),
    });
  }

  const allProperties = await prisma.property.findMany();
  for (const p of allProperties) {
    const has = await prisma.entityMedia.count({ where: { propertyId: p.id } });
    if (has > 0) continue;
    const ids = PROPERTY_SETS[p.type] ?? PROPERTY_SETS.residential;
    await prisma.entityMedia.createMany({
      data: ids.map((imgId, i) => ({ propertyId: p.id, url: U(imgId), altText: `${p.title} — view ${i + 1}`, isMain: i === 0, displayOrder: i })),
    });
  }

  const allProducts = await prisma.product.findMany();
  for (const p of allProducts) {
    const has = await prisma.entityMedia.count({ where: { productId: p.id } });
    if (has > 0) continue;
    const ids = PRODUCT_SETS[p.category] ?? PRODUCT_SETS.enterprise;
    await prisma.entityMedia.createMany({
      data: ids.map((imgId, i) => ({ productId: p.id, url: U(imgId), altText: `${p.name} — view ${i + 1}`, isMain: i === 0, displayOrder: i })),
    });
  }

  const allProjects = await prisma.project.findMany();
  for (const p of allProjects) {
    const has = await prisma.entityMedia.count({ where: { projectId: p.id } });
    if (has > 0) continue;
    const ids = PROJECT_SETS[p.status] ?? PROJECT_SETS.Ongoing;
    await prisma.entityMedia.createMany({
      data: ids.map((imgId, i) => ({ projectId: p.id, url: U(imgId), altText: `${p.title} — view ${i + 1}`, isMain: i === 0, displayOrder: i })),
    });
  }
  const totalMedia = await prisma.entityMedia.count();
  console.log(`  ${totalMedia} total gallery images across all entities`);

  // ─── V7: branding, navigation, socials, admin user ───
  await prisma.siteBranding.create({
    data: {
      id: "default",
      siteName: "Greyfusion Limited",
      tagline: "Eight industries. One standard of execution.",
      logoLightUrl: "", logoDarkUrl: "", faviconUrl: "",
    },
  });
  await prisma.socialMediaLink.createMany({
    data: [
      { platform: "LinkedIn", url: "https://linkedin.com/company/greyfusion", iconKey: "linkedin", displayOrder: 1 },
      { platform: "X / Twitter", url: "https://x.com/greyfusionng", iconKey: "x", displayOrder: 2 },
      { platform: "Instagram", url: "https://instagram.com/greyfusionng", iconKey: "instagram", displayOrder: 3 },
      { platform: "WhatsApp", url: "https://wa.me/2349055554471", iconKey: "whatsapp", displayOrder: 4 },
    ],
  });
  await prisma.navigationItem.createMany({
    data: [
      { label: "Compliance", url: "/compliance", location: "FOOTER_QUICK", displayOrder: 1, target: "_self" },
      { label: "Privacy Policy", url: "/contact", location: "FOOTER_LEGAL", displayOrder: 1, target: "_self" },
      { label: "Terms of Service", url: "/contact", location: "FOOTER_LEGAL", displayOrder: 2, target: "_self" },
    ],
  });
  const adminPassword = process.env.ADMIN_PASSWORD ?? "greyfusion-ops-2026";
  const ALL_PERMS = ["MANAGE_VEHICLES", "MANAGE_PROPERTIES", "MANAGE_PRODUCTS", "MANAGE_PROJECTS", "MANAGE_COMPLIANCE", "MANAGE_CONTENT", "VIEW_ANALYTICS", "MANAGE_USERS"];
  await prisma.adminUser.createMany({
    data: [
      { username: "hello@greyfusion.com.ng", fullName: "Super Admin", passwordHash: hashPassword(adminPassword), role: "SUPER_ADMIN", permissions: JSON.stringify(ALL_PERMS), isActive: true },
      { username: "compliance@greyfusion.com.ng", fullName: "Amaka Okoro", passwordHash: hashPassword("compliance-2026"), role: "COMPLIANCE_OFFICER", permissions: JSON.stringify(["MANAGE_COMPLIANCE", "VIEW_ANALYTICS"]), isActive: true },
      { username: "editor@greyfusion.com.ng", fullName: "Tunde Balogun", passwordHash: hashPassword("editor-2026"), role: "EDITOR", permissions: JSON.stringify(["MANAGE_VEHICLES", "MANAGE_PROPERTIES", "MANAGE_PRODUCTS", "MANAGE_PROJECTS", "MANAGE_CONTENT"]), isActive: true },
      { username: "auditor@greyfusion.com.ng", fullName: "Ngozi Eze", passwordHash: hashPassword("auditor-2026"), role: "AUDITOR", permissions: JSON.stringify(["VIEW_ANALYTICS"]), isActive: false },
    ],
  });
  console.log("  branding + 4 socials + 3 nav items + 4 admin users (RBAC)");

  // ─── V13: demo analytics so the dashboard is populated on first view ───
  const aPaths = ["/", "/divisions/energy", "/divisions/autos", "/compliance", "/divisions/commerce", "/divisions/real-estate", "/divisions/it", "/divisions/smart-home"];
  const aDocs = ["CAC Certificate of Incorporation", "FIRS Tax Clearance Certificate (TCC)", "COREN Certificate of Registration", "NEMSA Electrical Contractor Licence", "Full Bid Pack"];
  const aEvents: { eventType: string; path: string; sessionId: string; ipAddress: string; userAgent: string; metadata: string | null; createdAt: Date }[] = [];
  const rnd = (n: number) => Math.floor(Math.random() * n);
  for (let dayAgo = 29; dayAgo >= 0; dayAgo--) {
    const base = new Date();
    base.setUTCDate(base.getUTCDate() - dayAgo);
    const sessions = 10 + rnd(22);
    for (let s = 0; s < sessions; s++) {
      const sid = `seed-${dayAgo}-${s}`;
      const ip = `197.210.${rnd(255)}.${rnd(255)}`;
      const views = 1 + rnd(4);
      for (let v = 0; v < views; v++) {
        const dt = new Date(base);
        dt.setUTCHours(8 + rnd(12), rnd(60), rnd(60));
        aEvents.push({ eventType: "PAGE_VIEW", path: aPaths[rnd(aPaths.length)], sessionId: sid, ipAddress: ip, userAgent: "seed", metadata: null, createdAt: dt });
      }
      if (Math.random() > 0.68) {
        const dt = new Date(base);
        dt.setUTCHours(9 + rnd(9), rnd(60));
        aEvents.push({ eventType: "DOWNLOAD", path: "/compliance", sessionId: sid, ipAddress: ip, userAgent: "seed", metadata: JSON.stringify({ title: aDocs[rnd(aDocs.length)], category: "compliance" }), createdAt: dt });
      }
      if (Math.random() > 0.85) {
        const dt = new Date(base);
        dt.setUTCHours(9 + rnd(9), rnd(60));
        aEvents.push({ eventType: "FORM_SUBMIT", path: aPaths[rnd(aPaths.length)], sessionId: sid, ipAddress: ip, userAgent: "seed", metadata: null, createdAt: dt });
      }
    }
  }
  await prisma.analyticsEvent.createMany({ data: aEvents });
  console.log(`  ${aEvents.length} demo analytics events (30 days)`);

  console.log("Seed complete. Admin console: /admin (password from ADMIN_PASSWORD in .env)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
