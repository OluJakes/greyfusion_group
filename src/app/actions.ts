"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { makeRef } from "@/lib/utils";
import { getGateway } from "@/lib/payments";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  ref?: string;
  error?: string;
}

const LEAD_TYPES = [
  "PROJECT_INTAKE",
  "VENDOR_REG",
  "MAINTENANCE",
  "TEST_DRIVE",
  "B2B_QUOTE",
  "APPLICATION",
  "CONTACT",
  "TRADE_IN",
  "CAPABILITY_DECK",
] as const;

const leadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  division: z.enum(["corporate", "construction", "energy", "it", "smart-home", "real-estate", "autos", "commerce"]),
  name: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  payload: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
});

export type LeadInput = z.input<typeof leadSchema>;

const REF_PREFIX: Record<(typeof LEAD_TYPES)[number], string> = {
  PROJECT_INTAKE: "GF-PRJ",
  VENDOR_REG: "GF-VEN",
  MAINTENANCE: "GF-MNT",
  TEST_DRIVE: "GF-TDR",
  B2B_QUOTE: "GF-B2B",
  APPLICATION: "GF-APP",
  CONTACT: "GF-ENQ",
  TRADE_IN: "GF-TRD",
  CAPABILITY_DECK: "GF-CAP",
};

export async function submitLead(input: LeadInput): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid submission" };
  }
  const d = parsed.data;
  const ref = makeRef(REF_PREFIX[d.type]);
  await prisma.lead.create({
    data: {
      ref,
      type: d.type,
      division: d.division,
      name: d.name,
      email: d.email,
      phone: d.phone,
      subject: d.subject,
      payload: JSON.stringify(d.payload),
    },
  });
  return { ok: true, ref };
}

/* ── V9: Pro ESS sizing lead ── */
const essLeadSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().default(""),
  dailyKwh: z.number().nonnegative().max(100000),
  recommendedBattery: z.string().max(160),
  recommendedPv: z.string().max(160),
  recommendedInverter: z.string().max(160),
});

export type EssLeadInput = z.input<typeof essLeadSchema>;

export async function submitEssLead(input: EssLeadInput): Promise<ActionResult> {
  const parsed = essLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid submission" };
  const d = parsed.data;
  await db.essCalculationLead.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      dailyKwh: d.dailyKwh,
      recommendedBattery: d.recommendedBattery,
      recommendedPv: d.recommendedPv,
      recommendedInverter: d.recommendedInverter,
    },
  });
  // Mirror into the unified leads pipeline so the energy desk sees it alongside everything else.
  const ref = makeRef("GF-ESS");
  await prisma.lead.create({
    data: {
      ref,
      type: "PROJECT_INTAKE",
      division: "energy",
      name: d.fullName,
      email: d.email,
      phone: d.phone,
      subject: "Pro ESS sizing enquiry",
      payload: JSON.stringify({
        dailyKwh: d.dailyKwh,
        battery: d.recommendedBattery,
        pv: d.recommendedPv,
        inverter: d.recommendedInverter,
      }),
    },
  });
  return { ok: true, ref };
}

/* ── V9: Smart-home configurator quote (best-effort log; WhatsApp is the primary channel) ── */
const smartHomeQuoteSchema = z.object({
  propertyType: z.string().min(2).max(80),
  zoneCount: z.number().int().min(0).max(999),
  selectedModules: z.array(z.string().max(80)).max(40),
  estimatedCost: z.number().nonnegative().max(10_000_000_000),
  clientPhone: z.string().max(40).optional().default(""),
});

export type SmartHomeQuoteInput = z.input<typeof smartHomeQuoteSchema>;

export async function submitSmartHomeQuote(input: SmartHomeQuoteInput): Promise<ActionResult> {
  const parsed = smartHomeQuoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid quote" };
  const d = parsed.data;
  try {
    await db.smartHomeQuote.create({
      data: {
        propertyType: d.propertyType,
        zoneCount: d.zoneCount,
        selectedModules: JSON.stringify(d.selectedModules),
        estimatedCost: d.estimatedCost,
        clientPhone: d.clientPhone || null,
      },
    });
  } catch {
    // Logging is best-effort; the client still opens WhatsApp regardless.
    return { ok: false, error: "Could not log quote" };
  }
  return { ok: true };
}

const ticketSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  category: z.enum(["Security incident", "Cloud & infrastructure", "Email & collaboration", "Hardware", "Access & identity", "Other"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(10, "Describe the issue in at least 10 characters").max(4000),
});

export async function createTicket(input: z.input<typeof ticketSchema>): Promise<ActionResult> {
  const parsed = ticketSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid ticket" };
  const ref = makeRef("GF-IT");
  await prisma.ticket.create({ data: { ...parsed.data, ref } });
  return { ok: true, ref };
}

