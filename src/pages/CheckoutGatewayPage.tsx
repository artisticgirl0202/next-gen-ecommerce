'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, User, UserPlus, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutGatewayPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  return (
    <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 relative font-sans bg-slate-950 flex flex-col">
      {/* Background Effect (CartPage와 동일) */}
      <div className="fixed inset-0 bg-[url('/circuit-board.svg')] bg-center opacity-5 mix-blend-screen pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10 w-full flex-1 flex flex-col">
        {/* HEADER SECTION (CartPage와 통일감 유지) */}
        <header className="">
          <div className="flex items-start gap-4 sm:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group relative flex items-center justify-center
                         w-10 h-10 sm:w-12 sm:h-12
                         transition-all duration-300 cursor-pointer flex-shrink-0
                         border border-white/10 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Secure //
                  Gateway
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Identity Verification
              </h1>
              <p className="text-cyan-500/60 font-mono text-[10px] sm:text-sm uppercase tracking-tighter mt-2 pl-1">
                Select access level to proceed
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT SECTION: Center Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl">
            {/* OPTION 1: MEMBER CHECKOUT (Highlighted) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-[2.5rem] p-8 sm:p-10 lg:p-12
                         shadow-[0_0_50px_rgba(6,182,212,0.05)] hover:shadow-[0_0_60px_rgba(6,182,212,0.15)] transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
              {/* Decorative top line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

              <div className="relative mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                  <User className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite] opacity-50" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase italic text-white tracking-tighter mb-2">
                Member Access
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-mono tracking-wide mb-8">
                Save progress, earn core rewards & track shipments.
              </p>

              <div className="w-full space-y-4 mt-auto">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 sm:py-5 bg-cyan-500 hover:bg-white text-black font-black uppercase text-xs sm:text-sm tracking-[0.2em] rounded-2xl
                             transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2"
                >
                  System Login <Zap size={16} fill="currentColor" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-4 sm:py-5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] transition-all"
                >
                  Create New ID
                </button>
              </div>
            </motion.div>

            {/* OPTION 2: GUEST CHECKOUT (Minimal) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.04]
                         rounded-[2.5rem] p-8 sm:p-10 lg:p-12 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="relative mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-500 group-hover:text-white transition-colors duration-300">
                  <UserPlus className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase italic text-slate-200 tracking-tighter mb-2">
                Guest Access
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-mono tracking-wide mb-8">
                Quick checkout. No data retention protocol.
              </p>

              <div className="w-full mt-auto">
                <button
                  onClick={() => navigate('/checkout?guest=true')}
                  className="w-full py-4 sm:py-5 bg-slate-800/50 hover:bg-white hover:text-black border border-white/10 text-white rounded-2xl
                             font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all group-hover:border-transparent"
                >
                  Continue as Guest
                </button>
                <div className="h-14 sm:h-[68px] hidden md:block" />{' '}
                {/* Spacing spacer to align with left buttons */}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer decoration */}
        <div className="mt-10 flex justify-center gap-2 opacity-20">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <div className="w-2 h-2 rounded-full bg-slate-500" />
        </div>
      </div>
    </div>
  );
}
