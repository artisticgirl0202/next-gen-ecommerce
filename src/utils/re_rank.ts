// src/utils/re_rank.ts
// export function clientReRank(recs: any[], currentProduct: any | null, userContext: { recentCategory?: string; priceMax?: number; deviceType?: string }) {
//   if (!Array.isArray(recs)) return [];
//   return recs
//     .map(r => ({
//       item: r,
//       score: (r.category === userContext.recentCategory ? 1 : 0) + (userContext.priceMax && r.price <= userContext.priceMax ? 0.5 : 0)
//     }))
//     .sort((a,b) => b.score - a.score)
//     .map(x => x.item);
// }
// src/utils/re_rank.ts
import type { Product } from "@/types";

export function clientReRank(
  recs: Product[] | unknown[],
  _currentProduct: Product | null,
  userContext: { recentCategory?: string; priceMax?: number; deviceType?: string }
): Product[] {
  if (!Array.isArray(recs)) return [];
  // 안전하게 Product[]로 취급
  const products = recs as Product[];

  return products
    .map((r) => ({
      item: r,
      score:
        (r.category === userContext.recentCategory ? 1 : 0) +
        (userContext.priceMax && typeof r.price === "number" && r.price <= userContext.priceMax ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}
