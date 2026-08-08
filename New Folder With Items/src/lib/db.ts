import { prisma } from "@/lib/prisma";

/**
 * V9 compatibility accessor.
 *
 * The three V9 models (SyncLog, EssCalculationLead, SmartHomeQuote) are defined in
 * schema.prisma but the client shipped in this repo predates them. Running the standard
 * `npx prisma generate` (it also runs on `postinstall`) makes these delegates native on
 * `prisma`; this typed view keeps the source idiomatic and type-safe in the meantime and
 * stays structurally compatible after regeneration.
 *
 * `db` exposes every existing delegate (product, entityMedia, $transaction, …) plus the
 * three new ones. Use `prisma` elsewhere; use `db` where a V9 model is touched.
 */

// NOTE: these are `type` aliases (not interfaces) so TypeScript grants them the
// implicit index signature the generic admin table needs (Record<string, unknown>).
export type SyncLogRow = {
  id: string;
  source: string;
  status: string;
  itemCount: number;
  details: string | null;
  executedAt: Date;
};

export type EssCalculationLeadRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dailyKwh: number;
  recommendedBattery: string;
  recommendedPv: string;
  recommendedInverter: string;
  status: string;
  createdAt: Date;
};

export type SmartHomeQuoteRow = {
  id: string;
  propertyType: string;
  zoneCount: number;
  selectedModules: string;
  estimatedCost: number;
  clientPhone: string | null;
  createdAt: Date;
};

interface Delegate<Row, CreateData> {
  create(args: { data: CreateData }): Promise<Row>;
  findMany(args?: { where?: unknown; orderBy?: unknown; take?: number; skip?: number }): Promise<Row[]>;
  count(args?: { where?: unknown }): Promise<number>;
}

interface V9Delegates {
  syncLog: Delegate<SyncLogRow, { source?: string; status: string; itemCount?: number; details?: string | null }>;
  essCalculationLead: Delegate<
    EssCalculationLeadRow,
    {
      fullName: string;
      email: string;
      phone?: string;
      dailyKwh: number;
      recommendedBattery: string;
      recommendedPv: string;
      recommendedInverter: string;
      status?: string;
    }
  >;
  smartHomeQuote: Delegate<
    SmartHomeQuoteRow,
    { propertyType: string; zoneCount?: number; selectedModules?: string; estimatedCost?: number; clientPhone?: string | null }
  >;
}

// ─── V13: analytics + RBAC admin users ───

export type AnalyticsEventRow = {
  id: string;
  eventType: string;
  path: string;
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: Date;
};

export type DailyAnalyticsSummaryRow = {
  id: string;
  date: string;
  totalVisits: number;
  uniqueVisitors: number;
  totalDownloads: number;
  bounceRate: number;
  updatedAt: Date;
};

export type AdminUserRow = {
  id: string;
  username: string;
  fullName: string;
  passwordHash: string;
  role: string;
  permissions: string; // JSON string[]
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

interface AnalyticsEventDelegate {
  create(args: {
    data: { eventType: string; path: string; sessionId: string; ipAddress?: string | null; userAgent?: string | null; metadata?: string | null };
  }): Promise<AnalyticsEventRow>;
  findMany(args?: { where?: unknown; orderBy?: unknown; take?: number; skip?: number; select?: unknown }): Promise<AnalyticsEventRow[]>;
  count(args?: { where?: unknown }): Promise<number>;
}

interface DailyAnalyticsSummaryDelegate {
  findMany(args?: { where?: unknown; orderBy?: unknown; take?: number }): Promise<DailyAnalyticsSummaryRow[]>;
  upsert(args: { where: { date: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<DailyAnalyticsSummaryRow>;
}

interface AdminUserDelegate {
  findUnique(args: { where: { id?: string; username?: string } }): Promise<AdminUserRow | null>;
  findFirst(args?: { where?: unknown; orderBy?: unknown }): Promise<AdminUserRow | null>;
  findMany(args?: { where?: unknown; orderBy?: unknown }): Promise<AdminUserRow[]>;
  create(args: {
    data: { username: string; fullName?: string; passwordHash: string; role?: string; permissions?: string; isActive?: boolean };
  }): Promise<AdminUserRow>;
  update(args: { where: { id?: string; username?: string }; data: Record<string, unknown> }): Promise<AdminUserRow>;
  delete(args: { where: { id: string } }): Promise<AdminUserRow>;
  count(args?: { where?: unknown }): Promise<number>;
}

interface V13Delegates {
  analyticsEvent: AnalyticsEventDelegate;
  dailyAnalyticsSummary: DailyAnalyticsSummaryDelegate;
  adminUser: AdminUserDelegate;
}

export const db = prisma as unknown as Omit<typeof prisma, keyof V9Delegates | keyof V13Delegates> &
  V9Delegates &
  V13Delegates;
