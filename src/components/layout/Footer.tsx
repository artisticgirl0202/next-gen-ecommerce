// next-gen-ecommerce/src/components/layout/Footer.tsx
"use client";

import { motion } from "framer-motion";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Zap
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 소셜 미디어 링크 데이터
  const socialLinks = [
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Github size={18} />, href: "#", label: "Github" },
  ];

  // 푸터 링크 섹션 데이터
  const footerSections = [
    {
      title: "SHOP",
      links: ["Computing Devices", "Mobile & Wearables", "Audio & Sound", "AI Processors", "Neural Modules"]
    },
    {
      title: "SUPPORT",
      links: ["Order Status", "Shipping & Delivery", "Returns", "Payment Options", "Contact Us"]
    },
    {
      title: "COMPANY",
      links: ["About TECH.CO", "Our Technology", "Sustainability", "Careers", "Press"]
    }
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-white/10 pt-16 pb-8 text-slate-400 relative overflow-hidden">
      {/* 배경 장식용 그라디언트 (은은한 빛) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* 상단: 메인 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">

          {/* 1. 브랜드 정보 & 로고 (lg: 4칸 차지) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 group cursor-default w-fit">
              <div className="w-8 h-8 bg-cyan-400/80 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform duration-300">
                <Zap className="text-white" size={20} fill="currentColor" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white italic">
                TECH.CO
              </h1>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              Experience the future of electronics with our AI-driven curation.
              We deliver next-gen computing power directly to your doorstep.
            </p>

            <div className="flex flex-col gap-2 mt-2 text-sm">
              <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-pointer">
                <MapPin size={16} />
                <span>1024 Neural Ave, Silicon Valley, CA</span>
              </div>
              <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-pointer">
                <Phone size={16} />
                <span>+1 (800) 123-4567</span>
              </div>
            </div>
          </div>

          {/* 2. 링크 섹션 (lg: 각 2칸씩 차지 * 3개 = 6칸) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-bold text-sm tracking-wider mb-5">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm hover:text-cyan-400 transition-colors duration-200 block w-fit"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 3. 뉴스레터 (lg: 2칸 차지) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <h3 className="text-white font-bold text-sm tracking-wider">
              STAY CONNECTED
            </h3>
            <p className="text-xs text-slate-500">
              Join our neural network for the latest AI tech drops.
            </p>

            <div className="flex flex-col gap-3">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder:text-slate-600"
                />
              </div>
              <motion.button

                whileTap={{ scale: 0.98 }}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Subscribe</span>

              </motion.button>
            </div>
          </div>

        </div>

        {/* 하단 구분선 */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* 하단: 카피라이트 & 소셜 아이콘 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <p className="text-slate-600 text-center md:text-left">
            &copy; {currentYear} TECH.CO Inc. All rights reserved. <br className="hidden sm:block md:hidden"/>
            <span className="hidden sm:inline mx-2 text-slate-700">|</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span className="mx-2 text-slate-700">|</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-cyan-950 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
