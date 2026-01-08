"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIRecommendations = void 0;
var getAIRecommendations = function (currentProduct, allProducts) {
    // 간단한 벡터 유사도 시뮬레이션: 카테고리 일치도 + 가격대 유사도
    return allProducts
        .filter(function (p) { return p.id !== currentProduct.id; })
        .map(function (p) {
        var score = 0;
        if (p.category === currentProduct.category)
            score += 0.5;
        if (Math.abs(p.price - currentProduct.price) < 500)
            score += 0.3;
        if (p.brand === currentProduct.brand)
            score += 0.2;
        return __assign(__assign({}, p), { aiScore: score });
    })
        .sort(function (a, b) { return b.aiScore - a.aiScore; })
        .slice(0, 4);
};
exports.getAIRecommendations = getAIRecommendations;
