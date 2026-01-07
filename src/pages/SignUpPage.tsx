// import { motion } from "framer-motion";
// import { CheckCircle2, CircuitBoard, UserPlus } from "lucide-react";
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function SignupPage() {
//   const navigate = useNavigate();
//   const [isSuccess, setIsSuccess] = useState(false);

//   // 회원가입 처리 시뮬레이션
//   const handleSignup = (e: React.FormEvent) => {
//     e.preventDefault();
//     // 실제 API 호출 로직이 들어갈 곳
//     setTimeout(() => {
//         setIsSuccess(true); // 성공 상태로 변경
//     }, 800);
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
//        {/* 배경 효과 */}
//        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
//        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

//       {/* 로고 (홈으로 이동) */}
//       <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group z-50">
//         <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:shadow-[0_0_20px_rgba(6,182,212,1)] transition-all" />
//             <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">
//                 NEXTGEN
//             </span>
//         </div>
//       </Link>

//       <motion.div
//         layout
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="w-full max-w-lg"
//       >
//         <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
//             {/* 노이즈 텍스처 오버레이 */}
//             <div className="absolute inset-0 opacity-5 pointer-events-none bg-repeat url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')" />

//             <div className="p-8 md:p-12 relative z-10">
//                 {!isSuccess ? (
//                     /* --- 1. 회원가입 입력 폼 --- */
//                     <motion.form
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         onSubmit={handleSignup}
//                         className="space-y-6"
//                     >
//                         <div className="mb-8">
//                             <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-3">
//                                 <UserPlus className="text-cyan-500" /> Initialize
//                             </h2>
//                             <p className="text-slate-400 text-xs md:text-sm tracking-wide">
//                                 Create your Neural Profile to access the algorithm.
//                             </p>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                              <div className="space-y-1">
//                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Designation (Name)</label>
//                                 <input required type="text" placeholder="FULL NAME" className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm" />
//                              </div>
//                              <div className="space-y-1">
//                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact (Phone)</label>
//                                 <input type="tel" placeholder="MOBILE NO." className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm" />
//                              </div>
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Neural Link (Email)</label>
//                             <input required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono" />
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Code (Password)</label>
//                             <input required type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono" />
//                         </div>

//                         <div className="pt-4">
//                             <button type="submit" className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2 group">
//                                 Register ID
//                             </button>
//                         </div>

//                         <div className="text-center mt-6">
//                             <Link to="/login" className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
//                                 Already have an account? <span className="text-cyan-500 underline decoration-cyan-500/30 underline-offset-4">Authorize Here</span>
//                             </Link>
//                         </div>
//                     </motion.form>
//                 ) : (
//                     /* --- 2. 회원가입 성공 화면 (쇼핑하러 가기) --- */
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="flex flex-col items-center text-center py-8"
//                     >
//                         <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
//                             <CheckCircle2 size={40} className="text-green-400" />
//                         </div>

//                         <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
//                             System Access <br/> <span className="text-green-400">Granted</span>
//                         </h2>

//                         <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
//                             Your Neural ID has been successfully registered. The recommendation algorithm is now active.
//                         </p>

//                         <div className="w-full space-y-3">
//                              {/* ✅ 쇼핑하러 가기 버튼 -> 홈으로 이동 */}
//                             <button
//                                 onClick={() => navigate("/")}
//                                 className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 group"
//                             >
//                                 <CircuitBoard className="w-5 h-5" />
//                                 Initialize Shopping
//                             </button>
//                         </div>
//                     </motion.div>
//                 )}
//             </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, CircuitBoard, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ 입력값 State 관리
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // ✅ 에러 메시지 State 관리
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({
    name: null,
    phone: null,
    email: null,
    password: null,
  });

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 사용자가 입력하면 해당 필드의 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ✅ 회원가입 처리 및 유효성 검사
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string | null } = {};
    let hasError = false;

    // 1. 이름 검사
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full designation (Name).";
      hasError = true;
    }

    // 2. 전화번호 검사
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact number is required.";
      hasError = true;
    }

    // 3. 이메일 검사
    if (!formData.email.includes("@")) {
      newErrors.email = `Please include an '@' in the email address. '${formData.email}' is missing an '@'.`;
      hasError = true;
    }

    // 4. 비밀번호 검사
    if (!formData.password) {
      newErrors.password = "Access Code (Password) is required.";
      hasError = true;
    } else if (formData.password.length < 4) {
      newErrors.password = "Access Code must be at least 4 characters.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    // 실제 API 호출 로직 시뮬레이션
    setTimeout(() => {
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* 로고 */}
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:shadow-[0_0_20px_rgba(6,182,212,1)] transition-all" />
          <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">
            NEXTGEN
          </span>
        </div>
      </Link>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-visible relative">
          {/* 노이즈 텍스처 */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-5 bg-repeat url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')" />
          </div>

          <div className="p-8 md:p-12 relative z-10">
            {!isSuccess ? (
              /* --- 1. 회원가입 입력 폼 --- */
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSignup}
                noValidate
                className="space-y-6"
              >
                {/* 헤더 중앙 정렬 */}
                <div className="mb-8 text-center flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center justify-center gap-3">
                    <UserPlus className="text-cyan-500" /> Initialize
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm tracking-wide">
                    Create your Neural Profile to access the algorithm.
                  </p>
                </div>

                {/* 그리드 레이아웃 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* 이름 입력 */}
                  <div className="space-y-1 relative group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Designation (Name)
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="FULL NAME"
                      className={`w-full bg-black/40 border p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm
                        ${errors.name ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-500/50"}`}
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 top-full mt-2 w-full z-20"
                        >
                          <div className="relative bg-slate-950 border border-cyan-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />
                            <div className="shrink-0 w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center mt-0.5">
                              <AlertCircle size={14} className="text-cyan-400" />
                            </div>
                            <span className="leading-relaxed font-mono text-slate-300">{errors.name}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 전화번호 입력 */}
                  <div className="space-y-1 relative group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Contact (Phone)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="MOBILE NO."
                      className={`w-full bg-black/40 border p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm
                        ${errors.phone ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-500/50"}`}
                    />
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 top-full mt-2 w-full z-20"
                        >
                          <div className="relative bg-slate-950 border border-cyan-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />
                            <div className="shrink-0 w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center mt-0.5">
                              <AlertCircle size={14} className="text-cyan-400" />
                            </div>
                            <span className="leading-relaxed font-mono text-slate-300">{errors.phone}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 이메일 입력 */}
                <div className="space-y-1 relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Neural Link (Email)
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="EMAIL ADDRESS"
                    className={`w-full bg-black/40 border p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono
                      ${errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-500/50"}`}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 top-full mt-2 w-full z-20"
                      >
                        <div className="relative bg-slate-950 border border-cyan-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />
                          <div className="shrink-0 w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center mt-0.5">
                            <AlertCircle size={14} className="text-cyan-400" />
                          </div>
                          <span className="leading-relaxed font-mono text-slate-300">{errors.email}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 비밀번호 입력 */}
                <div className="space-y-1 relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Access Code (Password)
                  </label>
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-black/40 border p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono
                      ${errors.password ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-500/50"}`}
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 top-full mt-2 w-full z-20"
                      >
                        <div className="relative bg-slate-950 border border-cyan-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />
                          <div className="shrink-0 w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center mt-0.5">
                            <AlertCircle size={14} className="text-cyan-400" />
                          </div>
                          <span className="leading-relaxed font-mono text-slate-300">{errors.password}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ✅ 커스텀 디자인된 버튼 적용 */}
                <div className="w-full flex justify-center mt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      group relative inline-flex items-center justify-center
                      overflow-hidden rounded-full p-[1px]
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950

                      /* 반응형 크기 설정 */
                      w-full max-w-[350px]
                      sm:w-auto sm:max-w-none sm:min-w-[240px] md:min-w-[280px]
                    "
                  >
                    {/* 1. 배경 애니메이션 그라디언트 (회전하는 빛 효과) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-500/40 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

                    {/* 2. 내부 컨텐츠 영역 */}
                    {/* group-hover:bg-cyan-950/30 추가로 호버 시 배경 투명해짐 */}
                    <div className="
                      relative w-full h-full
                      bg-slate-950 group-hover:bg-cyan-950/30
                      transition-colors duration-300
                      rounded-full
                      px-6 py-4 md:px-10 md:py-6
                      flex items-center justify-center gap-3 md:gap-4
                      backdrop-blur-sm
                    ">
                      {/* 아이콘 */}
                      <UserPlus
                        size={20}
                        className="text-cyan-500 group-hover:text-white transition-colors duration-300"
                      />

                      {/* 텍스트 */}
                      <span className="
                        font-black uppercase tracking-[0.2em] text-white
                        text-[10px] sm:text-xs md:text-sm
                        whitespace-nowrap
                        group-hover:text-cyan-50 transition-colors
                        group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                      ">
                        Register ID
                      </span>
                    </div>

                    {/* 3. 호버 시 글로우(Glow) 효과 */}
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
                  </motion.button>
                </div>

                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Already have an account?{" "}
                    <span className="text-cyan-500 underline decoration-cyan-500/30 underline-offset-4">
                      Authorize Here
                    </span>
                  </Link>
                </div>
              </motion.form>
            ) : (
              /* --- 2. 회원가입 성공 화면 --- */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>

                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                  System Access <br />{" "}
                  <span className="text-green-400">Granted</span>
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
                  Your Neural ID has been successfully registered. The
                  recommendation algorithm is now active.
                </p>

                <div className="w-full space-y-3">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 group"
                  >
                    <CircuitBoard className="w-5 h-5" />
                    Initialize Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
