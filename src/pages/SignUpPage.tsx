"use client";

import { register } from "@/api/auth";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({
    name: null,
    email: null,
    password: null,
    api: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string | null } = {
      name: null,
      email: null,
      password: null,
      api: null,
    };
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full designation (Name).";
      hasError = true;
    }

    if (!formData.email.includes("@")) {
      newErrors.email = `Please include an '@' in the email address. '${formData.email}' is missing an '@'.`;
      hasError = true;
    }

    if (!formData.password) {
      newErrors.password = "Access Code (Password) is required.";
      hasError = true;
    } else if (formData.password.length < 8) {
      newErrors.password = "Access Code must be at least 8 characters.";
      hasError = true;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Access Code must contain at least one uppercase letter.";
      hasError = true;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Access Code must contain at least one digit.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsLoading(true);
    try {
      const data = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.name.trim(),
      });
      setRegisteredEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      let message = "Registration failed. Please try again.";
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (err.response?.status === 409) {
          message = "An account with this email already exists.";
        } else if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((d: { msg: string }) => d.msg).join(" ");
        }
      }
      setErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorBubble = ({ message }: { message: string }) => (
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
        <span className="leading-relaxed font-mono text-slate-300">{message}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

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
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-visible relative">
          <div className="p-8 md:p-12 relative z-10">
            {!isSuccess ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSignup}
                noValidate
                className="space-y-6"
              >
                {/* Header */}
                <div className="mb-8 text-center flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center justify-center gap-3">
                    <UserPlus className="text-cyan-500" /> Initialize
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm tracking-wide">
                    Create your Neural Profile to access the algorithm.
                  </p>
                </div>

                {/* API error banner */}
                <AnimatePresence>
                  {errors.api && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl font-mono"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{errors.api}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Name */}
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
                    {errors.name && <ErrorBubble message={errors.name} />}
                  </AnimatePresence>
                </div>

                {/* Email */}
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
                    {errors.email && <ErrorBubble message={errors.email} />}
                  </AnimatePresence>
                </div>

                {/* Password */}
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
                  <p className="text-[10px] text-slate-600 ml-1 mt-1">
                    Min. 8 characters · 1 uppercase letter · 1 digit
                  </p>
                  <AnimatePresence>
                    {errors.password && <ErrorBubble message={errors.password} />}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <div className="w-full flex justify-center mt-6">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 w-full max-w-[350px] sm:w-auto sm:max-w-none sm:min-w-[240px] md:min-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-500/40 to-cyan-400 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                    <div className="relative w-full h-full bg-slate-950 group-hover:bg-cyan-950/30 transition-colors duration-300 rounded-full px-6 py-4 md:px-10 md:py-6 flex items-center justify-center gap-3 md:gap-4 backdrop-blur-sm">
                      <UserPlus size={20} className="text-cyan-500 group-hover:text-white transition-colors duration-300" />
                      <span className="font-black uppercase tracking-[0.2em] text-white text-[10px] sm:text-xs md:text-sm whitespace-nowrap group-hover:text-cyan-50 transition-colors">
                        {isLoading ? "Registering..." : "Register ID"}
                      </span>
                    </div>
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
              /* Email verification pending screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                {/* Animated mail icon */}
                <div className="flex justify-center mb-6 relative z-10">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-[spin_6s_linear_infinite]">
                      <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#0891b2_50%,#06b6d4_100%)]" />
                    </div>
                    <div className="absolute inset-[2px] rounded-full bg-slate-950 flex items-center justify-center">
                      <Mail className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] w-10 h-10" />
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
                  Transmission<br />
                  <span className="text-cyan-400">Dispatched</span>
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-2 max-w-xs">
                  A verification link has been sent to
                </p>
                <p className="text-cyan-300 font-mono text-sm mb-8 bg-cyan-950/30 border border-cyan-500/20 px-4 py-2 rounded-xl">
                  {registeredEmail}
                </p>

                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 text-left space-y-3 mb-8 w-full max-w-sm">
                  {[
                    "Open your email inbox.",
                    "Click the activation link in the email.",
                    "Return here and log in.",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full border border-cyan-500/40 flex items-center justify-center text-[10px] font-black text-cyan-400 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-400 text-xs leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-600 text-[10px] mb-6">
                  Didn't receive it? Check your spam folder or contact support.
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors underline underline-offset-4 decoration-cyan-500/30 uppercase tracking-widest font-mono"
                >
                  Go to Login
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
