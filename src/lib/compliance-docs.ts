/**
 * On-the-fly compliance document generation (V13). Guarantees every certificate is a
 * real, instant binary download even when no file has been uploaded, and assembles the
 * bid pack as a genuine ZIP archive — all with zero external dependencies.
 */

export interface CredentialLike {
  title: string;
  authority: string;
  licenseNumber: string;
  validUntil?: string;
  documentUrl?: string;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "document";
}

function pdfEscape(s: string): string {
  return s.replace(/[\\()]/g, (m) => "\\" + m);
}

/** Build a minimal, valid single-page PDF certifying one credential. */
export function buildCertificatePdf(c: CredentialLike): Buffer {
  const stream = [
    "BT",
    "/F1 18 Tf 72 730 Td (Greyfusion Limited) Tj",
    "/F1 13 Tf 0 -30 Td (Certified copy - Compliance & Trust Center) Tj",
    "/F1 15 Tf 0 -44 Td (" + pdfEscape(c.title) + ") Tj",
    "/F1 11 Tf 0 -26 Td (Issuing authority: " + pdfEscape(c.authority) + ") Tj",
    "0 -18 Td (Registration / licence no: " + pdfEscape(c.licenseNumber) + ") Tj",
    "0 -18 Td (" + pdfEscape(c.validUntil ? "Validity: " + c.validUntil : "RC 1120352") + ") Tj",
    "0 -40 Td /F1 9 Tf (This document is a system-generated certified copy for procurement due diligence.) Tj",
    "ET",
  ].join("\n");

  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, "0") + " 00000 n \n";
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  data: Buffer;
}

/** Assemble a valid store-method (uncompressed) ZIP archive from in-memory entries. */
export function buildZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, "utf8");
    const crc = crc32(e.data);
    const size = e.data.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method: store
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0x21, 12); // mod date (1980-01-01)
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, e.data);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4); // version made by
    cd.writeUInt16LE(20, 6); // version needed
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0x21, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(size, 20);
    cd.writeUInt32LE(size, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);

    offset += local.length + nameBuf.length + size;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, end]);
}

/** Decode a data: URL into a buffer + content type + file extension. */
export function decodeDataUrl(url: string): { buffer: Buffer; contentType: string; ext: string } | null {
  const m = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(url);
  if (!m) return null;
  const contentType = m[1] || "application/octet-stream";
  const buffer = m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]), "utf8");
  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  return { buffer, contentType, ext };
}

export const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
};
