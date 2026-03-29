import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Dna,
  Sword
} from 'lucide-react';
import { UNICHARS, getProbability, CLASSES } from '../../data/unichars';
import { PlayerUnichar, StatModifiers } from '../../types';
import { getRarityColor, getRarityLabel, getAverageTier, getTierValue, getTierFromModifier } from '../../lib/gameMath';
import { UnicharDetails } from '../UnicharDetails';
import { MOVES } from '../../data/moves';

interface UpgradeTabProps {
  inventory: PlayerUnichar[];
  onUpgrade: (targetId: string, fodderId: string, mode: 'all' | 'stat' | 'move', statKey?: keyof StatModifiers, moveIndex?: number) => void;
  idleSlots: (string | null)[];
  tabSettings: any;
  onUpdateSettings: (updates: any) => void;
}

type UpgradeView = 'idle' | 'upgrading' | 'result';
type UpgradeMode = 'all' | 'stat' | 'move';

export const UpgradeTab: React.FC<UpgradeTabProps> = ({
  inventory,
  onUpgrade,
  idleSlots,
  tabSettings,
  onUpdateSettings
}) => {
  const [view, setView] = useState<UpgradeView>('idle');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [fodderId, setFodderId] = useState<string | null>(null);
  const [mode, setMode] = useState<UpgradeMode>('all');
  const [selectedStat, setSelectedStat] = useState<keyof StatModifiers | null>(null);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  
  const [isSelecting, setIsSelecting] = useState<'target' | 'fodder' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [inspectingUnichar, setInspectingUnichar] = useState<PlayerUnichar | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [lastUpgradeResult, setLastUpgradeResult] = useState<{ before: any, after: any } | null>(null);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 1200);
  }, []);

  const target = useMemo(() => 
    inventory.find(u => u.instanceId === targetId) || null
  , [inventory, targetId]);

  const fodder = useMemo(() => 
    inventory.find(u => u.instanceId === fodderId) || null
  , [inventory, fodderId]);

  useEffect(() => {
    if (target && fodder && target.defId !== fodder.defId) {
      setFodderId(null);
    }
  }, [target, fodder]);

  const startUpgrade = useCallback(() => {
    if (targetId && fodderId && target) {
      const before = { 
        statModifiers: { ...target.statModifiers },
        moves: [...target.moves]
      };
      setLastUpgradeResult({ before, after: null });
      setView('upgrading');
      triggerFlash();
      
      setTimeout(() => {
        onUpgrade(targetId, fodderId, mode, selectedStat || undefined, selectedMoveIndex ?? undefined);
        setFodderId(null);
      }, 1200);
    }
  }, [targetId, fodderId, target, mode, selectedStat, selectedMoveIndex, onUpgrade, triggerFlash]);

  useEffect(() => {
    if (view === 'upgrading' && targetId && lastUpgradeResult?.before) {
      const updatedTarget = inventory.find(u => u.instanceId === targetId);
      if (updatedTarget) {
        const statsChanged = JSON.stringify(updatedTarget.statModifiers) !== JSON.stringify(lastUpgradeResult.before.statModifiers);
        const movesChanged = JSON.stringify(updatedTarget.moves) !== JSON.stringify(lastUpgradeResult.before.moves);
        
        if (statsChanged || movesChanged) {
          setLastUpgradeResult({
            before: lastUpgradeResult.before,
            after: { 
              statModifiers: { ...updatedTarget.statModifiers },
              moves: [...updatedTarget.moves]
            }
          });
          setView('result');
        }
      }
    }
  }, [inventory, view, targetId, lastUpgradeResult]);

  const handleBackToIdle = useCallback(() => {
    setView('idle');
    setTargetId(null);
    setLastUpgradeResult(null);
    setSelectedStat(null);
    setSelectedMoveIndex(null);
  }, []);

  const getRarityInfo = (defId: string) => {
    const prob = getProbability(defId);
    return {
      label: getRarityLabel(prob),
      color: getRarityColor(prob)
    };
  };

  const getRarityBg = (defId: string) => {
    const prob = getProbability(defId);
    if (prob < 0.2) return 'bg-pink-500/10 border-pink-500/20';
    if (prob < 0.5) return 'bg-yellow-500/10 border-yellow-500/20';
    if (prob < 1) return 'bg-purple-500/10 border-purple-500/20';
    if (prob < 3) return 'bg-blue-500/10 border-blue-500/20';
    if (prob < 5) return 'bg-green-500/10 border-green-500/20';
    return 'bg-zinc-500/10 border-zinc-500/20';
  };

  const sortedInventory = useMemo(() => {
    let filtered = [...inventory];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        UNICHARS[u.defId].name.toLowerCase().includes(q) ||
        UNICHARS[u.defId].char.includes(q)
      );
    }
    if (filterClass) {
      filtered = filtered.filter(u => UNICHARS[u.defId].classes.includes(filterClass as any));
    }
    if (filterRarity) {
      filtered = filtered.filter(u => getRarityLabel(getProbability(u.defId)) === filterRarity);
    }
    return filtered.sort((a, b) => {
      const probA = getProbability(a.defId);
      const probB = getProbability(b.defId);
      if (probA !== probB) return probA - probB;
      const tierA = getTierValue(getAverageTier(a.statModifiers));
      const tierB = getTierValue(getAverageTier(b.statModifiers));
      if (tierA !== tierB) return tierB - tierA;
      return b.level - a.level;
    });
  }, [inventory, searchQuery, filterClass, filterRarity]);

  const selectableFodder = useMemo(() => {
    if (!target) return [];
    return sortedInventory.filter(u => 
      u.defId === target.defId && u.instanceId !== target.instanceId
    );
  }, [target, sortedInventory]);

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center h-full relative overflow-hidden">
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0, backgroundColor: '#ffffff' }}
            animate={{ opacity: [0, 1, 1, 0], backgroundColor: ['#ffffff', '#ffffff', '#000000', '#000000'] }}
            transition={{ duration: 1, times: [0, 0.1, 0.5, 1], ease: "easeInOut" }}
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
            className="max-w-4xl w-full flex flex-col items-center"
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-zinc-100 font-mono mb-1">Unichar Upgrading</h2>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                Consume duplicates to enhance your Unichars
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-full">
              {/* Left: Target & Fodder */}
              <div className="flex flex-col items-center space-y-8">
                <div className="flex items-center gap-8">
                  {/* Target Box */}
                  <div className="flex flex-col items-center space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Target</span>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSelecting('target')}
                      className={`w-40 h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                        target ? `${getRarityBg(target.defId)} border-solid` : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                      }`}
                    >
                      {target ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setInspectingUnichar(target); }}
                            className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors z-10"
                          >
                            <Info size={14} className="text-zinc-400" />
                          </button>
                          <div className="text-6xl font-bold font-mono text-zinc-100 mb-2">{UNICHARS[target.defId].char}</div>
                          <div className="text-center px-2">
                            <div className={`text-sm font-bold truncate font-mono ${getRarityInfo(target.defId).color}`}>{UNICHARS[target.defId].name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">Lv.{target.level}</div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center"><Plus className="w-6 h-6 text-zinc-600 mb-2" /><span className="text-[10px] font-bold text-zinc-600 uppercase font-mono">Select Target</span></div>
                      )}
                    </motion.div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-zinc-800 mt-8" />

                  {/* Fodder Box */}
                  <div className="flex flex-col items-center space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Fodder</span>
                    <motion.div
                      whileHover={target ? { scale: 1.02 } : {}}
                      whileTap={target ? { scale: 0.98 } : {}}
                      onClick={() => target && setIsSelecting('fodder')}
                      className={`w-40 h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                        !target ? 'border-zinc-900 bg-zinc-950 cursor-not-allowed opacity-50' :
                        fodder ? `${getRarityBg(fodder.defId)} border-solid cursor-pointer` : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 cursor-pointer'
                      }`}
                    >
                      {fodder ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setInspectingUnichar(fodder); }}
                            className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors z-10"
                          >
                            <Info size={14} className="text-zinc-400" />
                          </button>
                          <div className="text-6xl font-bold font-mono text-zinc-100 mb-2">{UNICHARS[fodder.defId].char}</div>
                          <div className="text-center px-2">
                            <div className={`text-sm font-bold truncate font-mono ${getRarityInfo(fodder.defId).color}`}>{UNICHARS[fodder.defId].name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">Lv.{fodder.level}</div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center"><RefreshCw className="w-6 h-6 text-zinc-600 mb-2" /><span className="text-[10px] font-bold text-zinc-600 uppercase font-mono text-center px-4">{target ? 'Select Fodder' : 'Select Target First'}</span></div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Mode Selection */}
                {target && fodder && (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <button 
                      onClick={() => setMode('all')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${mode === 'all' ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      <RefreshCw size={16} />
                      <span className="text-[9px] font-bold uppercase font-mono">Reroll All</span>
                    </button>
                    <button 
                      onClick={() => setMode('stat')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${mode === 'stat' ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      <Dna size={16} />
                      <span className="text-[9px] font-bold uppercase font-mono">Transfer Stat</span>
                    </button>
                    <button 
                      onClick={() => setMode('move')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${mode === 'move' ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      <Sword size={16} />
                      <span className="text-[9px] font-bold uppercase font-mono">Modify Move</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Mode Details */}
              <div className="w-full lg:w-80">
                {target && fodder ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 h-full flex flex-col">
                    {mode === 'all' && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-800 pb-2">Reroll All Stats</div>
                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                          Completely rerolls all stat modifiers for the target Unichar. This is high risk but can result in a perfect Unichar.
                        </p>
                        <div className="space-y-2">
                          {(Object.entries(target.statModifiers) as [keyof StatModifiers, number][]).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-zinc-500 uppercase">{key}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-600">{val.toFixed(2)}x</span>
                                <span className={getRarityColor(getTierValue(getTierFromModifier(val)))}>{getTierFromModifier(val)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === 'stat' && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-800 pb-2">Transfer Stat</div>
                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                          Select one stat from the fodder to transfer to the target. This will overwrite the target's current stat.
                        </p>
                        <div className="space-y-1">
                          {(Object.entries(fodder.statModifiers) as [keyof StatModifiers, number][]).map(([key, val]) => {
                            const fodderVal = val;
                            const targetVal = target.statModifiers[key];
                            const fodderTier = getTierFromModifier(fodderVal);
                            const targetTier = getTierFromModifier(targetVal);
                            const isBetter = fodderVal > targetVal;
                            
                            return (
                              <button 
                                key={key}
                                onClick={() => setSelectedStat(key as keyof StatModifiers)}
                                className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between ${selectedStat === key ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                              >
                                <span className="text-[9px] uppercase font-mono">{key}</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[8px] opacity-50">{targetVal.toFixed(2)}x</span>
                                    <span className="text-[8px] opacity-30">{targetTier}</span>
                                  </div>
                                  <ArrowRight size={8} />
                                  <div className="flex flex-col items-end">
                                    <span className={`text-[10px] font-bold ${isBetter ? 'text-green-500' : ''}`}>{fodderVal.toFixed(2)}x</span>
                                    <span className={`text-[8px] ${isBetter ? 'text-green-500/50' : 'opacity-30'}`}>{fodderTier}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mode === 'move' && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-800 pb-2">Modify Move</div>
                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                          Add a new move or replace an existing one. The new move will be randomly selected from the Unichar's possible move pool.
                        </p>
                        <div className="space-y-2">
                          {target.moves.map((moveId, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setSelectedMoveIndex(idx)}
                              className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between ${selectedMoveIndex === idx ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold font-mono">{MOVES[moveId]?.name || 'Unknown'}</span>
                                <span className="text-[8px] opacity-50 uppercase font-mono">Slot {idx + 1}</span>
                              </div>
                              <RefreshCw size={10} />
                            </button>
                          ))}
                          {target.moves.length < 4 && (
                            <button 
                              onClick={() => setSelectedMoveIndex(target.moves.length)}
                              className={`w-full p-2 rounded-lg border border-dashed text-center transition-all ${selectedMoveIndex === target.moves.length ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                            >
                              <Plus size={12} className="mx-auto" />
                              <span className="text-[9px] uppercase font-mono">Add New Move</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startUpgrade}
                        disabled={(mode === 'stat' && !selectedStat) || (mode === 'move' && selectedMoveIndex === null)}
                        className={`w-full py-3 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center space-x-2 font-mono ${
                          (mode === 'stat' && !selectedStat) || (mode === 'move' && selectedMoveIndex === null)
                            ? 'bg-zinc-800 text-zinc-700 cursor-not-allowed'
                            : 'bg-zinc-100 text-zinc-950 hover:bg-white'
                        }`}
                      >
                        <Zap size={14} className="animate-pulse" />
                        <span>Confirm Upgrade</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
                    <Info size={24} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-mono uppercase tracking-wider">Select a target and fodder to see upgrade options</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'upgrading' && (
          <motion.div key="upgrading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-4 border-zinc-800 border-t-zinc-100" />
              <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-12 h-12 text-zinc-100 animate-pulse" /></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-zinc-100 font-mono mb-2 uppercase tracking-widest">Upgrading...</h3>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Merging data streams</p>
            </div>
          </motion.div>
        )}

        {view === 'result' && lastUpgradeResult && target && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-zinc-100 font-mono uppercase tracking-tighter">Upgrade Successful!</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-2">The Unichar has evolved</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className={`w-48 h-64 rounded-3xl border-2 ${getRarityBg(target.defId)} border-solid flex flex-col items-center justify-center shadow-2xl`}>
                <div className="text-8xl font-bold font-mono text-zinc-100 mb-4">{UNICHARS[target.defId].char}</div>
                <div className="text-center px-4">
                  <div className={`text-lg font-bold truncate font-mono ${getRarityInfo(target.defId).color}`}>{UNICHARS[target.defId].name}</div>
                  <div className="text-xs text-zinc-500 font-mono">Lv.{target.level}</div>
                </div>
              </div>

              <div className="w-80 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
                    {lastUpgradeResult.after.moves.length !== lastUpgradeResult.before.moves.length || 
                     JSON.stringify(lastUpgradeResult.after.moves) !== JSON.stringify(lastUpgradeResult.before.moves) 
                     ? 'Moves Updated' : 'Stats Updated'}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono text-zinc-600">{getAverageTier(lastUpgradeResult.before.statModifiers)}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-700" />
                    <span className={`text-sm font-bold font-mono ${getTierValue(getAverageTier(lastUpgradeResult.after.statModifiers)) > getTierValue(getAverageTier(lastUpgradeResult.before.statModifiers)) ? 'text-green-400' : 'text-zinc-100'}`}>
                      {getAverageTier(lastUpgradeResult.after.statModifiers)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {lastUpgradeResult.after.moves.length !== lastUpgradeResult.before.moves.length || 
                   JSON.stringify(lastUpgradeResult.after.moves) !== JSON.stringify(lastUpgradeResult.before.moves) ? (
                    <div className="space-y-2">
                      {lastUpgradeResult.after.moves.map((moveId: string, idx: number) => {
                        const oldMoveId = lastUpgradeResult.before.moves[idx];
                        const isNew = moveId !== oldMoveId;
                        return (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Slot {idx + 1}</span>
                            <div className="flex items-center space-x-3">
                              {oldMoveId && <span className="text-[10px] font-mono text-zinc-600 line-through">{MOVES[oldMoveId]?.name}</span>}
                              {oldMoveId && <ArrowRight className="w-3 h-3 text-zinc-800" />}
                              <span className={`text-xs font-mono font-bold ${isNew ? 'text-green-400' : 'text-zinc-100'}`}>{MOVES[moveId]?.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    (Object.keys(lastUpgradeResult.before.statModifiers) as (keyof StatModifiers)[]).map((key) => {
                      const before = lastUpgradeResult.before.statModifiers[key];
                      const after = lastUpgradeResult.after.statModifiers[key];
                      const tierBefore = getTierFromModifier(before);
                      const tierAfter = getTierFromModifier(after);
                      const isBetter = after > before;
                      const isWorse = after < before;

                      return (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{key}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] font-mono text-zinc-600">{before.toFixed(2)}x</span>
                              <span className="text-[8px] font-mono text-zinc-700">{tierBefore}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-zinc-800" />
                            <div className="flex items-center space-x-1 min-w-[60px] justify-end">
                              <div className="flex flex-col items-end">
                                <span className={`text-xs font-mono font-bold ${isBetter ? 'text-green-400' : isWorse ? 'text-red-400' : 'text-zinc-100'}`}>{after.toFixed(2)}x</span>
                                <span className={`text-[8px] font-mono ${isBetter ? 'text-green-400/50' : isWorse ? 'text-red-400/50' : 'text-zinc-500'}`}>{tierAfter}</span>
                              </div>
                              {isBetter && <ChevronUp className="w-3 h-3 text-green-400" />}
                              {isWorse && <ChevronDown className="w-3 h-3 text-red-400" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBackToIdle} className="mt-8 px-12 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-zinc-100 font-mono hover:bg-zinc-800 transition-colors">
              Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Modal */}
      <AnimatePresence>
        {isSelecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelecting(null)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100">{isSelecting === 'target' ? 'Select Target Unichar' : `Select Fodder for ${UNICHARS[target!.defId].name}`}</h3>
                    <p className="text-sm text-zinc-500">{isSelecting === 'target' ? 'Choose the Unichar you want to improve' : 'Choose a duplicate to consume'}</p>
                  </div>
                  <button onClick={() => setIsSelecting(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6 text-zinc-400" /></button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="text" placeholder="Search by name or character..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors" />
                  </div>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <select value={filterClass || ''} onChange={(e) => setFilterClass(e.target.value || null)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-zinc-600">
                      <option value="">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={filterRarity || ''} onChange={(e) => setFilterRarity(e.target.value || null)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-zinc-600">
                      <option value="">All Rarities</option>
                      {['Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {(isSelecting === 'target' ? sortedInventory : selectableFodder).map((u) => {
                    const def = UNICHARS[u.defId];
                    const isSelected = isSelecting === 'target' ? targetId === u.instanceId : fodderId === u.instanceId;
                    const tier = getAverageTier(u.statModifiers);
                    const isInIdle = idleSlots.includes(u.instanceId);
                    return (
                      <motion.div key={u.instanceId} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center cursor-pointer transition-all relative group ${isSelected ? 'border-zinc-100 bg-zinc-800' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`} onClick={() => {
                        if (isSelecting === 'fodder' && isInIdle) { if (!window.confirm(`Warning: ${def.name} is currently assigned to an Idle slot. Using it as fodder will remove it from the slot. Proceed?`)) return; }
                        if (isSelecting === 'target') setTargetId(u.instanceId); else setFodderId(u.instanceId);
                        setIsSelecting(null);
                      }}>
                        <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">{def.char}</div>
                        <div className={`text-[10px] font-bold truncate w-full text-center ${getRarityInfo(u.defId).color}`}>{def.name}</div>
                        <div className="absolute top-1 right-1 flex flex-col items-end space-y-0.5">
                          <div className="text-[8px] font-mono text-zinc-500">Lv.{u.level}</div>
                          <div className={`text-[10px] font-black ${tier === 'S' ? 'text-yellow-400' : tier === 'A' ? 'text-purple-400' : tier === 'B' ? 'text-blue-400' : tier === 'C' ? 'text-green-400' : tier === 'D' ? 'text-zinc-400' : 'text-red-400'}`}>{tier}</div>
                        </div>
                        {isInIdle && <div className="absolute top-1 left-1"><AlertCircle className="w-3 h-3 text-red-500" /></div>}
                        <button onClick={(e) => { e.stopPropagation(); setInspectingUnichar(u); }} className="absolute bottom-1 right-1 p-1 bg-zinc-900/80 rounded-md border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800"><Info className="w-3 h-3 text-zinc-400" /></button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {inspectingUnichar && <UnicharDetails char={inspectingUnichar} onClose={() => setInspectingUnichar(null)} />}
    </div>
  );
};
