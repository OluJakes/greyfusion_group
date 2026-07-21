import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(req: NextRequest) {
  // Independent session verification — never rely on middleware alone.
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "ALL";
  const division = sp.get("division") ?? "ALL";
  const status = sp.get("status") ?? "ALL";

  const leads = await prisma.lead.findMany({
    where: {
      ...(type !== "ALL" ? { type } : {}),
      ...(division !== "ALL" ? { division } : {}),
      ...(status !== "ALL" ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const header = ["ref", "type", "division", "status", "name", "email", "phone", "subject", "payload", "createdAt"];
  const rows = leads.map((l) =>
    [l.ref, l.type, l.division, l.status, l.name, l.email, l.phone, l.subject, l.payload, l.createdAt.toISOString()]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greyfusion-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
