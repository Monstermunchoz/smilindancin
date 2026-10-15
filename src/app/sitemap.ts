import type { MetadataRoute } from "next";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { EVENTS } from "@/lib/data/events";
import { ARTICLES } from "@/lib/data/journal";
import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE.url}${p}`;
  return [
    { url: u("/"), priority: 1 }, { url: u("/shop"), priority: 0.9 }, { url: u("/collections"), priority: 0.7 }, { url: u("/events"), priority: 0.8 }, { url: u("/journal"), priority: 0.6 }, { url: u("/about"), priority: 0.5 }, { url: u("/faq") }, { url: u("/contact") },
    ...COLLECTIONS.map((c) => ({ url: u(`/collections/${c.handle}`), priority: 0.7 })),
    ...PRODUCTS.filter((p) => p.status !== "draft").map((p) => ({ url: u(`/shop/${p.handle}`), priority: 0.8 })),
    ...EVENTS.map((e) => ({ url: u(`/events/${e.slug}`), priority: 0.6 })),
    ...ARTICLES.map((a) => ({ url: u(`/journal/${a.slug}`), priority: 0.5, lastModified: a.date })),
  ];
}
