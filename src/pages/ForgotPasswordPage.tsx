"use client";

import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!email.includes("@")) {
      setEmailError(
        `Please include an '@' in the email address. '${email}' is missing an '@'.`,
      );
      return;
    }
    setEmailError(null);

    setIsLoading(true);
    try {
      await axiosInstance.post("/api/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setApiError(
          typeof detail === "string"
            ? detail
            : "An unexpected error occurred. Please try again.",
        );
      } else {
        setApiError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-pink-600/8 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(244,63,94,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)] group-hover:shadow-[0_0_20px_rgba(244,63,94,1)] transition-all" />
          <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-pink-400 transition-colors">
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
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60" />
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500/40 rounded-tl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500/40 rounded-br-[2.5rem]" />

          <AnimatePresence mode="wait">
            {!isSent ? (
              /* ── Request form ─────────────────────────────────────── */
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
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-950 border border-pink-500/20 mb-4 text-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <Mail size={24} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                    Access Code
                    <br />
                    <span className="text-pink-400">Recovery</span>
                  </h2>
                  <p className="text-slate-500 text-xs tracking-widest uppercase">
                    Enter your neural link to receive a reset signal
                  </p>
                </div>

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

                {/* Email input */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
                    Neural Link (Email)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="NEURAL_EMAIL"
                    className={`w-full bg-black/40 border p-4 md:p-5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 font-mono text-sm ${
                      emailError
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-pink-400/50"
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
                        <div className="relative bg-slate-950 border border-pink-500/30 text-white text-xs p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-start gap-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-950 border-t border-l border-pink-500/30 rotate-45" />
                          <div className="shrink-0 w-5 h-5 bg-pink-500/20 rounded flex items-center justify-center mt-0.5">
                            <AlertCircle size={14} className="text-pink-400" />
                          </div>
                          <span className="leading-relaxed font-mono text-slate-300">
                            {emailError}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit button */}
                <div className="w-full flex justify-center pt-2">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                    <div className="relative w-full h-full bg-slate-950 group-hover:bg-pink-950/30 transition-colors duration-300 rounded-full px-6 py-4 md:py-5 flex items-center justify-center gap-3 backdrop-blur-sm">
                      <Send
                        size={16}
                        className="text-pink-400 group-hover:text-white transition-colors"
                      />
                      <span className="font-black uppercase tracking-[0.2em] text-white text-xs whitespace-nowrap group-hover:text-pink-50 transition-colors">
                        {isLoading ? "Dispatching..." : "DISPATCH RESET LINK"}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(244,63,94,0)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.35)] transition-shadow pointer-events-none" />
                  </motion.button>
                </div>

                <div className="text-center pt-2">
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
                {/* Animated check icon */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-pink-400/15 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-[spin_6s_linear_infinite]">
                    <div className="absolute inset-0 bg-[conic-gradient(from_90deg,#000,#be123c,#f43f5e)]" />
                  </div>
                  <div className="absolute inset-[2px] rounded-full bg-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] w-10 h-10" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
                    Signal
                    <br />
                    <span className="text-pink-400">Dispatched</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    If an account exists for{" "}
                    <span className="text-pink-300 font-mono">{email}</span>, a
                    password reset link has been sent.
                  </p>
                </div>

                {/* Info steps */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 text-left space-y-3 w-full max-w-sm">
                  {[
                    "Open your email inbox.",
                    "Click the reset link (valid for 15 minutes).",
                    "Set your new access code.",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full border border-pink-500/40 flex items-center justify-center text-[10px] font-black text-pink-400 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-400 text-xs leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-600 text-[10px]">
                  Didn't receive it? Check your spam folder.
                </p>

                <Link
                  to="/login"
                  className="text-xs text-slate-500 hover:text-pink-400 transition-colors underline underline-offset-4 decoration-pink-500/30 uppercase tracking-widest font-mono"
                >
                  Back to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
