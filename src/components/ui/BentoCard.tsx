// components/ui/BentoCard.tsx
'use client';
import { motion } from 'framer-motion';

export const BentoCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl ${className}`}
  >
    {/* Spotlight Effect Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </motion.div>
);

export default BentoCard;
