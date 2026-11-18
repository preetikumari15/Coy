import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function SwipeCard({ profile, isTop, exitDirection, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [35, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -35], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100 || info.velocity.x > 500) {
      onSwipe('like');
    } else if (info.offset.x < -100 || info.velocity.x < -500) {
      onSwipe('pass');
    }
  };

  // Determine fly-off direction whether swiped via drag OR desktop button
  const computedExitX =
    exitDirection === 'like'
      ? 450
      : exitDirection === 'pass'
      ? -450
      : x.get() >= 0
      ? 450
      : -450;

  return (
    <motion.div
      style={{ x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.75 }}
      exit={{
        x: computedExitX,
        rotate: computedExitX > 0 ? 20 : -20,
        opacity: 0,
        transition: { duration: 0.25 },
      }}
      className={`absolute inset-0 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden select-none ${
        isTop ? 'cursor-grab active:cursor-grabbing z-20' : 'z-10 pointer-events-none'
      }`}
    >
      {/* Avatar / Photo */}
      <div className="relative h-3/5 w-full bg-neutral-800">
        <img
          src={profile.photo}
          alt={profile.name}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 border-4 border-emerald-400 text-emerald-400 font-black text-3xl px-4 py-1 rounded-xl -rotate-12 tracking-wider"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 border-4 border-rose-500 text-rose-500 font-black text-3xl px-4 py-1 rounded-xl rotate-12 tracking-wider"
            >
              NOPE
            </motion.div>
          </>
        )}
      </div>

      {/* Bio & Tags */}
      <div className="p-5 flex flex-col justify-between h-2/5 text-white">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <span className="text-xl text-neutral-400 font-light">{profile.age}</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            {profile.affiliation}
          </p>
          <p className="text-sm text-neutral-300 mt-2.5 line-clamp-2">{profile.bio}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/5"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}