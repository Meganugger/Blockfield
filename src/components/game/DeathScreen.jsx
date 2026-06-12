import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeathScreen({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.25), rgba(60,0,0,0.55))' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-5xl font-black text-white drop-shadow-lg tracking-tight"
          >
            You died
          </motion.div>
          <div className="text-white/70 mt-3 text-sm">Respawning…</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}