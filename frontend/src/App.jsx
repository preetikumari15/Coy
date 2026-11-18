import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Flame, Home, Heart, X, Sparkles, RotateCcw } from 'lucide-react';
import SwipeCard from './components/SwipeCard';
import MatchModal from './components/MatchModal';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState(null);
  const [exitDirection, setExitDirection] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feedRes, matchesRes] = await Promise.all([
        fetch(`${API_BASE}/feed`),
        fetch(`${API_BASE}/matches`),
      ]);
      const feedData = await feedRes.json();
      const matchesData = await matchesRes.json();
      setFeed(feedData.profiles || []);
      setMatches(matchesData.matches || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSwipe = useCallback(
    async (action) => {
      if (feed.length === 0 || isSwiping) return;
      setIsSwiping(true);
      setExitDirection(action);

      const targetProfile = feed[0];
      // Slight tick so exitDirection registers before AnimatePresence removes the card
      setTimeout(() => {
        setFeed((prev) => prev.slice(1));
      }, 10);

      try {
        const res = await fetch(`${API_BASE}/swipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: targetProfile.id, action }),
        });
        const data = await res.json();

        if (data.isMatch && data.matchedProfile) {
          setNewMatch(data.matchedProfile);
          setMatches((prev) => [
            { profile: data.matchedProfile, matchedAt: new Date().toISOString() },
            ...prev,
          ]);
        }
      } finally {
        setTimeout(() => {
          setExitDirection(null);
          setIsSwiping(false);
        }, 260);
      }
    },
    [feed, isSwiping]
  );

  // Keyboard support for desktop testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'discover' || newMatch) return;
      if (e.key === 'ArrowLeft') handleSwipe('pass');
      if (e.key === 'ArrowRight') handleSwipe('like');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, newMatch, handleSwipe]);

  const handleResetDemo = async () => {
    await fetch(`${API_BASE}/reset`, { method: 'POST' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      {/* Mobile-first shell */}
      <div className="w-full max-w-md h-screen flex flex-col bg-neutral-950 border-x border-white/10 relative overflow-hidden">
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
              coy
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 uppercase">
              {activeTab}
            </span>
          </div>
          {activeTab === 'discover' && feed.length > 0 && (
            <span className="text-xs text-neutral-500">{feed.length} left</span>
          )}
        </header>

        {/* Tab Views */}
        <main className="flex-1 relative overflow-y-auto">
          {/* 1. Blank Home Tab */}
          {activeTab === 'home' && <div className="h-full" />}

          {/* 2. Discover Tab */}
          {activeTab === 'discover' && (
            <div className="h-full flex flex-col justify-between p-4">
              <div className="relative flex-1 w-full my-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                    Loading profiles...
                  </div>
                ) : feed.length > 0 ? (
                  <AnimatePresence>
                    {feed
                      .slice(0, 2)
                      .reverse()
                      .map((profile, idx, visibleStack) => (
                        <SwipeCard
                          key={profile.id}
                          profile={profile}
                          isTop={idx === visibleStack.length - 1}
                          exitDirection={exitDirection}
                          onSwipe={handleSwipe}
                        />
                      ))}
                  </AnimatePresence>
                ) : (
                  /* Empty State */
                  <div className="h-full rounded-3xl border border-white/10 bg-neutral-900/60 flex flex-col items-center justify-center p-8 text-center">
                    <Sparkles className="w-10 h-10 text-rose-400 mb-3" />
                    <h3 className="text-lg font-semibold">No more profiles</h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      You&apos;ve swiped through everyone in Discover. Check your mutual matches or reset the demo deck.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setActiveTab('matches')}
                        className="px-4 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition"
                      >
                        Matches ({matches.length})
                      </button>
                      <button
                        onClick={handleResetDemo}
                        className="px-4 py-2.5 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold hover:bg-white/15 transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Deck
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop / Tap Swipe Controls */}
              {feed.length > 0 && (
                <div className="flex items-center justify-center gap-6 py-3">
                  <button
                    onClick={() => handleSwipe('pass')}
                    disabled={isSwiping}
                    aria-label="Pass"
                    className="w-14 h-14 rounded-full bg-neutral-900 border border-white/15 flex items-center justify-center text-rose-500 hover:scale-105 hover:bg-rose-500/10 active:scale-95 transition disabled:opacity-50"
                  >
                    <X className="w-7 h-7" />
                  </button>
                  <button
                    onClick={() => handleSwipe('like')}
                    disabled={isSwiping}
                    aria-label="Like"
                    className="w-14 h-14 rounded-full bg-neutral-900 border border-white/15 flex items-center justify-center text-emerald-400 hover:scale-105 hover:bg-emerald-500/10 active:scale-95 transition disabled:opacity-50"
                  >
                    <Heart className="w-7 h-7 fill-current" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Mutual Matches View */}
          {activeTab === 'matches' && (
            <div className="p-5">
              <h2 className="text-lg font-bold">Your Matches</h2>
              <p className="text-xs text-neutral-400 mb-4">
                Mutual likes only — Coy never reveals one-sided crushes.
              </p>
              {matches.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 text-sm">
                  No mutual matches yet. Swipe right in Discover!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {matches.map(({ profile }) => (
                    <div
                      key={profile.id}
                      className="rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden"
                    >
                      <img
                        src={profile.photo}
                        alt={profile.name}
                        className="w-full h-36 object-cover bg-neutral-800"
                      />
                      <div className="p-3">
                        <p className="font-semibold text-sm">
                          {profile.name}, {profile.age}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{profile.affiliation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="border-t border-white/10 bg-neutral-950 px-6 py-3 flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-xs transition ${
              activeTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 text-xs transition ${
              activeTab === 'discover' ? 'text-rose-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>Discover</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center gap-1 text-xs transition ${
              activeTab === 'matches' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Matches ({matches.length})</span>
          </button>
        </nav>

        {/* "It's a match!" Overlay */}
        <MatchModal
          match={newMatch}
          onClose={() => setNewMatch(null)}
          onViewMatches={() => {
            setNewMatch(null);
            setActiveTab('matches');
          }}
        />
      </div>
    </div>
  );
}