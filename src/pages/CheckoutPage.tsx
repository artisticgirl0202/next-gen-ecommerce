'use client';

import { sendAIFeedbackAPI } from '@/api/integration';
import { useCart } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Globe,
  Lock,
  MapPin,
  Minus, // 추가됨
  Plus,
  ScanLine,
  ShieldCheck,
  Smartphone,
  User,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-config';
// [✨ 병합 포인트 1] 커스텀 에러 메시지 컴포넌트
const ValidationAlert = ({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="mt-2 relative bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 flex items-start gap-3 backdrop-blur-sm">
            <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-0.5">
                Error :: 0x82
              </span>
              <span className="text-xs sm:text-sm text-rose-200/90 font-medium">
                {message}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// makeOrderId 함수는 이제 백엔드 ID를 쓰므로 필요 없어서 제거했습니다.

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty } = useCart();
  const { addOrder, getCurrentUser } = useUserStore();

  const userData = getCurrentUser();
  const profile = userData?.profile || {
    name: '',
    email: '',
    phone: '',
    addresses: [] as string[],
  };

  const [selectedIds, setSelectedIds] = useState<number[]>(
    items.map((i) => i.id),
  );

  // [✨ 병합 포인트 2] 에러 상태 관리
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const { selectedItems, subtotal, tax, total } = useMemo(() => {
    // 1. 선택된 아이템만 필터링
    const selected = items.filter((item) => selectedIds.includes(item.id));

    // 2. 소계 계산 (단가 * 수량)
    const sub = selected.reduce((acc, item) => acc + item.price * item.qty, 0);

    // 3. 세금 및 합계
    const t = sub * 0.1;
    const tot = sub + t;

    return {
      selectedItems: selected,
      subtotal: sub,
      tax: t,
      total: tot,
    };
  }, [items, selectedIds]);
  const [shippingErrors, setShippingErrors] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [shippingForm, setShippingForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    address:
      profile.addresses && profile.addresses.length > 0
        ? profile.addresses[0]
        : '',
  });

  const [isManualAddress, setIsManualAddress] = useState(
    !profile.addresses || profile.addresses.length === 0,
  );

  const handleUpdateQty = (
    e: React.MouseEvent,
    id: number,
    delta: number, // 현재 수량을 인자로 받을 필요가 없습니다.
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // 스토어의 updateQty는 (id, delta)를 받으므로 +1 또는 -1만 보냅니다.
    updateQty(id, delta);
  };
  // [✨ 병합 포인트 3] 입력 핸들러
  const handleShippingChange = (field: string, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
    if (value.trim()) {
      setShippingErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePaymentChange = (
    field: keyof typeof paymentForm,
    value: string,
  ) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'NEW_ADDRESS_ENTRY') {
      setIsManualAddress(true);
      setShippingForm((prev) => ({ ...prev, address: '' }));
    } else {
      handleShippingChange('address', val);
    }
  };

  // ✅ [수정됨] handleFinalPayment: 백엔드 연동 로직만 남김
  const handleFinalPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // Validation Check
    if (!shippingForm.name || !shippingForm.phone || !shippingForm.address) {
      setShippingErrors({
        name: !shippingForm.name ? 'Required' : '',
        phone: !shippingForm.phone ? 'Required' : '',
        address: !shippingForm.address ? 'Required' : '',
      });
      hasError = true;
    }

    if (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc) {
      setErrors({
        cardNumber: !paymentForm.cardNumber ? 'Required' : '',
        expiry: !paymentForm.expiry ? 'Required' : '',
        cvc: !paymentForm.cvc ? 'Required' : '',
      });
      hasError = true;
    }

    if (hasError) return;

    // 🚀 [백엔드 연동 시작]
    try {
      // 1. 백엔드에 보낼 데이터 준비
      const orderPayload = {
        userId: (userData as any)?.id || 1,
        items: selectedItems.map((item) => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
        })),
      };

      // 2. 백엔드로 주문 요청 (POST)
      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '주문 생성 실패');
      }

      // 3. 백엔드 응답 받기 (order_no 포함)
      const data = await response.json();
      console.log('✅ 주문 성공! Server Response:', data);

      // 4. 프론트엔드 상태 업데이트용
      const safeId = data.order_no || data.id || Math.floor(Date.now() / 1000);

      const newOrder = {
        id: safeId,
        items: selectedItems.map((item) => ({
          ...item,
          productId: item.id,
        })),
        subtotal,
        tax,
        total,
        shipping: shippingForm,
        date: new Date().toISOString(),
        status: 'Processing' as const,
        paymentMethod: 'credit_card',
      };

      // 5. 로컬 스토어 업데이트
      addOrder(newOrder);
      selectedIds.forEach((id) => removeItem(id));

      // 6. AI 피드백 전송
      try {
        await Promise.all(
          selectedItems.map((item) =>
            sendAIFeedbackAPI({
              userId: (userData as any)?.id || 1,
              productId: item.id,
              action: 'purchase',
              orderId: safeId,
            }),
          ),
        );
      } catch (err) {
        console.error('[Checkout] AI Feedback Warning:', err);
      }

      // 7. 성공 페이지 이동
      navigate('/payment-success', { state: newOrder });
    } catch (error) {
      console.error('❌ 주문 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  // ⛔️ 기존의 중복된 코드(makeOrderId 호출, navigate 중복 등)는 여기서 모두 제거했습니다.

  // --- 공통 스타일 정의 ---
  const inputGroupClass = 'relative group';
  const labelClass =
    'text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase mb-2 block font-bold pl-1';
  const sectionHeaderClass =
    'text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3';

  const paymentIconClass =
    'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors z-10';

  const baseInputClass =
    'w-full bg-slate-900/50 border rounded-2xl py-4 pl-12 pr-4 text-sm sm:text-base text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300';

  // [✨ 병합 포인트 5] 에러 발생 시 스타일 변경
  const getInputClass = (hasError: boolean) => `
    w-full bg-transparent border rounded-lg px-4 py-3 pl-10 text-sm outline-none transition-all duration-300 font-mono
    ${
      hasError
        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-900/5 text-rose-100 placeholder-rose-400/50'
        : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-200 placeholder-slate-600'
    }
  `;

  const getIconClass = (hasError: boolean) => `
    absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
    ${hasError ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-blue-400'}
  `;

  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 flex flex-col">
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 w-full flex-1">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          {/* Header 부분 생략 (기존 동일) */}
          <div className="flex items-start gap-4 sm:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/10 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Secure
                  Gateway // TLS 1.3
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Finalize Transaction
              </h1>
            </div>
          </div>
        </header>

        {/* [✨ 병합 포인트 6] form 태그 */}
        <form
          onSubmit={handleFinalPayment}
          noValidate
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Identity & Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group hover:border-cyan-500/20 transition-all"
            >
              <h2 className={sectionHeaderClass}>
                <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                Shipping Protocol
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                {/* 1. Recipient Name */}
                <div className="col-span-1 sm:col-span-2 group">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Recipient ID
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className={getIconClass(!!shippingErrors.name)}
                    />
                    <input
                      required
                      type="text"
                      placeholder="FULL NAME"
                      value={shippingForm.name}
                      onChange={(e) =>
                        handleShippingChange('name', e.target.value)
                      }
                      className={getInputClass(!!shippingErrors.name)}
                    />
                  </div>
                  {/* [✨ 병합 포인트 7] */}
                  <ValidationAlert
                    visible={!!shippingErrors.name}
                    message={shippingErrors.name}
                  />
                </div>

                {/* 2. Comms Channel (Phone) */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Comms Channel
                  </label>
                  <div className="relative">
                    <Smartphone
                      size={16}
                      className={getIconClass(!!shippingErrors.phone)}
                    />
                    <input
                      required
                      type="tel"
                      placeholder="MOBILE NUMBER"
                      value={shippingForm.phone}
                      onChange={(e) =>
                        handleShippingChange('phone', e.target.value)
                      }
                      className={getInputClass(!!shippingErrors.phone)}
                    />
                  </div>
                  <ValidationAlert
                    visible={!!shippingErrors.phone}
                    message={shippingErrors.phone}
                  />
                </div>

                {/* 3. Target Sector (Address) */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1 flex justify-between">
                    <span>Target Sector</span>
                    {isManualAddress && profile.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualAddress(false);
                          handleShippingChange('address', profile.addresses[0]);
                        }}
                        className="text-cyan-500 hover:text-cyan-400 text-[9px] cursor-pointer"
                      >
                        SELECT SAVED
                      </button>
                    )}
                  </label>

                  <div className="relative">
                    <MapPin
                      size={16}
                      className={getIconClass(!!shippingErrors.address)}
                    />
                    {isManualAddress ? (
                      <input
                        required
                        type="text"
                        placeholder="ENTER DELIVERY ADDRESS"
                        value={shippingForm.address}
                        onChange={(e) =>
                          handleShippingChange('address', e.target.value)
                        }
                        className={getInputClass(!!shippingErrors.address)}
                        autoFocus
                      />
                    ) : (
                      <select
                        value={shippingForm.address}
                        onChange={handleAddressSelect}
                        className={`${getInputClass(!!shippingErrors.address)} appearance-none cursor-pointer`}
                      >
                        {profile.addresses.map((addr) => (
                          <option
                            key={addr}
                            value={addr}
                            className="bg-slate-900 text-slate-300"
                          >
                            {addr}
                          </option>
                        ))}
                        <option
                          value="NEW_ADDRESS_ENTRY"
                          className="bg-slate-900 text-cyan-400 font-bold"
                        >
                          + ENTER NEW ADDRESS...
                        </option>
                      </select>
                    )}
                  </div>
                  <ValidationAlert
                    visible={!!shippingErrors.address}
                    message={shippingErrors.address}
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 2: Payment Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden hover:border-blue-500/20 transition-all shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-20 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

              <h2 className={sectionHeaderClass}>
                <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
                Credit Interface
              </h2>

              <div className="space-y-6 relative z-10">
                {/* Card Number */}
                <div>
                  <label className={labelClass}>Card Sequence</label>
                  <div className={inputGroupClass}>
                    <CreditCard
                      size={16}
                      className={`${paymentIconClass} ${errors.cardNumber ? 'text-rose-500' : 'group-focus-within:text-blue-400'}`}
                    />
                    <input
                      required
                      placeholder="0000 0000 0000 0000"
                      value={paymentForm.cardNumber}
                      onChange={(e) =>
                        handlePaymentChange('cardNumber', e.target.value)
                      }
                      className={`${baseInputClass} ${
                        errors.cardNumber
                          ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-900/5'
                          : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  <ValidationAlert
                    visible={!!errors.cardNumber}
                    message={errors.cardNumber}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Validity */}
                  <div>
                    <label className={labelClass}>Validity</label>
                    <div className={inputGroupClass}>
                      <Globe
                        size={16}
                        className={`${paymentIconClass} ${errors.expiry ? 'text-rose-500' : 'group-focus-within:text-blue-400'}`}
                      />
                      <input
                        required
                        placeholder="MM / YY"
                        value={paymentForm.expiry}
                        onChange={(e) =>
                          handlePaymentChange('expiry', e.target.value)
                        }
                        className={`${baseInputClass} ${
                          errors.expiry
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-900/5'
                            : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    <ValidationAlert
                      visible={!!errors.expiry}
                      message={errors.expiry}
                    />
                  </div>

                  {/* CVC */}
                  <div>
                    <label className={labelClass}>Security Code</label>
                    <div className={inputGroupClass}>
                      <Lock
                        size={16}
                        className={`${paymentIconClass} ${errors.cvc ? 'text-rose-500' : 'group-focus-within:text-blue-400'}`}
                      />
                      <input
                        required
                        placeholder="CVC"
                        type="password"
                        value={paymentForm.cvc}
                        onChange={(e) =>
                          handlePaymentChange('cvc', e.target.value)
                        }
                        className={`${baseInputClass} ${
                          errors.cvc
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-900/5'
                            : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    <ValidationAlert
                      visible={!!errors.cvc}
                      message={errors.cvc}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Order Review */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-8 bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(6,182,212,0.05)]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
              <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-white">
                <ScanLine className="text-cyan-500 animate-pulse" /> Manifest
                Review
              </h2>

              <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedIds((prev) =>
                          isSelected
                            ? prev.filter((i) => i !== item.id)
                            : [...prev, item.id],
                        )
                      }
                      className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-white/[0.02] border-white/5 opacity-50'
                      }`}
                    >
                      {/* 체크박스 영역 */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-black" />
                        )}
                      </div>

                      {/* 상품 이미지 */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-bold uppercase truncate ${
                            isSelected ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {item.name}
                        </div>

                        {/* 수량 조절기 (중요: e.stopPropagation 적용) */}
                        {/* 수량 조절기 (이미지 디자인 적용) */}
                        <div className="flex items-center mt-2">
                          <div
                            className="flex items-center justify-between w-28 h-9 bg-slate-950 border border-white/10 rounded-xl px-2"
                            onClick={(e) => e.stopPropagation()} // 컨트롤러 영역 클릭 시 부모 이벤트 차단
                          >
                            {/* 마이너스 버튼 */}

                            <motion.button
                              type="button"
                              onClick={(e) => handleUpdateQty(e, item.id, -1)} // 직접 -1 전달
                              className="..."
                            >
                              <Minus size={14} />
                            </motion.button>

                            {/* 수량 텍스트 */}
                            <span className="text-sm font-bold text-white min-w-[24px] text-center select-none font-mono">
                              {item.qty}
                            </span>

                            {/* 플러스 버튼 */}
                            <motion.button
                              type="button"
                              onClick={(e) => handleUpdateQty(e, item.id, 1)} // 직접 1 전달
                              className="..."
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* 가격 정보 */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-500 font-mono">
                          x{item.qty}
                        </div>
                        <div className="text-xs font-black font-mono text-cyan-400">
                          ${(item.price * item.qty).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-dashed border-white/10 mb-8 font-mono text-sm">
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-widest">
                    Process Tax (10%)
                  </span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="py-4 mt-2 border-t border-white/10 flex justify-between items-end">
                  <span className="text-white font-bold text-xs uppercase tracking-[0.2em]">
                    Total Output
                  </span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto sm:min-w-[280px] group relative flex items-center justify-center overflow-hidden rounded-full p-[1px] mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                <div className="relative w-full h-full bg-slate-950 group-hover:bg-cyan-950/30 transition-colors duration-300 rounded-full py-4 px-10 flex items-center justify-center gap-3">
                  <Lock size={18} className="text-cyan-500 shrink-0" />
                  <span className="font-black uppercase tracking-[0.2em] text-white text-xs">
                    Confirm Order
                  </span>
                  <Zap size={18} className="text-blue-500 shrink-0" />
                </div>
              </motion.button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
