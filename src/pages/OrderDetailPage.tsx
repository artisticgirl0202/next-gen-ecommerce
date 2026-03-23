'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  CreditCard,
  Database,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useNavigate, useParams } from 'react-router-dom';

// API & Data
import { fetchHybridRecommendations } from '@/api/recommend';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailModal from '@/components/product/ProductDetailModal';

import { getProductById } from '@/data/products_indexed';
import { API_BASE_URL } from '@/lib/api-config';
import type { Recommendation } from '@/types/recommendation';

// --- Types ---
interface OrderItemView {
  id: number;
  title: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
}

interface OrderDetail {
  id: string;
  orderNo?: string;
  date?: string;
  status?: string;
  items?: OrderItemView[];
  subtotal?: number;
  total?: number;
  shippingAddress?: string;
  paymentMethod?: string;
}
// --- Constants & Mock Data ---
const demoProductsRaw = [
  {
    id: 101,
    name: 'Demo Product A',
    price: 150,
    image: 'https://placehold.co/400',
  },
  {
    id: 102,
    name: 'Demo Product B',
    price: 200,
    image: 'https://placehold.co/400',
  },
  {
    id: 103,
    name: 'Demo Product C',
    price: 90,
    image: 'https://placehold.co/400',
  },
];
const CATEGORY_PRODUCTS: any[] = []; // 필요 시 실제 데이터로 채움
const TAX_RATE = 0.1;

// --- Helper Functions ---

// 1. 데모 주문 생성 헬퍼
const createDemoOrder = (id: string): OrderDetail => {
  const rawData = Array.isArray(demoProductsRaw) ? demoProductsRaw : [];

  const sourceItems =
    rawData.length > 0
      ? rawData.slice(0, 2)
      : [
          {
            id: 101,
            name: 'Demo Product A',
            price: 150,
            category: 'Electronics',
            image: '',
          },
          {
            id: 102,
            name: 'Demo Product B',
            price: 200,
            category: 'Apparel',
            image: '',
          },
        ];

  const demoItems = sourceItems.map((p: any) => ({
    id: Number(p.id || 999),
    title: p.name || p.title || 'Demo Item',
    price: Number(p.price || 100),
    qty: 1,
    image: p.image || '',
    category: p.category || 'General',
  }));

  return {
    id: id,
    orderNo: `DEMO-${id.split('-')[1] || '1234'}`,
    date: new Date().toLocaleString(),
    status: 'Processing',
    items: demoItems,
    subtotal: demoItems.reduce(
      (acc: number, cur: any) => acc + (cur.price ?? 0),
      0,
    ),
    total: demoItems.reduce((acc, cur) => acc + cur.price, 0) * 1.1,
    shippingAddress: 'Demo Address, Seoul, KR',
    paymentMethod: 'Test Card',
  };
};

// 2. 상품 메타데이터 조회
function lookupProductMeta(productId: number) {
  const idNum = Number(productId);
  if (!Number.isFinite(idNum)) return null;

  try {
    const idx = getProductById(idNum);
    if (idx) return idx;
  } catch (_e) {
    // product not found in indexed store — fall through to CATEGORY_PRODUCTS
  }

  return CATEGORY_PRODUCTS.find((p) => Number(p.id) === idNum) || null;
}

// 3. 주문 아이템 정보 보강
function enrichItem(it: any): OrderItemView {
  const pid = Number(it?.productId ?? it?.product_id ?? it?.id) || 0;
  const meta = pid ? lookupProductMeta(pid) : null;
  const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1;
  const price = Number(it?.price ?? meta?.price ?? 0) || 0;

  return {
    id: pid,
    title: meta?.name || it?.title || it?.name || `Product #${pid}`,
    price: price,
    qty: qty,
    image:
      meta?.image ||
      it?.image ||
      it?.imageUrl ||
      it?.img ||
      it?.thumbnail ||
      '',
    category: meta?.category || it?.category,
  };
}

