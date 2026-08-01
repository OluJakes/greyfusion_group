/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Types are verified with `tsc --noEmit`; don't let lint warnings fail production builds.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
    // Inline document/logo uploads are sent base64-encoded inside the Server Action body.
    // The default cap is 1MB, which silently rejects even a small PDF once encoded (+33%).
    serverActions: { bodySizeLimit: "16mb" },
  },
  async redirects() {
    // Short paths: www.greyfusion.com.ng/energy -> /divisions/energy
    // (subdomains e.g. energy.greyfusion.com.ng are rewritten in middleware.ts)
    const divisions = ["construction", "energy", "it", "real-estate", "autos", "commerce", "smart-home"];
    return [
      ...divisions.map((d) => ({ source: `/${d}`, destination: `/divisions/${d}`, permanent: true })),
      { source: "/store", destination: "/divisions/commerce", permanent: true },
      { source: "/realestate", destination: "/divisions/real-estate", permanent: true },
      { source: "/smarthome", destination: "/divisions/smart-home", permanent: true },
    ];
  },
};
export default nextConfig;
