import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFitness();

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium ${
              t.type === 'success'
                ? 'bg-[#111111]/95 border-[#D9FF00]/40 text-white shadow-[0_0_15px_rgba(217,255,0,0.15)]'
                : t.type === 'error'
                ? 'bg-[#140808]/95 border-red-500/40 text-red-200 shadow-red-950/40'
                : 'bg-[#111111]/95 border-white/10 text-white shadow-black/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#D9FF00] shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
