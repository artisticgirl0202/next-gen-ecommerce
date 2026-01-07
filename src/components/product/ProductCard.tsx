


// import type { Product } from "@/types";
// import { Star } from "lucide-react";

// type Props = {
//   product: Product;
//   onOpen?: (p: Product) => void;
// };

// export default function ProductCard({ product, onOpen }: Props) {
//   const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

//   return (
//     <article
//       role="button"
//       tabIndex={0}
//       onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(product); }}
//       className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
//     >
//       <div className="relative aspect-[4/5] bg-slate-800 overflow-hidden">
//         <img
//           src={product.image}
//           alt={product.name}
//           loading="lazy"
//           decoding="async"
//           className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${isSvg ? 'object-contain p-4 bg-[#061018]' : 'object-cover'}`}
//         />
//         <div className="absolute left-3 top-3 bg-black/40 backdrop-blur rounded-full px-3 py-1 text-xs text-white border border-white/5">
//           {product.categories?.[0] ?? product.brand}
//         </div>

//         {/* 모바일/태블릿: 상단 우측에 작은 액세스(정보) 버튼 배치 */}
//         <button
//           onClick={(e) => { e.stopPropagation(); onOpen?.(product); }}
//           className="absolute right-3 top-3 sm:top-3 sm:right-3 bg-white/5 hover:bg-cyan-500 text-white rounded-full p-2"
//           aria-label="Open product details"
//         >
//           {/* simple SVG icon (info) */}
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
//             <circle cx="12" cy="12" r="10"></circle>
//             <line x1="12" y1="16" x2="12" y2="12"></line>
//             <line x1="12" y1="8" x2="12.01" y2="8"></line>
//           </svg>
//         </button>
//       </div>

//       <div className="p-4 sm:p-5">
//         <h3 className="text-sm sm:text-base font-semibold text-white truncate">{product.name}</h3>
//         <p className="text-xs text-slate-400 mt-1 truncate">{product.brand}</p>

//         <div className="mt-3 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-base font-bold text-white">${product.price}</span>
//           </div>
//           <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
//             <Star size={14} fill="currentColor" />
//             <span>{product.rating ?? "—"}</span>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }


import type { Product } from "@/types";
import { Star } from "lucide-react";

type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

type Props = {
  product: Recommendation;
  onOpen?: (p: Product) => void;
};

export default function ProductCard({ product, onOpen }: Props) {
  const isSvg = typeof product.image === "string" && product.image.toLowerCase().endsWith(".svg");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(product)} // 카드 전체 클릭 시 모달 오픈
      onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(product); }}
      className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative aspect-[4/5] bg-slate-800 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${isSvg ? 'object-contain p-4 bg-[#061018]' : 'object-cover'}`}
        />
        <div className="absolute left-3 top-3 bg-black/40 backdrop-blur rounded-full px-3 py-1 text-[10px] font-bold text-white border border-white/5 uppercase tracking-wider">
          {product.categories?.[0] ?? product.brand}
        </div>

        {/* AI Insight Tag: My Page에서만 주로 보임 */}
        {product.why && (
          <div className="absolute bottom-0 left-0 right-0 bg-cyan-600/90 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <p className="text-[10px] text-white font-black text-center uppercase tracking-tighter">
               AI: {product.why}
             </p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-white truncate uppercase italic">{product.name}</h3>
        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase">{product.brand}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-black text-cyan-400">${product.price.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            <span>{product.rating ?? "4.8"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
