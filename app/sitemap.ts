import type { MetadataRoute } from "next";
import { SITE } from "./site";

export const dynamic = "force-static";

// Two routes, both static. Listed by hand rather than crawled, because there is
// nothing to crawl: adding a third page means adding a line here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/cv`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
