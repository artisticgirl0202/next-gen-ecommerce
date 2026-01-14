'use strict';
// // src/hooks/useData.ts

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === 'function' ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.useAddToCart = exports.useProducts = void 0;
exports.useRecommendations = useRecommendations;
// export const useProducts = (page: number) => {
//   return useQuery({
//     queryKey: ["products", page],
//     queryFn: () => fetchProductsPage(page, 12),
//     staleTime: 1000 * 60 * 5,
//     cacheTime: 1000 * 60 * 30,
//   });
// };
// export function useRecommendations(productId: number | null, topN = 6) {
//   const qc = useQueryClient();
//   return useQuery(['recs', productId, topN], async () => {
//     if (!productId) return [];
//     const res = await fetchHybridRecommendations(productId, topN);
//     return res.recommendations ?? [];
//   }, {
//     enabled: !!productId,
//     staleTime: 1000 * 30,
//     cacheTime: 1000 * 60 * 10,
//     onSuccess: (items: any[]) => {
//       items.forEach((i) => { if (i?.image) { const img = new Image(); img.src = i.image; }});
//     }
//   });
// }
// // optimistic add to cart mutation (example)
// export const useAddToCart = (postCartItem: (item:any)=>Promise<any>) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: postCartItem,
//     onMutate: async (newItem) => {
//       await queryClient.cancelQueries({ queryKey: ["cart"] });
//       const previousCart = queryClient.getQueryData(["cart"]);
//       queryClient.setQueryData(["cart"], (old: any) => [...(old||[]), newItem]);
//       return { previousCart };
//     },
//     onError: (err, newItem, context: any) => {
//       queryClient.setQueryData(["cart"], context?.previousCart);
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"]});
//     }
//   });
// };
var products_1 = require('@/api/products');
var recommend_1 = require('@/api/recommend');
var react_query_1 = require('@tanstack/react-query');
/**
 * 1. 상품 목록 조회 (페이지네이션 + 검색어 캐싱 통합)
 */
var useProducts = function (page, searchQuery) {
  if (searchQuery === void 0) {
    searchQuery = '';
  }
  return (0, react_query_1.useQuery)({
    // 검색어가 다르면 다른 캐시를 사용하도록 queryKey에 추가
    queryKey: ['products', page, searchQuery],
    queryFn: function () {
      return (0, products_1.fetchProductsPage)(page, 12, searchQuery);
    },
    staleTime: 1000 * 60 * 5, // 5분간 신선도 유지
    gcTime: 1000 * 60 * 30, // (v5 명칭: cacheTime -> gcTime) 30분간 캐시 보관
    // 검색 중일 때는 이전 데이터를 유지하여 화면 깜빡임 방지
    placeholderData: function (previousData) {
      return previousData;
    },
  });
};
exports.useProducts = useProducts;
/**
 * 2. 하이브리드 추천 목록 조회
 */
function useRecommendations(productId, topN) {
  var _this = this;
  if (topN === void 0) {
    topN = 6;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ['recs', productId, topN],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var res;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!productId) return [2 /*return*/, []];
              return [
                4 /*yield*/,
                (0, recommend_1.fetchHybridRecommendations)(productId, topN),
              ];
            case 1:
              res = _b.sent();
              return [
                2 /*return*/,
                (_a = res.recommendations) !== null && _a !== void 0 ? _a : [],
              ];
          }
        });
      });
    },
    enabled: !!productId, // productId가 있을 때만 실행
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    // v5에서는 onSuccess가 제거되었으므로, 필요한 경우 useEffect나 select에서 처리하지만
    // 이미지 프리로딩이 꼭 필요하다면 아래와 같이 로직을 유지할 수 있습니다.
    select: function (items) {
      if (typeof window !== 'undefined') {
        items.forEach(function (i) {
          if (i === null || i === void 0 ? void 0 : i.image) {
            var img = new Image();
            img.src = i.image;
          }
        });
      }
      return items;
    },
  });
}
/**
 * 3. 장바구니 추가 (Optimistic Update 적용)
 */
var useAddToCart = function (postCartItem) {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: postCartItem,
    // 서버 응답 전 화면에 먼저 반영 (낙관적 업데이트)
    onMutate: function (newItem) {
      return __awaiter(void 0, void 0, void 0, function () {
        var previousCart;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                queryClient.cancelQueries({ queryKey: ['cart'] }),
              ];
            case 1:
              _a.sent();
              previousCart = queryClient.getQueryData(['cart']);
              queryClient.setQueryData(['cart'], function (old) {
                return __spreadArray(
                  __spreadArray([], old || [], true),
                  [newItem],
                  false,
                );
              });
              return [2 /*return*/, { previousCart: previousCart }];
          }
        });
      });
    },
    // 실패 시 이전 데이터로 롤백
    onError: function (err, newItem, context) {
      queryClient.setQueryData(
        ['cart'],
        context === null || context === void 0 ? void 0 : context.previousCart,
      );
      console.error('장바구니 추가 실패:', err);
    },
    // 성공/실패 여부와 상관없이 서버와 데이터 동기화
    onSettled: function () {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
exports.useAddToCart = useAddToCart;
