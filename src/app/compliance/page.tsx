import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getCredentials, type CredentialView } from "@/lib/content";
import { COMPANY } from "@/lib/divisions";
import { formatBytes, credentialStatus, fmtDate, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compliance & Trust Center",
  description:
    "Greyfusion Limited's corporate compliance vault — CAC, FIRS TCC & VAT, ITF, NSITF, PENCOM, BPP, SCUML, NITDA, COREN, NEMSA, CPN, audited financials and a full downloadable bid pack. Verified credentials for public and private procurement.",
};

const CATEGORIES: { key: string; label: string; blurb: string }[] = [
  { key: "bidpack", label: "Tender-Ready Bid Pack", blurb: "The complete dossier, in one download." },
  { key: "corporate", label: "Corporate Registry", blurb: "Incorporation and statutory identity." },
  { key: "tax", label: "Tax & Levies", blurb: "Federal tax standing, current year." },
  { key: "procurement", label: "Procurement & AML", blurb: "Public-sector bidding eligibility." },
  { key: "professional", label: "Professional Licences", blurb: "Regulated-practice registrations." },
  { key: "financial", label: "Financial Standing", blurb: "Audited accounts and capacity." },
];

const STATUS_STYLES: Record<string, string> = {
  valid: "bg-green-600/12 text-green-600",
  expiring: "bg-amber-signal/15 text-amber-signal",
  expired: "bg-fusion/12 text-fusion",
  perpetual: "bg-[var(--surface-2)] ink-muted",
};

function StatusPill({ c }: { c: CredentialView }) {
  const { status, days } = credentialStatus(c.expiryDate);
  const label =
    status === "valid" ? "Valid" : status === "expiring" ? `Expiring · ${days}d` : status === "expired" ? "Expired" : "No expiry";
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS_STYLES[status])}>{label}</span>;
}

function DownloadButton({ c }: { c: CredentialView }) {
  // Frictionless direct download — streams the uploaded file or a generated certified
  // PDF, with no email capture or contact wall in front of it.
  return (
    <a href={`/api/compliance/download?id=${encodeURIComponent(c.id)}`} className="btn-secondary !py-2 text-xs">
      Download certified copy{c.fileSizeInBytes > 0 ? ` · ${formatBytes(c.fileSizeInBytes)}` : ""} ↓
    </a>
  );
}

export default async function CompliancePage() {
  const credentials = await getCredentials();
  const bidPack = credentials.find((c) => c.category === "bidpack");

  return (
    <>
      <section className="relative overflow-hidden bg-graphite pb-20 pt-36 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(55% 45% at 75% 20%, rgba(226,88,62,0.16), transparent 70%)" }}
        />
        <div className="container-gf relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fusion">Compliance & Trust Center</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Due diligence, pre-answered.
          </h1>
          <p className="mt-6 leading-relaxed text-titanium">
            Every registration a Nigerian public or private procurement desk will ask for — current,
            numbered, and verifiable. Download the complete bid pack, or pull any single certificate. {COMPANY.rc}.
          </p>
          {bidPack && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/api/compliance/download?bidpack=1" className="btn-primary">
                Download full bid pack{bidPack.fileSizeInBytes > 0 ? ` · ${formatBytes(bidPack.fileSizeInBytes)}` : ""}
              </a>
              <StatusPill c={bidPack} />
            </div>
          )}
        </div>
      </section>

      <section className="container-gf py-16">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider hairline ink-muted">
                    <th className="px-5 py-3.5 font-semibold">Credential</th>
                    <th className="px-5 py-3.5 font-semibold">Authority</th>
                    <th className="px-5 py-3.5 font-semibold">Number</th>
                    <th className="px-5 py-3.5 font-semibold">Validity</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Document</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((c) => (
                    <tr key={c.id} className="border-b align-middle hairline transition-colors hover:bg-[var(--surface-2)]">
                      <td className="px-5 py-4 font-semibold">{c.title}</td>
                      <td className="px-5 py-4 ink-muted">{c.authority}</td>
                      <td className="num px-5 py-4">{c.licenseNumber}</td>
                      <td className="num px-5 py-4 ink-muted">
                        {c.expiryDate ? fmtDate(c.expiryDate) : c.validUntil || "Perpetual"}
                      </td>
                      <td className="px-5 py-4"><StatusPill c={c} /></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {c.verificationUrl && (
                            <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 text-xs">
                              Verify ↗
                            </a>
                          )}
                          <DownloadButton c={c} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {credentials.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center ink-muted">Credentials are being loaded into the vault.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const n = credentials.filter((c) => c.category === cat.key).length;
            if (n === 0) return null;
            return (
              <div key={cat.key} className="card p-4">
                <p className="num font-display text-2xl font-bold text-fusion">{n}</p>
                <p className="mt-1 text-xs font-semibold">{cat.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug ink-muted">{cat.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t hairline bg-[var(--surface)] py-16">
        <div className="container-gf flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold">Need certified true copies?</h2>
            <p className="mt-2 text-sm leading-relaxed ink-muted">
              We compile stamped hard copies, reference letters and audited financials into a
              tender-ready dossier — dispatched within 24 hours to procurement desks.
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">Request compliance dossier</Link>
        </div>
      </section>
    </>
  );
}