// 4. 추천 사유 번역
const getTranslatedReason = (text: string) => {
  if (!text) return '';
  if (!/[^\x20-\x7E\s]/.test(text)) return text;

  if (text.includes('콘텐츠')) return 'Content pattern match';
  if (text.includes('유사')) return 'Based on similarity';
  if (text.includes('대체')) return 'Alternative recommendation';
  if (text.includes('기본')) return 'Basic recommendation';
  if (text.includes('인기')) return 'Popular choice';
  if (text.includes('카테고리')) return 'Category match';

  return 'AI Suggested';
};

// --- Main Component ---
export default function OrderDetailPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const idStr = orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'STORE' | 'API' | null>(null);

  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const formatCurrency = (v: number | undefined) =>
    v !== undefined && v !== null ? v.toLocaleString() : '0';

  // API 호출 함수
  const fetchOrderFromApi = async (id: string) => {
    try {
      setLoading(true);

      // ✅ 해결책: "ORD-RRL2070"에서 숫자만 추출하여 "2070"으로 만듭니다.
      const numericId = id.replace(/[^0-9]/g, '');

      // 수정된 numericId를 사용하여 호출
      const res = await fetch(`${API_BASE_URL}/api/orders/${numericId}`);

      if (!res.ok) throw new Error('주문을 불러올 수 없습니다.');

      const apiData = await res.json();

      const normalizedItems = apiData.items?.map((item: any) =>
        enrichItem(item),
      );

      setOrder({
        ...apiData,
        subtotal: apiData.totalAmount || apiData.subtotal || 0,
        total: (apiData.totalAmount || apiData.total || 0) * 1.1,
        items: normalizedItems,
      });

      setDataSource('API');
    } catch (err: any) {
      console.error('API 호출 실패:', err);
      // 실패 시 데모 데이터 로드
      const demo = createDemoOrder(id);
      setOrder(demo);
      setDataSource('STORE');
    } finally {
      setLoading(false);
    }
  };

  // Effect 1: 초기 진입 및 ID 변경 시 로직
  useEffect(() => {
    if (idStr) {
      fetchOrderFromApi(idStr);
    } else {
      setLoading(false);
      setError('Invalid Order ID');
    }
  }, [idStr]);

  // Effect 2: 주문(order) 로드 완료 시 추천 상품 로드
  useEffect(() => {
    if (!order?.items?.[0]) return;

    const seedId = Number(order.items[0].id);
    if (!Number.isFinite(seedId)) return;

    const loadRecs = async () => {
      setRecsLoading(true);
      try {
        const resp: any = await fetchHybridRecommendations(seedId, 4);

        const list: any[] =
          resp?.recommendations ??
          resp?.data ??
          (Array.isArray(resp) ? resp : []);

        if (!list || list.length === 0) {
          setRecs([]);
        }

        const normalized: Recommendation[] = list
          .map((it: any): Recommendation | null => {
            if (!it) return null;

            if (it.id && (it.name || it.title)) {
              return {
                id: it.id,
                name: it.name ?? it.title,
                title: it.title ?? it.name,
                price: Number(it.price ?? 0),
                image: it.image ?? '',
                why: getTranslatedReason(it.why) || 'AI Suggested',
                confidence: it.confidence || 0,
              } as Recommendation;
            }

            if (typeof it === 'number' || typeof it === 'string') {
              const meta = getProductById(Number(it));
              if (!meta) return null;
              return {
                ...meta,
                why: 'ID recall',
                confidence: 0.2,
              } as Recommendation;
            }

            return null;
          })
          .filter((item): item is Recommendation => item !== null);

        setRecs(normalized);
      } catch (e) {
        console.warn('Failed to load recommendations (using fallback)', e);
        const fallbackList = (demoProductsRaw as any[]).slice(0, 4);
        const fallbackRecs = fallbackList.map((it) => ({
          ...it,
          title: it.name,
          why: 'Demo Fallback',
          confidence: 0,
        }));
        setRecs(fallbackRecs as any);
      } finally {
        setRecsLoading(false);
      }
    };

    loadRecs();
  }, [order]);

  const scrollRecs = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.6;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // --- Render Steps (Early Returns) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="p-10 text-center text-cyan-400 animate-pulse">
          Loading Order Details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="p-10 text-center text-red-400">
          {error || 'Order Not Found'}
          <button
            onClick={() => navigate(-1)}
            className="block mt-4 text-sm text-slate-500 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors w-fit"
          >
            <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all shadow-lg">
              <ArrowLeft size={20} />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0"></span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded-full bg-cyan-950/20">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            System_Ready
          </div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full py-10 relative z-10 space-y-12"
        >
          {/* --- Header Section --- */}
          <motion.header
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="w-full relative bg-slate-900/30 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 rounded-[1.5rem] overflow-hidden mb-10 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.3)]"
          >
            {/* 배경 스캔 라인 (더 투명하게) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(6,182,212,0.01)_60%)] bg-[size:100%_3px] pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 relative z-10 items-center md:items-start">
              {/* 1. Visual Anchor: 축소된 주문 코어 */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 relative flex items-center justify-center">
                  {/* 회전하는 링 (더 얇고 어둡게) */}
                  <div className="absolute inset-1 rounded-full border border-cyan-900/30 border-t-cyan-700/50 animate-[spin_12s_linear_infinite]" />
                  <div className="absolute inset-3 rounded-full border border-slate-800 border-b-slate-600/30 animate-[spin_8s_linear_infinite_reverse]" />

                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-cyan-800/50 bg-slate-950 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] flex items-center justify-center">
                    <Package
                      size={32}
                      className="text-cyan-600/80 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]"
                      strokeWidth={1.5}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/80 via-transparent to-transparent mix-blend-overlay" />
                  </div>
                </div>
              </div>

              {/* 2. 텍스트 정보 (크기 축소 및 정제) */}
              <div className="flex-1 w-full text-center md:text-left space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 opacity-70">
                      <span className="w-1 h-1 rounded-full bg-cyan-600" />
                      <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        Order Identification
                      </span>
                    </div>
                    {/* 폰트 크기 축소: text-6xl -> text-4xl */}
                    <h1 className="w-full text-center text-3xl sm:text-5xl font-black text-white italic tracking-tighter leading-none drop-shadow-lg ">
                      ORDER{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-slate-500 pr-4">
                        #{order.id}
                      </span>
                    </h1>
                  </div>

                  {/* 상태 표시 (더 차분하게) */}
                  <div className="bg-slate-950/80 border border-white/5 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-inner">
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-1 text-center md:text-right">
                      Current Status
                    </div>
                    <div
                      className={`flex items-center gap-2 text-lg font-black uppercase italic tracking-tight ${
                        order.status === 'Delivered'
                          ? 'text-emerald-500/90'
                          : 'text-cyan-500/90'
                      }`}
                    >
                      {order.status === 'Delivered' ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Truck
                          size={20}
                          className={
                            order.status !== 'Delivered' ? 'animate-pulse' : ''
                          }
                        />
                      )}
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* 3. 정보 그리드 (더 어둡고 슬림하게) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl border border-white/[0.03] relative overflow-hidden group">
                  <div className="absolute top-0 -left-[100%] w-[200%] h-full bg-gradient-to-r from-transparent via-cyan-900/5 to-transparent group-hover:animate-[shimmer_3s_infinite] pointer-events-none" />

                  <div className="flex flex-col items-center md:items-start p-1">
                    <span className="text-[9px] uppercase text-slate-500 tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <Database size={10} /> Data Source
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                        dataSource === 'STORE'
                          ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500'
                          : 'bg-cyan-950/30 border-cyan-900/50 text-cyan-500'
                      }`}
                    >
                      {dataSource === 'STORE'
                        ? '● Local_Cache'
                        : '● Uplink_API'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center md:items-start p-1 border-t sm:border-t-0 sm:border-l border-white/5">
                    <span className="text-[9px] uppercase text-slate-500 tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <Calendar size={10} /> Timestamp
                    </span>
                    <div className="text-xs text-slate-300 font-mono tracking-wider">
                      {order.date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-6">
          {/* Left Column: Items */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              {/* 왼쪽 영역: 아이콘 + 제목 */}
              <div className="flex items-center gap-3">
                {/* 아이콘 박스 스타일 적용 */}
                <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                  <Package className="text-cyan-400" size={20} />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                  Manifest
                </h2>
              </div>

              {/* 오른쪽 영역: 태그 스타일 적용 (기존 // Items를 이곳으로 이동) */}
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block bg-slate-900 px-3 py-1 border border-white/5 rounded">
                // Items_List
              </span>
            </div>

            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div
                  key={`order-item-${item.id}-${idx}`}
                  className="group relative bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 hover:border-cyan-500/30 hover:bg-slate-800/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] w-full flex flex-col sm:flex-row p-4 sm:p-6 gap-6 items-stretch sm:items-center overflow-hidden"
                >
                  {/* 왼쪽 장식 바: MyPage의 아이템 리스트 스타일 계승 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-800 to-transparent group-hover:from-cyan-500 transition-colors duration-300" />

                  {/* 상품 이미지 섹션 */}
                  <div className="w-full sm:w-32 aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-white/5 relative shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700 text-[10px] font-mono">
                        NO_IMG_DATA
                      </div>
                    )}
                    {/* 이미지 위 오버레이 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1 z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        {/* Ref_ID 장식 요소 추가 */}
                        <div className="flex flex-col mb-2">
                          <span className="text-[9px] text-cyan-600 font-mono uppercase tracking-[0.2em] leading-none">
                            Unit_Serial
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono group-hover:text-cyan-400 transition-colors">
                            #{item.id}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1 transition-transform duration-300">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                          Category //{' '}
                          <span className="text-slate-400">
                            {item.category || 'General'}
                          </span>
                        </p>
                      </div>

                      {/* 수량 표시 디자인 업그레이드 */}
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-600 font-mono uppercase">
                            Quantity
                          </span>
                          <span className="text-sm font-black text-cyan-500 font-mono">
                            {item.qty.toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-6 sm:mt-4">
                      {/* 하단 장식 요소 */}
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                          Scan_Ready
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-black">
                          Net_Value
                        </span>
                        <div className="text-2xl font-black text-white italic tracking-tighter">
                          <span className="text-sm font-light text-cyan-500 mr-1">
                            $
                          </span>
                          {formatCurrency(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 버튼 하단 스캔 효과를 아이템 카드 전체에 응용 */}
                  <div className="absolute bottom-0 inset-x-0 h-[1px] bg-cyan-400/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Transaction Info */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-6 pt-11"
          >
            <div className="border border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-b-3xl rounded-tr-3xl relative overflow-hidden flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.05)] ">
              {/* 배경 장식: 보안 실드 아이콘 배경 */}
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <ShieldCheck
                  size={120}
                  className="text-cyan-500"
                  strokeWidth={0.5}
                />
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-center gap-2 mb-6 text-cyan-500">
                  <div className="w-2 h-2 bg-cyan-500 rounded-sm" />
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                    Payment Summary
                  </h3>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  {/* 데이터 상태 배지 */}
                  <div className="flex justify-between items-end border-b border-dashed border-white/10 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      Transaction Status
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      VERIFIED
                    </span>
                  </div>

                  {/* 결제 금액 리스트 */}
                  <div className="space-y-3 py-2">
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span className="tracking-widest">SUBTOTAL</span>
                      <span className="text-white">
                        ${formatCurrency(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span className="tracking-widest">TAX ESTIMATE</span>
                      <span className="text-white">
                        ${formatCurrency((order.subtotal || 0) * TAX_RATE)}
                      </span>
                    </div>
                  </div>

                  {/* 총 합계 박스 (강조 디자인) */}
                  <div className="p-5 bg-gradient-to-b from-cyan-950/30 to-slate-950/50 border-l-2 border-cyan-500/40 relative">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">
                        Total Charged
                      </span>
                      <span className="text-3xl font-black text-white italic tracking-tighter">
                        ${formatCurrency(order.total)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 p-1">
                      <span className="text-[8px] text-cyan-700">
                        AUTH-TRX-77
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결제 수단 정보 */}
              <div className="mb-8 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                <CreditCard className="text-cyan-400" size={16} />
                <span className="text-xs text-cyan-100 font-mono tracking-widest uppercase">
                  {order.paymentMethod}
                </span>
              </div>

              {/* 기존 버튼 디자인 유지 + 사선 커팅 스타일 적용 */}
              <div className="mt-auto">
                <button
                  className="
        relative group/btn overflow-hidden z-10
        w-full px-6 py-4 flex items-center justify-center
        bg-gradient-to-r from-cyan-950/40 to-cyan-900/20
        border border-cyan-500/20
        hover:border-cyan-400/50 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]
        transition-all duration-300 ease-out cursor-pointer active:scale-95
        [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]
      "
                >
                  <span className="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400 group-hover/btn:text-cyan-100 transition-colors duration-300 pt-0.5">
                    TRANSACTION_DETAILS
                  </span>

                  {/* 버튼 내 광원 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 blur-[2px] transition-opacity duration-300" />
                </button>
              </div>
            </div>

            <div className="border border-white/5 rounded-3xl p-6 sm:p-8 relative bg-white/[0.02]">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} /> Destination
              </h3>
              <p className="text-white font-medium leading-relaxed">
                {order.shippingAddress}
              </p>

              <div className="mt-6">
                <button
                  className="
relative group/btn overflow-hidden rounded-xl z-10
w-full sm:w-auto px-6 py-3 flex items-center justify-center
bg-gradient-to-r from-cyan-950/40 to-cyan-900/20
border border-cyan-500/20
hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-cyan-400/20
hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]
transition-all duration-300 ease-out cursor-pointer active:scale-95
"
                >
                  <span
                    className="
relative z-10 flex items-center gap-2
text-xs font-black uppercase tracking-[0.2em] 
text-cyan-400 group-hover/btn:text-cyan-100 
transition-colors duration-300 pt-0.5
"
                  >
                    LIVE_TELEMETRY
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-100 blur-[2px] transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="pt-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 tracking-tight text-white">
                <Sparkles
                  className="text-cyan-400"
                  fill="currentColor"
                  size={20}
                />{' '}
                Neural Recommendations
              </h2>
              <div className="self-start sm:self-auto px-3 py-1 flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-950/10">
                <Activity
                  size={12}
                  className="animate-pulse text-emerald-500"
                />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  System Optimized
                </span>
              </div>
            </div>

            <div className="flex gap-4 self-end sm:self-auto">
              <button
                onClick={() => scrollRecs('left')}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scrollRecs('right')}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300"
                aria-label="Scroll Right"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden p-4 sm:p-6 snap-x scroll-smooth no-scrollbar"
          >
            {recsLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="min-w-[220px] sm:min-w-[260px] aspect-[3/4] bg-white/5 rounded-[1.25rem] animate-pulse border border-white/5 snap-center"
                  />
                ))
              : recs.map((product, idx) => (
                  <div
                    key={`rec-${product.id || 'no-id'}-${idx}`}
                    className="group min-w-[220px] sm:min-w-[260px] snap-center h-full flex flex-col gap-3"
                  >
                    <ProductCard
                      product={product}
                      onOpen={() => setSelectedProduct(product)}
                    />
                    {product.why && (
                      <div className="sm:hidden relative pl-4 pr-2 py-1 ml-2 mt-[-8px]">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent group-hover:from-cyan-400 group-hover:via-cyan-400/30 transition-colors duration-300" />
                        <div className="absolute left-[-2px] top-0 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform duration-300" />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight
                              size={12}
                              className="text-cyan-600 group-hover:text-cyan-400 transition-colors duration-300"
                            />
                            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors duration-300">
                              Analysis_Log
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 leading-tight group-hover:text-cyan-100/90 transition-colors duration-300">
                            <span className="text-cyan-600/50 mr-1 group-hover:text-cyan-400 transition-colors">
                              &gt;&gt;
                            </span>
                            {product.why}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </motion.section>

        {selectedProduct &&
          createPortal(
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />,
            document.body,
          )}
      </div>
    </div>
  );
}
