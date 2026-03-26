"use client";

import { verifyEmail } from "@/api/auth";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const hasRun = useRef(false); // prevent double-fire in React StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL. Please use the link from your email.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.detail ?? "Email verified successfully!");
        setTimeout(() => navigate("/login"), 3500);
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        setStatus("error");
        setMessage(
          typeof detail === "string"
            ? detail
            : "Verification failed. The link may have already been used or has expired.",
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 group z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:shadow-[0_0_20px_rgba(6,182,212,1)] transition-all" />
          <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">
            NEXTGEN
          </span>
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-10 md:p-14 flex flex-col items-center text-center relative overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-[2.5rem]" />

          {/* Status icon */}
          <div className="mb-8 relative">
            {status === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-lg animate-pulse" />
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                </div>
                <p className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest animate-pulse">
                  Verifying token...
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-[spin_5s_linear_infinite]">
                    <div className="absolute inset-0 bg-[conic-gradient(from_90deg,#000,#059669,#4ade80)]" />
                  </div>
                  <div className="absolute inset-[2px] rounded-full bg-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.6)] w-10 h-10" />
                  </div>
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-red-500/15 rounded-full blur-xl animate-pulse" />
                  <AlertCircle className="text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.5)] w-12 h-12" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
            {status === "loading" && "Verifying..."}
            {status === "success" && (
              <>
                Identity<br />
                <span className="text-emerald-400">Confirmed</span>
              </>
            )}
            {status === "error" && (
              <>
                Verification<br />
                <span className="text-red-400">Failed</span>
              </>
            )}
          </h1>

          {/* Message */}
          {status !== "loading" && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm leading-relaxed mb-8 max-w-xs ${
                status === "success" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {message}
            </motion.p>
          )}

          {/* Actions */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 w-full"
            >
              <p className="text-[10px] text-cyan-600 font-mono uppercase tracking-widest animate-pulse">
                Redirecting to login...
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400/50 transition-all text-xs font-black uppercase tracking-widest"
              >
                Go to Login Now
              </button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 w-full"
            >
              <Link
                to="/signup"
                className="block w-full py-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400/50 transition-all text-xs font-black uppercase tracking-widest text-center"
              >
                Register Again
              </Link>
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-xs font-black uppercase tracking-widest text-center"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
