import type { Metadata } from "next";
import { COMPANY } from "@/lib/divisions";
import { ContactRouter } from "@/components/ContactRouter";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Greyfusion Limited — division-routed intake, WhatsApp, phone and email. Suite A-6, Emab Plaza, Wuse 2, Abuja.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-graphite pb-16 pt-36 text-white">
        <div className="container-gf max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fusion">Contact</p>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Route it to the right desk.</h1>
          <p className="mt-5 leading-relaxed text-titanium">
            Choose a division and the form adapts — your enquiry lands directly in that team&apos;s
            pipeline, not a general inbox.
          </p>
        </div>
      </section>
      <section className="container-gf grid gap-10 py-16 lg:grid-cols-[1fr_20rem]">
        <div className="card p-6 sm:p-8">
          <ContactRouter />
        </div>
        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Head office</h2>
            <p className="mt-3 text-sm leading-relaxed ink-muted">{COMPANY.address}</p>
            <p className="mt-2 text-sm num">{COMPANY.phones.join(" · ")}</p>
            <a href={`mailto:${COMPANY.email}`} className="mt-1 block text-sm text-fusion">{COMPANY.email}</a>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Hours</h2>
            <p className="mt-3 text-sm leading-relaxed ink-muted">
              Mon–Fri · 8:00am – 5:00pm
              <br />
              Showroom & stores also open Sat · 9:00am – 6:00pm
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">WhatsApp</h2>
            <p className="mt-3 text-sm ink-muted">Fastest response during working hours.</p>
            <a
              href={`https://wa.me/${COMPANY.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-3 w-full"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="card overflow-hidden">
            <div className="flex h-40 items-center justify-center surface-2 text-xs ink-muted" role="img" aria-label="Map placeholder — Emab Plaza, Wuse 2, Abuja">
              Map · Emab Plaza, Wuse 2, Abuja
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