export async function findTickets(email: string, ref?: string) {
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return [];
  return prisma.ticket.findMany({
    where: { email: parsed.data, ...(ref ? { ref } : {}) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function createBooking(input: z.input<typeof bookingSchema>): Promise<ActionResult & { totalNGN?: number }> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid booking" };
  const d = parsed.data;
  const property = await prisma.property.findUnique({ where: { id: d.propertyId } });
  if (!property || property.type !== "shortlet") return { ok: false, error: "Property not available for shortlet booking" };

  const start = new Date(d.startDate + "T12:00:00Z");
  const end = new Date(d.endDate + "T12:00:00Z");
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (nights < 1) return { ok: false, error: "Check-out must be after check-in" };
  if (nights > 90) return { ok: false, error: "For stays beyond 90 nights, contact our lettings desk" };
  if (start.getTime() < Date.now() - 86_400_000) return { ok: false, error: "Check-in date is in the past" };

  const clash = await prisma.propertyBooking.findFirst({
    where: {
      propertyId: d.propertyId,
      status: { in: ["PENDING", "CONFIRMED", "BLOCKED"] },
      startDate: { lt: end },
      endDate: { gt: start },
    },
  });
  if (clash) return { ok: false, error: "Those dates are no longer available — please adjust your range" };

  const totalNGN = nights * property.nightlyNGN;
  const ref = makeRef("GF-BKG");
  await prisma.propertyBooking.create({
    data: { ref, propertyId: d.propertyId, name: d.name, email: d.email, phone: d.phone, startDate: start, endDate: end, totalNGN },
  });
  revalidatePath(`/divisions/real-estate/${property.slug}`);
  return { ok: true, ref, totalNGN };
}

const orderSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(240),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(60),
  method: z.enum(["paystack", "paypal", "payoneer", "transfer", "pod"]),
  items: z
    .array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(99), variant: z.string().max(120).optional().default("") }))
    .min(1, "Your cart is empty"),
});

export interface OrderResult extends ActionResult {
  totalNGN?: number;
  redirectUrl?: string | null;
  instructions?: string;
}

export async function createOrder(input: z.input<typeof orderSchema>): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid order" };
  const d = parsed.data;

  const products = await prisma.product.findMany({ where: { slug: { in: d.items.map((i) => i.slug) } } });
  const lines: { slug: string; name: string; qty: number; priceNGN: number; variant: string }[] = [];
  for (const item of d.items) {
    const p = products.find((x) => x.slug === item.slug);
    if (!p) return { ok: false, error: "A cart item is no longer available" };
    if (p.stock < item.qty) return { ok: false, error: `Only ${p.stock} unit(s) of ${p.name} left in stock` };
    lines.push({ slug: p.slug, name: p.name, qty: item.qty, priceNGN: p.priceNGN, variant: item.variant ?? "" });
  }
  const totalNGN = lines.reduce((sum, l) => sum + l.priceNGN * l.qty, 0);
  const ref = makeRef("GF-ORD");

  // Regional multi-gateway matrix: Paystack (live when keyed), PayPal/Payoneer slots,
  // bank transfer and pay-on-delivery. See src/lib/payments.ts.
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let init: { redirectUrl: string | null; gatewayRef: string; instructions: string };
  try {
    init = await getGateway(d.method).initialize({
      ref,
      email: d.email,
      amountNGN: totalNGN,
      callbackUrl: `${site}/api/payments/verify?ref=${ref}`,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment gateway unavailable — try another method" };
  }

  await prisma.$transaction([
    prisma.order.create({
      data: {
        ref, name: d.name, email: d.email, phone: d.phone, address: d.address, city: d.city,
        state: d.state, method: d.method, gateway: d.method, gatewayRef: init.gatewayRef,
        items: JSON.stringify(lines), totalNGN,
      },
    }),
    ...lines.map((l) => prisma.product.update({ where: { slug: l.slug }, data: { stock: { decrement: l.qty } } })),
  ]);
  revalidatePath("/divisions/commerce");
  return { ok: true, ref, totalNGN, redirectUrl: init.redirectUrl, instructions: init.instructions };
}

export async function trackOrder(refInput: string) {
  const ref = z.string().min(6).max(40).safeParse(refInput.trim().toUpperCase());
  if (!ref.success) return null;
  const order = await prisma.order.findUnique({ where: { ref: ref.data } });
  if (!order) return null;
  return { ref: order.ref, status: order.status, totalNGN: order.totalNGN, createdAt: order.createdAt.toISOString(), items: order.items };
}
