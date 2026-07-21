import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-gf flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="num font-display text-7xl font-bold text-fusion">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">This page isn&apos;t on the drawings.</h1>
      <p className="mt-2 max-w-md text-sm ink-muted">
        The link may have moved when we reorganised. Try the divisions below, or press ⌘K to search everything.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back to the gateway</Link>
        <Link href="/contact" className="btn-secondary">Contact us</Link>
      </div>
    </section>
  );
}
