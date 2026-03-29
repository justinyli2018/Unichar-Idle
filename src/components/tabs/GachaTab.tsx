import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerUnichar, Banner } from '../../types';
import { UNICHARS, getProbability } from '../../data/unichars';
import { UnicharDetails } from '../UnicharDetails';
import { getAverageTier, getTierValue, getRarityColor, getRarityLabel, formatNumber } from '../../lib/gameMath';
import { ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { BANNERS } from '../../data/banners';

interface GachaTabProps {
  bits: number;
  freePulls: number;
  onSummon: (count: number, bannerId?: string, costOverride?: number) => PlayerUnichar[];
  inventory: PlayerUnichar[];
  isDesktop?: boolean;
  onUpdateUnichar?: (instanceId: string, updates: Partial<Pick<PlayerUnichar, 'nickname' | 'notes'>>) => void;
  currentBannerId: string;
  onSetBanner: (bannerId: string) => void;
  onTriggerDiscoveryNotifications?: (inventory: PlayerUnichar[]) => void;
}

type GachaView = 'idle' | 'summoning' | 'revealing' | 'summary';

export const GachaTab: React.FC<GachaTabProps> = ({ 
  bits, 
  freePulls,
  onSummon, 
  inventory, 
  isDesktop, 
  onUpdateUnichar,
  currentBannerId,
  onSetBanner,
  onTriggerDiscoveryNotifications
}) => {
  const [view, setView] = useState<GachaView>('idle');
  const [selectedChar, setSelectedChar] = useState<PlayerUnichar | null>(null);
  const [revealList, setRevealList] = useState<PlayerUnichar[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showBannerInfo, setShowBannerInfo] = useState(false);
  
  // Mystery Box Logic
  const [tapCount, setTapCount] = useState(0);
  const [boxProgress, setBoxProgress] = useState(0);
  const [activeBannerId, setActiveBannerId] = useState(currentBannerId);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pendingSummon, setPendingSummon] = useState<{ count: number, originalCost: number } | null>(null);
  const [ownedDefIds, setOwnedDefIds] = useState<Set<string>>(new Set());
  const [tapKey, setTapKey] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [preSummonedItems, setPreSummonedItems] = useState<PlayerUnichar[] | null>(null);
  const [bannerType, setBannerType] = useState<'standard' | 'custom'>(
    BANNERS.find(b => b.id === currentBannerId)?.customWeights ? 'custom' : 'standard'
  );

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    // The animation itself will handle the sequence and then we reset the state
    setTimeout(() => setShowFlash(false), 1200);
  }, []);

  // Sync activeBannerId with currentBannerId when in idle view
  useEffect(() => {
    if (view === 'idle') {
      setActiveBannerId(currentBannerId);
    }
  }, [currentBannerId, view]);

  useEffect(() => {
    if (view === 'summary' && onTriggerDiscoveryNotifications) {
      onTriggerDiscoveryNotifications(inventory);
    }
  }, [view, inventory, onTriggerDiscoveryNotifications]);

  const currentBanner = BANNERS.find(b => b.id === activeBannerId) || BANNERS[0];

  const isNew = useCallback((defId: string) => {
    return !ownedDefIds.has(defId);
  }, [ownedDefIds]);

  const handleBoxTap = useCallback(() => {
    if (view !== 'summoning' || isSpinning) return;

    // Pre-summon on first tap to save time later
    if (tapCount === 0 && pendingSummon && !preSummonedItems) {
      const newItems = onSummon(pendingSummon.count, activeBannerId, pendingSummon.originalCost);
      if (newItems && newItems.length > 0) {
        setPreSummonedItems(newItems);
      }
    }

    setBoxProgress(prev => Math.min(100, prev + 20)); // 5 taps to fill
    setTapCount(prev => prev + 1);
    setTapKey(prev => prev + 1);

    // Upgrade chance (~1.005% as requested, interpreted as 1.005% chance)
    if (tapCount < 4) {
      if (Math.random() < 0.01) {
        const currentIdx = BANNERS.findIndex(b => b.id === activeBannerId);
        if (currentIdx < BANNERS.length - 1) {
          setActiveBannerId(BANNERS[currentIdx + 1].id);
          setIsUpgrading(true);
          setTimeout(() => setIsUpgrading(false), 500);
        }
      }
    }
  }, [view, isSpinning, tapCount, activeBannerId]);

  const sortPulls = (pulls: PlayerUnichar[]) => {
    return [...pulls].sort((a, b) => {
      const probA = getProbability(a.defId);
      const probB = getProbability(b.defId);
      
      // Rarity first (higher probability is common/worse, so we want lower probability at the end)
      // We want Rare in back, so probA - probB (descending probability, so rare is last)
      // Wait, lower probability = rarer. 
      // If probA = 100 (common) and probB = 1 (mythic).
      // probB - probA = 1 - 100 = -99. A comes first. Correct.
      if (probA !== probB) return probB - probA; 
      
      // Then stats rating
      const tierA = getTierValue(getAverageTier(a.statModifiers));
      const tierB = getTierValue(getAverageTier(b.statModifiers));
      return tierA - tierB; // Better stats in back
    });
  };

  const handleSummon = useCallback((count: number) => {
    const banner = BANNERS.find(b => b.id === currentBannerId) || BANNERS[0];
    const useFreePulls = freePulls >= count;
    const cost = useFreePulls ? 0 : (banner.costPerSummon * count);
    
    if (!useFreePulls && bits < cost) return;
    if (view !== 'idle') return;
    
    // Capture currently owned defIds to determine "NEW!" status
    const currentOwned = new Set(inventory.map(u => u.defId));
    setOwnedDefIds(currentOwned);

    setRevealList([]);
    setView('summoning');
    setCurrentIndex(0);
    setIsSpinning(false);
    setTapCount(0);
    setBoxProgress(0);
    setActiveBannerId(currentBannerId);
    setPendingSummon({ count, originalCost: cost });
  }, [bits, freePulls, view, currentBannerId, inventory]);

  const [direction, setDirection] = useState(0);

  const nextCard = useCallback(() => {
    if (currentIndex < revealList.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else if (revealList.length > 1) {
      setView('summary');
    } else {
      setView('idle');
    }
  }, [currentIndex, revealList.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const startSpin = useCallback(() => {
    if (view === 'summoning' && pendingSummon) {
      setIsSpinning(true);
      
      // Use pre-summoned items if available, otherwise summon now
      const items = preSummonedItems || onSummon(pendingSummon.count, activeBannerId, pendingSummon.originalCost);
      
      setTimeout(() => {
        triggerFlash();
        if (items && items.length > 0) {
          const sorted = sortPulls(items);
          setRevealList(sorted);
          setView('revealing');
          setIsSpinning(false);
          setPendingSummon(null);
          setPreSummonedItems(null);
        } else {
          setView('idle');
          setIsSpinning(false);
          setPendingSummon(null);
          setPreSummonedItems(null);
        }
      }, 400); // Reduced from 1200ms to 400ms
    }
  }, [view, pendingSummon, activeBannerId, onSummon, preSummonedItems, triggerFlash]);

  // Progress decay and completion check
  useEffect(() => {
    if (view === 'summoning' && boxProgress > 0 && !isSpinning) {
      if (boxProgress >= 100) {
        startSpin();
        return;
      }
      const timer = setInterval(() => {
        setBoxProgress(prev => Math.max(0, prev - 1.5)); // Decay rate
      }, 50);
      return () => clearInterval(timer);
    }
  }, [view, boxProgress, isSpinning, startSpin]);

  const skipAnimation = useCallback(() => {
    if (view === 'summoning' && pendingSummon) {
      triggerFlash();
      const items = preSummonedItems || onSummon(pendingSummon.count, activeBannerId, pendingSummon.originalCost);
      if (items && items.length > 0) {
        const sorted = sortPulls(items);
        setRevealList(sorted);
        setPendingSummon(null);
        setPreSummonedItems(null);
        if (sorted.length > 1) {
          setView('summary');
        } else {
          setView('revealing');
        }
      } else {
        setView('idle');
        setPendingSummon(null);
        setPreSummonedItems(null);
      }
      return;
    }

    if (revealList.length > 1) {
      setView('summary');
    } else {
      setView('revealing');
    }
  }, [view, pendingSummon, activeBannerId, onSummon, revealList.length]);

  const viewRef = React.useRef(view);
  const currentIndexRef = React.useRef(currentIndex);
  const revealListRef = React.useRef(revealList);

  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { revealListRef.current = revealList; }, [revealList]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDesktop) return;

      const currentView = viewRef.current;
      const currentIdx = currentIndexRef.current;
      const currentList = revealListRef.current;

      if (currentView === 'idle') {
        if (e.key === '1') { handleSummon(1); e.preventDefault(); }
        if (e.key === '2') { handleSummon(5); e.preventDefault(); }
        if (e.key === '3') { handleSummon(10); e.preventDefault(); }
        if (e.key === 'Enter') { handleSummon(1); e.preventDefault(); }
        
        const filteredBanners = BANNERS.filter(b => 
          bannerType === 'standard' ? !b.customWeights : b.customWeights
        );
        
        if (e.key === 'ArrowLeft') {
          const idx = filteredBanners.findIndex(b => b.id === currentBannerId);
          if (idx > 0) onSetBanner(filteredBanners[idx - 1].id);
          e.preventDefault();
        }
        if (e.key === 'ArrowRight') {
          const idx = filteredBanners.findIndex(b => b.id === currentBannerId);
          if (idx < filteredBanners.length - 1) onSetBanner(filteredBanners[idx + 1].id);
          e.preventDefault();
        }
      } else if (currentView === 'summoning') {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBoxTap();
          e.preventDefault();
        }
      } else if (currentView === 'revealing') {
        if (e.key === ' ') {
          const char = currentList[currentIdx];
          if (char) setSelectedChar(char);
          e.preventDefault();
        }
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          if (currentIdx < currentList.length - 1) {
            nextCard();
          } else if (currentList.length > 1) {
            setView('summary');
          } else {
            setView('idle');
          }
          e.preventDefault();
        }
      } else if (currentView === 'summary') {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setView('idle');
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isDesktop, handleSummon, nextCard, startSpin, currentBannerId, onSetBanner]);

  const cardVariants = {
    initial: (direction: number) => ({
      // Forward: from stack (6,6). Backward: from right (600,0)
      x: direction > 0 ? 6 : 600,
      y: direction > 0 ? 6 : 0,
      opacity: direction > 0 ? 1 : 0,
      zIndex: direction > 0 ? 50 : 120,
    }),
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      zIndex: 100,
      transition: {
        x: { type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        y: { type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        opacity: { type: "tween", duration: 0.3, ease: "linear" },
        zIndex: { duration: 0 }
      }
    },
    exit: (direction: number) => ({
      // Forward: to right (600,0). Backward: to stack (6,6)
      x: direction > 0 ? 600 : 6,
      y: direction > 0 ? 0 : 6,
      opacity: direction > 0 ? 0 : 1,
      zIndex: direction > 0 ? 130 : 40,
      transition: {
        x: { type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        y: { type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        opacity: { type: "tween", duration: 0.3, ease: "linear" },
        zIndex: { duration: 0 }
      }
    })
  };

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center h-full relative overflow-hidden">
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0, backgroundColor: '#ffffff' }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              backgroundColor: ['#ffffff', '#ffffff', '#000000', '#000000']
            }}
            transition={{ 
              duration: 1,
              times: [0, 0.1, 0.5, 1],
              ease: "easeInOut"
            }}
            className="fixed inset-0 bg-white z-[200] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full flex flex-col items-center"
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold font-mono mb-1 text-zinc-100">Summon Unichar</h2>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                Select a banner to pull higher level characters
              </p>
            </div>

            {/* Banner Selection Bar */}
            <div className="w-full mb-6 flex flex-col items-center">
              <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
                <button
                  onClick={() => {
                    setBannerType('standard');
                    const first = BANNERS.find(b => !b.customWeights);
                    if (first) onSetBanner(first.id);
                  }}
                  className={`px-6 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                    bannerType === 'standard'
                      ? 'bg-zinc-100 text-zinc-950 shadow-lg'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => {
                    setBannerType('custom');
                    const first = BANNERS.find(b => b.customWeights);
                    if (first) onSetBanner(first.id);
                  }}
                  className={`px-6 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                    bannerType === 'custom'
                      ? 'bg-zinc-100 text-zinc-950 shadow-lg'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Banner Selector */}
            <div className="flex items-center gap-4 mb-8 w-full">
              <div className="w-10 flex justify-center">
                {(() => {
                  const filtered = BANNERS.filter(b => bannerType === 'standard' ? !b.customWeights : b.customWeights);
                  const idx = filtered.findIndex(b => b.id === currentBannerId);
                  if (idx > 0) {
                    return (
                      <button 
                        onClick={() => onSetBanner(filtered[idx - 1].id)}
                        className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="relative w-full border-2 border-zinc-800 rounded-2xl bg-zinc-950 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center group">
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => setShowBannerInfo(!showBannerInfo)}
                      className="p-1 text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">{currentBanner.name}</h3>
                  <p className="text-zinc-500 font-mono text-xs mb-4">{currentBanner.description}</p>
                  
                  {currentBanner.customWeights ? (
                    <div className="w-full space-y-3 flex flex-col items-center">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Featured Outcomes</div>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {(() => {
                          const totalWeight = Object.values(currentBanner.customWeights).reduce((sum, w) => sum + w, 0);
                          return Object.entries(currentBanner.customWeights)
                            .sort(([, a], [, b]) => a - b) // Rarest first
                            .slice(0, 4)
                            .map(([defId, weight]) => {
                              const def = UNICHARS[defId];
                              if (!def) return null;
                              const percentage = (weight / totalWeight) * 100;
                              const trueProb = getProbability(defId);
                              return (
                                <div 
                                  key={defId} 
                                  className="flex flex-col items-center gap-1 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg group/item relative cursor-pointer hover:bg-zinc-800 transition-colors w-14"
                                  onClick={() => setSelectedChar({
                                    instanceId: 'base_preview_' + defId,
                                    defId,
                                    level: 1,
                                    exp: 0,
                                    acquiredAt: Date.now(),
                                    statModifiers: { attack: 1, hp: 1, critChance: 1, spAtk: 1, prodRate: 1 },
                                    moves: []
                                  })}
                                >
                                  <div className="text-xl">{def.char}</div>
                                  <div className={`text-[7px] font-mono font-bold ${getRarityColor(trueProb)}`}>
                                    {percentage.toFixed(1)}%
                                  </div>
                                  <div className="absolute -top-1 -right-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Info size={8} className="text-zinc-400" />
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto flex flex-wrap justify-center gap-1.5">
                      {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'].map(r => {
                        const isExcluded = currentBanner.excludedRarities.includes(r as any);
                        return (
                          <span 
                            key={r}
                            className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full border font-bold font-mono ${
                              isExcluded 
                                ? 'border-zinc-900 text-zinc-800 line-through' 
                                : `border-zinc-800 ${getRarityColor(r)}`
                            }`}
                            title={r}
                          >
                            {r[0]}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-10 flex justify-center">
                {(() => {
                  const filtered = BANNERS.filter(b => bannerType === 'standard' ? !b.customWeights : b.customWeights);
                  const idx = filtered.findIndex(b => b.id === currentBannerId);
                  if (idx < filtered.length - 1) {
                    return (
                      <button 
                        onClick={() => onSetBanner(filtered[idx + 1].id)}
                        className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="w-full space-y-2 relative">
              {freePulls > 0 && currentBannerId === 'rare' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-3 -right-2 bg-zinc-100 text-zinc-950 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-lg z-10 border border-zinc-300 animate-pulse"
                >
                  {freePulls} FREE
                </motion.div>
              )}
              <button
                onClick={() => handleSummon(1)}
                disabled={(freePulls < 1 || currentBannerId !== 'rare') && bits < currentBanner.costPerSummon}
                className={`w-full py-3 rounded-xl font-mono font-bold text-sm transition-all relative group ${
                  ((freePulls >= 1 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon)
                    ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-300 active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {freePulls >= 1 && currentBannerId === 'rare' ? 'Free Summon' : `Summon (${formatNumber(currentBanner.costPerSummon)} Bits)`}
                {isDesktop && ((freePulls >= 1 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] border border-zinc-400 px-1 rounded opacity-50 group-hover:opacity-100">1</span>
                )}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSummon(5)}
                  disabled={(freePulls < 5 || currentBannerId !== 'rare') && bits < currentBanner.costPerSummon * 5}
                  className={`py-3 rounded-xl font-mono font-bold text-xs transition-all relative group ${
                    ((freePulls >= 5 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon * 5)
                      ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-300 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {freePulls >= 5 && currentBannerId === 'rare' ? 'Free 5-Pull' : `5-Pull (${formatNumber(currentBanner.costPerSummon * 5)})`}
                  {isDesktop && ((freePulls >= 5 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon * 5) && (
                    <span className="absolute right-2 top-1 text-[8px] border border-zinc-400 px-1 rounded opacity-50 group-hover:opacity-100">2</span>
                  )}
                </button>
                <button
                  onClick={() => handleSummon(10)}
                  disabled={(freePulls < 10 || currentBannerId !== 'rare') && bits < currentBanner.costPerSummon * 10}
                  className={`py-3 rounded-xl font-mono font-bold text-xs transition-all relative group ${
                    ((freePulls >= 10 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon * 10)
                      ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-300 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {freePulls >= 10 && currentBannerId === 'rare' ? 'Free 10-Pull' : `10-Pull (${formatNumber(currentBanner.costPerSummon * 10)})`}
                  {isDesktop && ((freePulls >= 10 && currentBannerId === 'rare') || bits >= currentBanner.costPerSummon * 10) && (
                    <span className="absolute right-2 top-1 text-[8px] border border-zinc-400 px-1 rounded opacity-50 group-hover:opacity-100">3</span>
                  )}
                </button>
              </div>
              {freePulls > 0 && currentBannerId === 'rare' && (
                <p className="text-center text-[10px] font-mono text-zinc-400 mt-2">
                  Free Pulls Remaining: <span className="text-zinc-100 font-bold">{freePulls}</span>
                </p>
              )}
            </div>
            
            {isDesktop && (
              <p className="mt-4 text-[10px] text-zinc-600 font-mono">
                Arrow keys to switch banners
              </p>
            )}
          </motion.div>
        )}

        {view !== 'idle' && (
          <motion.div 
            key="gacha-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={skipAnimation}
              className="absolute top-6 right-6 px-4 py-2 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors z-10"
            >
              Skip
            </button>

            <AnimatePresence mode="wait" custom={direction}>
              {view === 'summoning' && (
                <motion.div 
                  key="summoning"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-64 h-2 bg-zinc-900 rounded-full mb-8 overflow-hidden border border-zinc-800">
                    <motion.div 
                      className="h-full bg-zinc-100"
                      animate={{ width: `${boxProgress}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  </div>

                  <motion.div 
                    key={tapKey}
                    onClick={handleBoxTap}
                    initial={tapCount > 0 ? { scale: 1 + (boxProgress / 100) * 0.15 } : { scale: 1 }}
                    animate={isUpgrading ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0],
                      borderColor: ['#27272a', '#f4f4f5', '#27272a']
                    } : tapCount > 0 ? {
                      scale: [1 + (boxProgress / 100) * 0.15, 1 + (boxProgress / 100) * 0.3, 1 + (boxProgress / 100) * 0.15],
                      rotate: [0, -(boxProgress / 100) * 10, (boxProgress / 100) * 10, -(boxProgress / 100) * 10, (boxProgress / 100) * 10, 0],
                      filter: `brightness(${1 + (boxProgress / 100) * 0.8})`,
                    } : {}}
                    transition={{ duration: 0.15 }}
                    className={`w-48 h-48 border-2 ${isUpgrading ? 'border-zinc-100' : 'border-zinc-800'} rounded-2xl bg-zinc-950 flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-all group relative`}
                  >
                    <div className={`text-6xl font-bold font-mono ${isUpgrading ? 'text-zinc-100' : 'text-zinc-700'} group-hover:text-zinc-500 transition-colors`}>
                      ?
                    </div>
                    
                    {isUpgrading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -60 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 text-zinc-100 font-mono text-xs font-bold"
                      >
                        BANNER UPGRADE!
                      </motion.div>
                    )}
                  </motion.div>
                  <p className="mt-8 text-zinc-500 font-mono text-sm">
                    {isSpinning ? "Opening..." : `Tap fast to open! (${tapCount}/5)`}
                  </p>
                  <p className="mt-2 text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                    Current: {currentBanner.name}
                  </p>
                </motion.div>
              )}

              {view === 'revealing' && (
                <motion.div 
                  key="revealing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center w-full max-w-md"
                >
                  <div className="mb-4 flex flex-col items-center">
                    <div className="text-zinc-100 font-mono text-sm font-bold uppercase tracking-widest">
                      {currentBanner.name}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'].map(rarity => {
                        const isExcluded = currentBanner.excludedRarities.includes(rarity as any);
                        if (isExcluded) return null;
                        return (
                          <span key={rarity} className={`text-[8px] font-mono px-1 border border-zinc-800 rounded ${getRarityColor(rarity as any)}`}>
                            {rarity[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-4 text-zinc-500 font-mono text-xs">
                    {currentIndex + 1} / {revealList.length}
                  </div>

                  <div className="flex flex-col items-center gap-8 w-full justify-center perspective-1000">
                    <div className="relative w-64 h-80 perspective-1000">
                      {/* Stack effect: show cards behind */}
                      {revealList.map((char, index) => {
                        // If we are moving backward, the card at currentIndex + 1 is currently 
                        // animating back into the stack via AnimatePresence.
                        // We should hide it in the stack loop to avoid double rendering.
                        if (index === currentIndex + 1 && direction === -1) return null;

                        // Only render cards strictly behind the current one
                        if (index <= currentIndex || index > currentIndex + 3) return null;
                        const offset = index - currentIndex;
                        const def = UNICHARS[char.defId];
                        return (
                          <motion.div 
                            key={`stack-${char.instanceId}`}
                            initial={false}
                            animate={{ 
                              x: offset * 6, 
                              y: offset * 6,
                              opacity: 1 - offset * 0.1,
                              zIndex: 30 - offset
                            }}
                            transition={{ 
                              type: "tween",
                              duration: 0.4, 
                              ease: [0.23, 1, 0.32, 1] 
                            }}
                            className="absolute inset-0 border-2 border-zinc-800 rounded-2xl bg-zinc-900 shadow-xl flex flex-col items-center justify-center"
                          >
                            <div className="text-6xl font-bold text-zinc-800/50">{def.char}</div>
                          </motion.div>
                        );
                      })}

                      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div 
                          key={currentIndex}
                          custom={direction}
                          variants={cardVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          onClick={() => setSelectedChar(revealList[currentIndex])}
                          className="absolute inset-0 flex flex-col items-center justify-center border-2 border-zinc-700 rounded-2xl bg-zinc-900 shadow-2xl cursor-pointer hover:border-zinc-500 transition-all overflow-hidden"
                        >
                          {(() => {
                            const char = revealList[currentIndex];
                            if (!char) return null;
                            const def = UNICHARS[char.defId];
                            const prob = getProbability(def.id);
                            const tier = getAverageTier(char.statModifiers);
                            const isNewChar = isNew(char.defId);
                            return (
                              <>
                                {isNewChar && (
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: -5 }}
                                    className="absolute top-4 left-4 bg-zinc-100 text-zinc-950 px-2 py-1 rounded font-mono text-[10px] font-bold shadow-lg z-10"
                                  >
                                    NEW!
                                  </motion.div>
                                )}
                                <div className="text-8xl font-bold text-zinc-100 mb-2">{def.char}</div>
                                {char.nickname && (
                                  <div className="text-sm font-mono text-zinc-300 mb-2 italic">
                                    "{char.nickname}"
                                  </div>
                                )}
                                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                                  {def.classes.join(' • ')}
                                </div>
                                <div className={`text-xs font-mono uppercase tracking-widest ${getRarityColor(prob)}`}>
                                  {getRarityLabel(prob)} ({prob.toFixed(1)}%)
                                </div>
                                <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">
                                  Stats Rating: <span className="text-zinc-100 font-bold">{tier}</span>
                                </div>
                              </>
                            );
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {revealList.length > 1 && (
                      <button 
                        onClick={nextCard}
                        className="p-4 rounded-full border border-zinc-800 hover:bg-zinc-900 text-zinc-100 bg-zinc-900 shadow-xl transition-all active:scale-90"
                      >
                        <ChevronRight size={32} />
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={nextCard}
                    className="mt-12 px-12 py-3 bg-zinc-100 text-zinc-950 rounded-xl font-mono font-bold hover:bg-zinc-300 transition-colors"
                  >
                    {currentIndex < revealList.length - 1 ? 'Next' : (revealList.length > 1 ? 'Show Summary' : 'Done')}
                  </button>
                  
                  {isDesktop && (
                    <p className="mt-4 text-[10px] text-zinc-600 font-mono">
                      {revealList.length > 1 ? 'Enter to next • Space for details' : 'Enter to finish • Space for details'}
                    </p>
                  )}
                </motion.div>
              )}

              {view === 'summary' && (
                <motion.div 
                  key="summary"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col items-center w-full max-w-2xl h-full py-12"
                >
                  <h2 className="text-2xl font-bold font-mono mb-8 text-zinc-100">Summon Summary</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full overflow-y-auto px-4 pb-20">
                    {[...revealList].sort((a, b) => {
                      const newA = isNew(a.defId);
                      const newB = isNew(b.defId);
                      
                      // New first
                      if (newA !== newB) return newA ? -1 : 1;
                      
                      // Then rarity (rarer first)
                      const probA = getProbability(a.defId);
                      const probB = getProbability(b.defId);
                      return probA - probB;
                    }).map((char, i) => {
                      const def = UNICHARS[char.defId];
                      const prob = getProbability(def.id);
                      const tier = getAverageTier(char.statModifiers);
                      const isNewChar = isNew(char.defId);
                      return (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedChar(char)}
                          className="aspect-square border border-zinc-800 rounded-xl bg-zinc-900/50 flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-zinc-800 transition-colors relative group"
                        >
                          {isNewChar && (
                            <div className="absolute top-2 left-2 bg-zinc-100 text-zinc-950 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono shadow-lg z-10">
                              NEW!
                            </div>
                          )}
                          <div className="text-3xl font-bold text-zinc-100 mb-1">{def.char}</div>
                          <div className={`text-[8px] font-mono uppercase ${getRarityColor(prob)}`}>
                            {getRarityLabel(prob)}
                          </div>
                          <div className="text-[8px] font-mono text-zinc-500">
                            Rating: <span className="text-zinc-300">{tier}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setView('idle')}
                    className="mt-auto px-12 py-4 bg-zinc-100 text-zinc-950 rounded-xl font-mono font-bold hover:bg-zinc-300 transition-colors"
                  >
                    Finish
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {showBannerInfo && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-bottom border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold font-mono text-zinc-100">{currentBanner.name}</h3>
                <p className="text-zinc-500 font-mono text-xs">Possible Characters</p>
              </div>
              <button 
                onClick={() => setShowBannerInfo(false)}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Object.values(UNICHARS)
                  .filter(u => {
                    if (currentBanner.customWeights) {
                      return !!currentBanner.customWeights[u.id];
                    }
                    return !currentBanner.excludedRarities.includes(getRarityLabel(getProbability(u.id)) as any);
                  })
                  .sort((a, b) => {
                    if (currentBanner.customWeights) {
                      return (currentBanner.customWeights[b.id] || 0) - (currentBanner.customWeights[a.id] || 0);
                    }
                    return getProbability(a.id) - getProbability(b.id);
                  })
                  .map(def => {
                    const prob = getProbability(def.id);
                    const hasPulled = inventory.some(u => u.defId === def.id);
                    return (
                      <div 
                        key={def.id}
                        className={`aspect-square border rounded-lg flex flex-col items-center justify-center p-1 transition-all ${
                          hasPulled 
                            ? 'border-zinc-800 bg-zinc-900/50' 
                            : 'border-zinc-900 bg-zinc-950 opacity-30 grayscale'
                        }`}
                      >
                        <div className="text-xl font-bold text-zinc-100 leading-none mb-0.5">{def.char}</div>
                        <div className={`text-[6px] font-mono uppercase tracking-tighter ${getRarityColor(prob)}`}>
                          {currentBanner.customWeights ? `${((currentBanner.customWeights[def.id] / Object.values(currentBanner.customWeights).reduce((a,b)=>a+b,0)) * 100).toFixed(1)}%` : getRarityLabel(prob)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Dimmed characters have not been pulled yet
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {selectedChar && (
        <UnicharDetails 
          char={selectedChar} 
          onClose={() => setSelectedChar(null)} 
          onUpdate={onUpdateUnichar}
        />
      )}
    </div>
  );
};
