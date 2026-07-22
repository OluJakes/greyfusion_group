/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
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
