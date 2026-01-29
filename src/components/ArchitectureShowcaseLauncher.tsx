'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Layers, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function ArchitectureShowcaseLauncher() {
  const [open, setOpen] = useState(false);

  const showcaseUrl = useMemo(() => '/architecture-showcase.html', []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      {/* Floating Action Button */}
      <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open Architecture Showcase"
      className="
        fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[180]
        group flex items-center justify-center
        gap-0 sm:gap-3
        rounded-full 
        p-1.5 sm:px-5 sm:py-3
        bg-slate-950/70 backdrop-blur-md
        border border-cyan-500/30 hover:border-cyan-400/60
        shadow-[0_0_25px_rgba(6,182,212,0.18)]
        hover:shadow-[0_0_35px_rgba(6,182,212,0.28)]
        transition-all duration-300
        active:scale-95
      "
    >
      {/* 아이콘 영역 (항상 보임, 크기 반응형) */}
      <span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0">
        <Layers className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-cyan-300" />
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_18px_rgba(34,211,238,0.55)] backdrop-blur-md" />
      </span>

      {/* 텍스트 영역 (모바일: 숨김 / 태블릿&PC: 보임) */}
      <span className="hidden sm:flex flex-col items-start text-left">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400/80 leading-tight">
          Architecture
        </span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-white leading-tight">
          Showcase
        </span>
      </span>
    </button>

      {/* Overlay / Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[190]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="
                absolute inset-x-3 bottom-3 top-3
                sm:inset-x-6 sm:bottom-6 sm:top-6
                md:inset-y-0 md:right-0 md:left-auto md:w-[min(900px,92vw)]
                bg-slate-950/90 border border-white/10 backdrop-blur-xl
                rounded-2xl md:rounded-none md:rounded-l-3xl
                shadow-2xl shadow-black/60 overflow-hidden
                flex flex-col
              "
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <div
                className="
                  relative z-100 -mb-[4px]
                  flex items-center justify-between gap-3
                  px-4 sm:px-6 py-3.5
                  border-b border-white/0
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full
                  after:bg-gradient-to-r after:from-cyan-500/0 after:via-cyan-400/35 after:to-cyan-500/0
                "
              >
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400/70">
                    System / Portfolio
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.12em] text-white leading-tight truncate sm:whitespace-normal">
                    Architecture Showcase
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={showcaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      inline-flex items-center gap-2
                      px-3 py-2 rounded-xl
                      bg-white/5 hover:bg-white/8
                      border border-white/10 hover:border-cyan-500/30
                      text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-300 hover:text-cyan-200
                      transition-all
                    "
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">New Tab</span>
                    <span className="sm:hidden">Tab</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="
                      inline-flex items-center justify-center
                      h-10 w-10 rounded-xl
                      bg-white/5 hover:bg-white/8
                      border border-white/10 hover:border-white/20
                      text-slate-300 hover:text-white
                      transition-all
                    "
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 w-full">
                <iframe
                  title="Architecture Showcase"
                  src={showcaseUrl}
                  className="block h-full w-full bg-black"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

