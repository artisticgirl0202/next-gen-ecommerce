"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientReRank = clientReRank;
// src/utils/re_rank.ts
function clientReRank(recs, currentProduct, userContext) {
    if (!Array.isArray(recs))
        return [];
    return recs
        .map(function (r) { return ({
        item: r,
        score: (r.category === userContext.recentCategory ? 1 : 0) + (userContext.priceMax && r.price <= userContext.priceMax ? 0.5 : 0)
    }); })
        .sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return x.item; });
}
