"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// src/app/api/products/route.ts
var demo_products_500_json_1 = require("@/data/demo_products_500.json");
var server_1 = require("next/server");
function normalizePageParams(rawPage, rawPageSize) {
    var page = Math.max(1, Number(rawPage !== null && rawPage !== void 0 ? rawPage : "1") || 1);
    var pageSize = Number(rawPageSize !== null && rawPageSize !== void 0 ? rawPageSize : "") || Number(rawPageSize === null ? 24 : rawPageSize) || 24;
    return { page: page, pageSize: pageSize };
}
function GET(req) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, rawPage, rawPageSize, _a, page, pageSize, category, q, sort, items, qq_1, total, start, paged;
        var _b;
        return __generator(this, function (_c) {
            searchParams = new URL(req.url).searchParams;
            rawPage = searchParams.get("page");
            rawPageSize = (_b = searchParams.get("page_size")) !== null && _b !== void 0 ? _b : searchParams.get("pageSize");
            _a = normalizePageParams(rawPage, rawPageSize), page = _a.page, pageSize = _a.pageSize;
            category = searchParams.get("category");
            q = searchParams.get("q");
            sort = searchParams.get("sort");
            items = Array.isArray(demo_products_500_json_1.default) ? __spreadArray([], demo_products_500_json_1.default, true) : [];
            if (category && category !== "All") {
                items = items.filter(function (p) { return Array.isArray(p.categories) ? p.categories.includes(category) : p.category === category; });
            }
            if (q) {
                qq_1 = q.toLowerCase();
                items = items.filter(function (p) { var _a, _b; return ((_a = p.name) !== null && _a !== void 0 ? _a : "").toString().toLowerCase().includes(qq_1) || ((_b = p.brand) !== null && _b !== void 0 ? _b : "").toString().toLowerCase().includes(qq_1); });
            }
            if (sort === "price_low")
                items.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
            if (sort === "price_high")
                items.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
            if (!sort)
                items.sort(function (a, b) { return (b.id || 0) - (a.id || 0); });
            total = items.length;
            start = (page - 1) * pageSize;
            paged = items.slice(start, start + pageSize);
            return [2 /*return*/, server_1.NextResponse.json({
                    items: paged,
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    products: paged,
                    page_size: pageSize,
                })];
        });
    });
}
