import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/slash/",
        disallow: [
          "/slash/admin/",
          "/slash/confirmation/",
          "/slash/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/slash/sitemap.xml`,
    host: SITE_URL,
  };
}
