import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGateway } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Paystack callback / manual re-verify endpoint.
 * Verifies the transaction server-side with the gateway (never trusts the
 * redirect alone), updates the order, then sends the buyer to order tracking.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref") ?? req.nextUrl.searchParams.get("reference") ?? "";
  const order = ref ? await prisma.order.findUnique({ where: { ref } }) : null;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!order) {
    return NextResponse.redirect(`${site}/divisions/commerce/track`);
  }

  const status = await getGateway(order.gateway || order.method).verify(order.gatewayRef || order.ref);
  if (status === "success" && order.status === "PENDING") {
    await prisma.order.update({ where: { ref }, data: { status: "PAID" } });
  }

  return NextResponse.redirect(`${site}/divisions/commerce/track?ref=${encodeURIComponent(ref)}`);
}
