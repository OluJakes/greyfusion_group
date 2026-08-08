/**
 * Pro ESS (Energy Storage System) sizing engine (V9).
 *
 * Engineering constants and formulas per the division spec. Pure and deterministic so
 * the maths can be unit-tested independently of the React UI.
 */

export const ESS = {
  DOD: 0.8, // usable depth of discharge (LiFePO4)
  INVERTER_EFF: 0.92, // round-trip inverter efficiency
  PEAK_SUN_HOURS: 4.85, // West African average
  SYSTEM_LOSS: 0.78, // PV system loss factor (soiling, temp, wiring, MPPT)
  SURGE: 1.25, // inverter surge safety factor
  POWER_FACTOR: 0.85, // inverter power factor
} as const;

/** Standard commercial hybrid-inverter ratings (kVA). */
export const STANDARD_INVERTERS = [3, 5, 8, 10, 15, 20, 30, 50, 75, 100] as const;

/** Smallest standard inverter that covers the computed kVA (25kVA steps beyond the table). */
export function nearestStandardInverter(kva: number): number {
  for (const s of STANDARD_INVERTERS) if (kva <= s) return s;
  return Math.ceil(kva / 25) * 25;
}

export interface EssInputs {
  /** Total daily energy demand, kWh/day. */
  dailyKwh: number;
  /** Peak continuous connected load, kW. */
  peakKw: number;
  /** Days of autonomy (backup with no sun). */
  autonomyDays: number;
}

export interface EssSizing {
  dailyKwh: number;
  peakKw: number;
  batteryKwh: number;
  pvKwp: number;
  inverterKva: number;
  inverterStandardKva: number;
  dailyGenKwh: number;
  autonomyHours: number;
}

export function sizeEss({ dailyKwh, peakKw, autonomyDays }: EssInputs): EssSizing {
  const days = autonomyDays > 0 ? autonomyDays : 1;

  // Battery_kWh = (E_daily × Autonomy) / (DoD × η_inverter)
  const batteryKwh = dailyKwh > 0 ? (dailyKwh * days) / (ESS.DOD * ESS.INVERTER_EFF) : 0;

  // PV_kWp = E_daily / (PeakSunHours × η_system)
  const pvKwp = dailyKwh > 0 ? dailyKwh / (ESS.PEAK_SUN_HOURS * ESS.SYSTEM_LOSS) : 0;

  // Inverter_kVA = (PeakContinuousPower × Surge) / PowerFactor
  const inverterKva = peakKw > 0 ? (peakKw * ESS.SURGE) / ESS.POWER_FACTOR : 0;
  const inverterStandardKva = nearestStandardInverter(inverterKva);

  // Estimated daily generation from the sized array (≈ E_daily by construction).
  const dailyGenKwh = pvKwp * ESS.PEAK_SUN_HOURS * ESS.SYSTEM_LOSS;

  // Backup hours from usable battery at average load.
  const usableKwh = batteryKwh * ESS.DOD;
  const avgLoadKw = dailyKwh / 24;
  const autonomyHours = avgLoadKw > 0 ? usableKwh / avgLoadKw : 0;

  return { dailyKwh, peakKw, batteryKwh, pvKwp, inverterKva, inverterStandardKva, dailyGenKwh, autonomyHours };
}

export interface Appliance {
  key: string;
  label: string;
  watts: number;
  hours: number; // default run-hours per day
  qty: number; // default quantity
}

/** Default appliance library for the checklist (Nigerian residential/SME mix). */
export const APPLIANCES: Appliance[] = [
  { key: "ac", label: "Air conditioner (1.5HP)", watts: 1200, hours: 6, qty: 1 },
  { key: "fridge", label: "Fridge / freezer", watts: 200, hours: 10, qty: 1 },
  { key: "lights", label: "LED lighting (whole home)", watts: 300, hours: 6, qty: 1 },
  { key: "tv", label: "TV & entertainment", watts: 150, hours: 5, qty: 1 },
  { key: "pump", label: "Water pump", watts: 750, hours: 2, qty: 1 },
  { key: "cctv", label: "CCTV / network / servers", watts: 400, hours: 24, qty: 1 },
  { key: "kitchen", label: "Kitchen (microwave, kettle)", watts: 1500, hours: 1, qty: 1 },
  { key: "office", label: "Computers & office", watts: 300, hours: 8, qty: 1 },
];

export interface ApplianceRow {
  included: boolean;
  qty: number;
  hours: number;
}

/** Aggregate a checklist selection into daily energy (kWh) and peak connected load (kW). */
export function aggregateLoad(rows: Record<string, ApplianceRow>, library: Appliance[] = APPLIANCES): { dailyKwh: number; peakKw: number } {
  let dailyKwh = 0;
  let peakKw = 0;
  for (const a of library) {
    const r = rows[a.key];
    if (!r?.included) continue;
    const kw = a.watts / 1000;
    dailyKwh += kw * r.hours * r.qty;
    peakKw += kw * r.qty;
  }
  return { dailyKwh, peakKw };
}
