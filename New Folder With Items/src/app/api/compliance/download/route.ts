import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientMeta, logEvent } from "@/lib/track";
import { SESSION_COOKIE } from "@/lib/analytics";
import {
  buildCertificatePdf,
  buildZip,
  decodeDataUrl,
  slugify,
  EXT_BY_TYPE,
  type ZipEntry,
} from "@/lib/compliance-docs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BID_PACK_MAX = 104_857_600; // 100MB cap

interface CredRow {
  id: string;
  title: string;
  authority: string;
  licenseNumber: string;
  validUntil: string;
  category: string;
  documentUrl: string;
  isActive: boolean;
}

function fileFor(cred: CredRow): { data: Buffer; contentType: string; ext: string } {
  if (cred.documentUrl && cred.documentUrl.startsWith("data:")) {
    const decoded = decodeDataUrl(cred.documentUrl);
    if (decoded) return { data: decoded.buffer, contentType: decoded.contentType, ext: decoded.ext };
  }
  // No uploaded file → generate a certified-copy PDF on the fly.
  return { data: buildCertificatePdf(cred), contentType: "application/pdf", ext: "pdf" };
}

function download(data: Buffer, filename: string, contentType: string): NextResponse {
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Frictionless, high-speed compliance download. No email capture, no contact wall:
 *   • ?id=<credentialId>  → that certificate (uploaded file, or generated PDF)
 *   • ?bidpack=1          → the full bid pack as a real .zip of every active credential
 * Every download is logged (document title, timestamp, IP) for the analytics dashboard.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const wantBidpack = req.nextUrl.searchParams.get("bidpack") === "1";

  let all: CredRow[] = [];
  try {
    all = (await prisma.corporateCredential.findMany({ orderBy: { displayOrder: "asc" } })) as unknown as CredRow[];
  } catch {
    return NextResponse.json({ error: "Compliance store unavailable" }, { status: 503 });
  }
  const active = all.filter((c) => c.isActive);

  const target = id ? all.find((c) => c.id === id) : null;
  const isBidpack = wantBidpack || target?.category === "bidpack";

  const { ipAddress, userAgent } = clientMeta(req);
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value || "server";

  if (isBidpack) {
    const parts = active.filter((c) => c.category !== "bidpack");
    const entries: ZipEntry[] = [];
    let total = 0;
    for (const c of parts) {
      const f = fileFor(c);
      total += f.data.length;
      if (total > BID_PACK_MAX) break; // enforce the 100MB cap
      entries.push({ name: `${slugify(c.title)}.${f.ext}`, data: f.data });
    }
    if (entries.length === 0) {
      return NextResponse.json({ error: "No credentials available" }, { status: 404 });
    }
    const zip = buildZip(entries);
    await logEvent({
      eventType: "DOWNLOAD",
      path: "/compliance",
      sessionId,
      ipAddress,
      userAgent,
      metadata: JSON.stringify({ title: "Full Bid Pack", category: "bidpack", files: entries.length }),
    });
    return download(zip, `greyfusion-bid-pack-${new Date().toISOString().slice(0, 10)}.zip`, "application/zip");
  }

  if (!target || !target.isActive) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Externally-hosted document → redirect to source (still zero-friction).
  if (target.documentUrl && /^https?:\/\//i.test(target.documentUrl)) {
    await logEvent({
      eventType: "DOWNLOAD",
      path: "/compliance",
      sessionId,
      ipAddress,
      userAgent,
      metadata: JSON.stringify({ id: target.id, title: target.title, category: target.category, source: "external" }),
    });
    return NextResponse.redirect(target.documentUrl);
  }

  const f = fileFor(target);
  await logEvent({
    eventType: "DOWNLOAD",
    path: "/compliance",
    sessionId,
    ipAddress,
    userAgent,
    metadata: JSON.stringify({ id: target.id, title: target.title, category: target.category }),
  });
  const ext = f.ext || EXT_BY_TYPE[f.contentType] || "bin";
  return download(f.data, `${slugify(target.title)}.${ext}`, f.contentType);
}
