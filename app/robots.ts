import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://listng.com.ng";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/messages/", "/listings/create/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
