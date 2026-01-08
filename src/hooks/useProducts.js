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
exports.useAddToCart = exports.useProducts = void 0;
var cart_1 = require("@/api/cart"); // 실제 API 함수 임포트 확인
var products_1 = require("@/api/products");
var react_query_1 = require("@tanstack/react-query");
var useProducts = function (page, searchQuery) {
    if (searchQuery === void 0) { searchQuery = ""; }
    return (0, react_query_1.useQuery)({
        // queryKey에 종속성을 명확히 하여 불필요한 재호출 방지
        queryKey: ["products", { page: page, searchQuery: searchQuery }],
        queryFn: function () { return (0, products_1.fetchProductsPage)(page, 12, searchQuery); },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        // 데이터가 로딩 중일 때 UI가 굳지 않도록 이전 데이터 유지
        placeholderData: function (previousData) { return previousData; },
        // 500개 데이터를 다룰 때 네트워크 에러가 브라우저를 멈추지 않게 방어
        retry: 1,
    });
};
exports.useProducts = useProducts;
// Optimistic Update 적용 (장바구니 추가)
var useAddToCart = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: cart_1.postCartItem,
        onMutate: function (newItem) { return __awaiter(void 0, void 0, void 0, function () {
            var previousCart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryClient.cancelQueries({ queryKey: ["cart"] })];
                    case 1:
                        _a.sent();
                        previousCart = queryClient.getQueryData(["cart"]);
                        queryClient.setQueryData(["cart"], function (old) { return __spreadArray(__spreadArray([], old, true), [newItem], false); });
                        return [2 /*return*/, { previousCart: previousCart }];
                }
            });
        }); },
        onError: function (err, newItem, context) {
            queryClient.setQueryData(["cart"], context === null || context === void 0 ? void 0 : context.previousCart);
        },
    });
};
exports.useAddToCart = useAddToCart;
