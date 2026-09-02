import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/slash`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // /sign-up is noindex (funnel page) and /manage is utility — neither belongs in the sitemap.
  ];
}
