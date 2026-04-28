import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup-slash-production.up.railway.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/slash/",
        disallow: ["/slash/admin/", "/slash/confirmation/"],
      },
    ],
    sitemap: `${SITE_URL}/slash/sitemap.xml`,
    host: SITE_URL,
  };
}
