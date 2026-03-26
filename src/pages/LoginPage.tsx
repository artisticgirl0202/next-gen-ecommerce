//src/pages/LoginPage.tsx
"use client";

import { login, loginWithGoogle } from "@/api/auth";
import { useAuth } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Fingerprint, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const { setAuth, rememberMe, setRememberMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setApiError(null);
      try {
        // Send Google OAuth2 access_token to backend.
        // Backend calls Google's /userinfo endpoint to verify and get user info.
        const data = await loginWithGoogle(tokenResponse.access_token);
        setAuth(data.user, data.access_token);
        if (onLogin) {
          onLogin();
        } else {
          navigate("/auth-success", { state: location.state });
        }
      } catch {
        setApiError("Google sign-in failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setApiError("Google sign-in was cancelled or failed."),
    flow: "implicit",
    scope: "openid email profile",
  });

  // ── Email / Password login ───────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    let hasError = false;

    if (!email.includes("@")) {
      setEmailError(
        `Please include an '@' in the email address. '${email}' is missing an '@'.`,
      );
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const data = await login({ email, password });
      setAuth(data.user, data.access_token);
      if (onLogin) {
        onLogin();
      } else {
        navigate("/auth-success", { state: location.state });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail: string =
          err.response?.data?.detail ?? "An unexpected error occurred.";
        if (status === 429) {
          setApiError("Too many login attempts. Please wait 60 seconds.");
        } else if (status === 423) {
          setApiError(detail);
        } else {
          setApiError("Email or password is incorrect.");
        }
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Logo */}
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
            {/* API-level error banner */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl font-mono"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
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
                  ${emailError ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-400/50"}`}
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
                      <span className="leading-relaxed font-mono text-slate-300">{emailError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
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
                  ${passwordError ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-400/50"}`}
              />
              <AnimatePresence>
                {passwordError && (
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
                      <span className="leading-relaxed font-mono text-slate-300">{passwordError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold font-mono uppercase tracking-widest text-pink-500/70 hover:text-pink-400 transition-colors"
              >
                FORGET ACCESS CODE?
              </Link>
            </div>

            {/* Remember me */}
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
                  {rememberMe && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-white transition-colors tracking-wide">
                  Keep Session Active
                </span>
              </label>
            </div>

            {/* Submit button */}
            <div className="w-full flex justify-center mt-6">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 w-full max-w-[350px] sm:w-auto sm:max-w-none sm:min-w-[240px] md:min-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-600 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                <div className="relative w-full h-full bg-slate-950 group-hover:bg-cyan-950/30 transition-colors duration-300 rounded-full px-6 py-4 md:px-10 md:py-6 flex items-center justify-center gap-3 md:gap-4 backdrop-blur-sm">
                  <Fingerprint size={20} className="text-cyan-500 group-hover:text-white transition-colors duration-300" />
                  <span className="font-black uppercase tracking-[0.2em] text-white text-[10px] sm:text-xs md:text-sm whitespace-nowrap group-hover:text-cyan-50 transition-colors">
                    {isLoading ? "Verifying..." : "Verify Identity"}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-300 pointer-events-none" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Google Sign-In button — Sci-Fi styled */}
            <motion.button
              type="button"
              disabled={isLoading}
              onClick={() => handleGoogleLogin()}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-white rounded-2xl px-6 py-4 transition-all duration-200 font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google "G" SVG icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continue with Google
            </motion.button>
          </div>

          <div className="mt-10 text-center border-t border-white/5 pt-6">
            <p className="text-slate-500 text-xs mb-3">No Neural ID detected?</p>
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
