import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CareersBoard } from "@/components/CareersBoard";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles across Greyfusion's seven business units in Abuja, Lagos and Port Harcourt.",
};

export default async function CareersPage() {
  const jobs = await prisma.job.findMany({ where: { open: true }, orderBy: { postedAt: "desc" } });

  const jobsJsonLd = jobs.map((j) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: j.summary,
    datePosted: j.postedAt.toISOString(),
    employmentType: j.type.toUpperCase().replace("-", "_"),
    hiringOrganization: { "@type": "Organization", name: "Greyfusion Limited", sameAs: "https://www.greyfusion.com.ng" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, addressCountry: "NG" } },
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsJsonLd) }} />
      <section className="bg-graphite pb-16 pt-36 text-white">
        <div className="container-gf max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fusion">Careers</p>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Build the standard with us.</h1>
          <p className="mt-5 leading-relaxed text-titanium">
            We hire people who measure their own work. Every role below is real, budgeted and open —
            applications go straight to the hiring manager&apos;s queue.
          </p>
        </div>
      </section>
      <section className="container-gf py-16">
        <CareersBoard
          jobs={jobs.map((j) => ({
            id: j.id,
            slug: j.slug,
            title: j.title,
            division: j.division,
            location: j.location,
            type: j.type,
            summary: j.summary,
            description: j.description,
          }))}
        />
      </section>
    </>
  );
}
