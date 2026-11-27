import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

// The whole site is one page: the story, ending in the contact form.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE}/` }];
}
