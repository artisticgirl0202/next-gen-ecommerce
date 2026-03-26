"use client";

import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Countdown redirect after success
  useEffect(() => {
    if (!isSuccess) return;
    if (countdown === 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const validate = (): boolean => {
    let ok = true;
    if (!newPassword) {
      setPwError("New access code is required.");
      ok = false;
    } else if (newPassword.length < 8) {
      setPwError("Must be at least 8 characters.");
      ok = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      setPwError("Must contain at least one uppercase letter.");
      ok = false;
    } else if (!/\d/.test(newPassword)) {
      setPwError("Must contain at least one digit.");
      ok = false;
    } else {
      setPwError(null);
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your new access code.");
      ok = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("Access codes do not match.");
      ok = false;
    } else {
      setConfirmError(null);
    }

    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    if (!token) {
      setApiError("No reset token found in the URL. Please use the link from your email.");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/api/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setApiError(
          typeof detail === "string"
            ? detail
            : "An unexpected error occurred. Please try again.",
        );
      } else {
        setApiError("Unable to connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(124,58,237,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)] group-hover:shadow-[0_0_20px_rgba(124,58,237,1)] transition-all" />
          <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-violet-400 transition-colors">
            NEXTGEN
          </span>
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Top glow bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-violet-500/40 rounded-tl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-violet-500/40 rounded-br-[2.5rem]" />

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              /* ── Reset form ───────────────────────────────────────── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-950 border border-violet-500/20 mb-4 text-violet-400 shadow-[0_0_20px_rgba(124,58,237,0.15)]">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                    New
                    <br />
                    <span className="text-violet-400">Access Code</span>
                  </h2>
                  <p className="text-slate-500 text-xs tracking-widest uppercase">
                    Override your credentials below
                  </p>
                </div>

                {/* Token missing warning */}
                {!token && (
                  <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/30 text-amber-400 text-xs p-4 rounded-2xl font-mono">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>
                      No reset token detected. Please use the link from your email.
                    </span>
                  </div>
                )}

                {/* API error */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl font-mono"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* New password */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">
                    New Access Code
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPwError(null);
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-black/40 border p-4 md:p-5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 font-mono text-sm ${
                      pwError
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-violet-400/50"
                    }`}
                  />
                  <p className="text-[10px] text-slate-600 ml-1">
                    Min. 8 chars · 1 uppercase · 1 digit
                  </p>
                  <AnimatePresence>
                    {pwError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-full mt-1 w-full z-20"
                      >
                        <div className="relative bg-slate-950 border border-violet-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-violet-500/30 rotate-45" />
                          <AlertCircle size={13} className="text-violet-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-mono text-slate-300">{pwError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm password */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">
                    Confirm Access Code
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmError(null);
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-black/40 border p-4 md:p-5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 font-mono text-sm ${
                      confirmError
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-violet-400/50"
                    }`}
                  />
                  <AnimatePresence>
                    {confirmError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-full mt-1 w-full z-20"
                      >
                        <div className="relative bg-slate-950 border border-violet-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-violet-500/30 rotate-45" />
                          <AlertCircle size={13} className="text-violet-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-mono text-slate-300">{confirmError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <div className="w-full flex justify-center pt-2">
                  <motion.button
                    type="submit"
                    disabled={isLoading || !token}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                    <div className="relative w-full h-full bg-slate-950 group-hover:bg-violet-950/30 transition-colors duration-300 rounded-full px-6 py-4 md:py-5 flex items-center justify-center gap-3 backdrop-blur-sm">
                      {isLoading ? (
                        <Loader2 size={16} className="text-violet-400 animate-spin" />
                      ) : (
                        <KeyRound size={16} className="text-violet-400 group-hover:text-white transition-colors" />
                      )}
                      <span className="font-black uppercase tracking-[0.2em] text-white text-xs whitespace-nowrap group-hover:text-violet-50 transition-colors">
                        {isLoading ? "Updating..." : "OVERRIDE ACCESS CODE"}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(124,58,237,0)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-shadow pointer-events-none" />
                  </motion.button>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors font-mono"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </motion.form>
            ) : (
              /* ── Success state ─────────────────────────────────────── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-4 space-y-6"
              >
                {/* Animated check */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-400/15 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-[spin_5s_linear_infinite]">
                    <div className="absolute inset-0 bg-[conic-gradient(from_90deg,#000,#059669,#4ade80)]" />
                  </div>
                  <div className="absolute inset-[2px] rounded-full bg-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.6)] w-10 h-10" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
                    Override
                    <br />
                    <span className="text-emerald-400">Successful</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Your access code has been updated.<br />
                    You can now log in with your new credentials.
                  </p>
                </div>

                {/* Countdown */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest animate-pulse">
                    Redirecting to login in {countdown}s...
                  </div>
                  <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full max-w-xs py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400/50 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Go to Login Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
