import { MetadataRoute } from "next";

const baseUrl = "https://www.corbantechnologies.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/sacco-platform",
          "/about",
          "/contact",
          "/careers",
          "/careers/*",
        ],
        disallow: [
          "/director/",
          "/director/*",
          "/finance/",
          "/finance/*",
          "/operations/",
          "/operations/*",
          "/employee/",
          "/employee/*",
          "/api/",
          "/api/*",
          "/auth/",
          "/auth/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
