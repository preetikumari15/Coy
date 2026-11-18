import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function MatchModal({ match, onClose, onViewMatches }) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center max-w-xs"
          >
            <span className="text-xs uppercase tracking-widest text-rose-400 font-semibold">
              Mutual Crush
            </span>
            <h2 className="text-4xl font-black mt-1 bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
              It&apos;s a match!
            </h2>
            <p className="text-sm text-neutral-300 mt-2">
              You and <span className="font-semibold text-white">{match.name}</span> liked each other.
            </p>

            <div className="relative my-7">
              <img
                src={match.photo}
                alt={match.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-rose-500 shadow-xl bg-neutral-800"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
            </div>

            <button
              onClick={onViewMatches}
              className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm hover:opacity-95 transition"
            >
              See All Matches
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 mt-2 rounded-full bg-white/10 text-neutral-300 font-medium text-sm hover:bg-white/15 transition"
            >
              Keep Swiping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}