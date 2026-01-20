
//src\pages\LoginPage.tsx
"use client";

import { useAuth } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Fingerprint, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const { login, rememberMe, setRememberMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ 이메일 & 비밀번호 상태 관리
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // 1. 이메일 유효성 검사
    if (!email.includes("@")) {
      setEmailError(
        `Please include an '@' in the email address. '${email}' is missing an '@'.`
      );
      hasError = true;
    } else {
      setEmailError(null);
    }

    // 2. 비밀번호 유효성 검사 (빈 값 체크)
    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else {
      setPasswordError(null);
    }

    // 에러가 하나라도 있으면 로그인 중단
    if (hasError) return;

    // 로그인 로직 실행
    login({ name: "Alex Sterling", email: email }, rememberMe);

    if (onLogin) {
      onLogin();
    } else {
      navigate("/auth-success", { state: location.state });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* 로고 */}
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:shadow-[0_0_20px_rgba(6,182,212,1)] transition-all" />
          <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">
            NEXTGEN
          </span>
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleLogin}
          noValidate
          className="bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-visible"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-950 border border-white/10 mb-4 text-cyan-400">
              <ScanFace size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
              Authorize
            </h2>
            <p className="text-slate-500 text-xs md:text-sm tracking-widest uppercase">
              Access Neural Interface
            </p>
          </div>

          <div className="space-y-5">
            {/* ---------------- 이메일 입력 필드 ---------------- */}
            <div className="group relative">
              <input
                required
                type="email"
                placeholder="NEURAL_EMAIL"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className={`w-full bg-black/40 border p-4 md:p-5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 font-mono text-sm
                  ${
                    emailError
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-cyan-400/50"
                  }`}
              />

              <AnimatePresence>
                {emailError && (
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
                      <span className="leading-relaxed font-mono text-slate-300">
                        {emailError}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---------------- 비밀번호 입력 필드 ---------------- */}
            <div className="group relative">
              <input
                required
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                className={`w-full bg-black/40 border p-4 md:p-5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 font-mono text-sm
                  ${
                    passwordError
                      ? "border-red-500/50 focus:border-red-500" // 에러 시 붉은 테두리
                      : "border-white/10 focus:border-cyan-400/50" // 평상시
                  }`}
              />

              {/* ✅ 비밀번호 에러 안내창 */}
              <AnimatePresence>
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-full mt-2 w-full z-20"
                  >
                    <div className="relative bg-slate-950 border border-cyan-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                      {/* 말풍선 꼬리 */}
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />

                      {/* 느낌표 아이콘 */}
                      <div className="shrink-0 w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center mt-0.5">
                        <AlertCircle size={14} className="text-cyan-400" />
                      </div>

                      {/* 에러 메시지 텍스트 */}
                      <span className="leading-relaxed font-mono text-slate-300">
                        {passwordError}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group py-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    rememberMe
                      ? "bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {rememberMe && (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-white transition-colors tracking-wide">
                  Keep Session Active
                </span>
              </label>
            </div>

            {/* ✅ 수정된 버튼 적용 */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

                {/* 2. 내부 컨텐츠 영역 */}
                {/* group-hover:bg-cyan-950/30 추가 -> 호버 시 배경 투명해짐 */}
                <div className="
                  relative w-full h-full
                  bg-slate-950 group-hover:bg-cyan-950/30
                  transition-colors duration-300
                  rounded-full
                  px-6 py-4 md:px-10 md:py-6
                  flex items-center justify-center gap-3 md:gap-4
                  backdrop-blur-sm
                ">
                  <Fingerprint
                    size={20}
                    className="text-cyan-500 group-hover:text-white transition-colors duration-300"
                  />
                  <span className="
                    font-black uppercase tracking-[0.2em] text-white
                    text-[10px] sm:text-xs md:text-sm
                    whitespace-nowrap
                    group-hover:text-cyan-50 transition-colors
                    group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                  ">
                    Verify Identity
                  </span>
                </div>

                {/* 3. 호버 시 글로우 효과 */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
              </motion.button>
            </div>
          </div>

          <div className="mt-10 text-center border-t border-white/5 pt-6">
            <p className="text-slate-500 text-xs mb-3">
              No Neural ID detected?
            </p>
            <Link
              to="/signup"
              state={location.state}
              className="inline-block text-xs font-bold text-cyan-500 uppercase tracking-widest border-b border-cyan-500/30 pb-1 hover:text-cyan-300 hover:border-cyan-300 transition-all"
            >
              Initialize Registration
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
