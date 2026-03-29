import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerUnichar } from '../types';
import { UNICHARS, getProbability } from '../data/unichars';
import { MOVES } from '../data/moves';
import { getFullStats, getLevelUpCost, getTierFromModifier, getAverageTier, formatNumber, getUnicharValue } from '../lib/gameMath';

interface UnicharDetailsProps {
  char: PlayerUnichar;
  onClose: () => void;
  onUpdate?: (instanceId: string, updates: Partial<Pick<PlayerUnichar, 'nickname' | 'notes'>>) => void;
  onSell?: (instanceId: string) => void;
  isStacked?: boolean;
  instances?: PlayerUnichar[];
}

export const UnicharDetails: React.FC<UnicharDetailsProps> = ({ char, onClose, onUpdate, onSell, isStacked, instances }) => {
  const [nickname, setNickname] = useState(char.nickname || '');
  const [notes, setNotes] = useState(char.notes || '');
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);

  const def = UNICHARS[char.defId];
  if (!def) return null;

  const isBaseMode = char.instanceId.startsWith('base_');

  // For stacked view or base mode, show base stats at level 1
  const displayChar = (isStacked || isBaseMode) ? { ...char, level: 1, statModifiers: { attack: 1, hp: 1, critChance: 1, spAtk: 1, prodRate: 1 } } : char;
  const stats = getFullStats(displayChar, def);
  const cost = getLevelUpCost(char.level, def.baseStats.wisdom);
  const prob = getProbability(char.defId);
  const expPercent = Math.min(100, (char.exp / cost) * 100);

  const earliestAcquired = isStacked && instances 
    ? Math.min(...instances.map(i => i.acquiredAt || Infinity))
    : char.acquiredAt;

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(char.instanceId, { nickname, notes });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      if (isTyping) return;

      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      (e.target as HTMLElement).blur();
    }
  };

  const sellPrice = getUnicharValue(char, def);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {showSellConfirm && (
          <div className="absolute inset-0 bg-zinc-950/95 z-[60] flex flex-col items-center justify-center p-6 text-center">
            <div className="text-red-400 font-mono text-sm mb-4">
              Are you sure you want to sell {char.nickname || def.name} for {formatNumber(sellPrice)} bits?
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowSellConfirm(false)}
                className="flex-1 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSell) {
                    onSell(char.instanceId);
                    onClose();
                  }
                }}
                className="flex-1 py-2 rounded bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-500/30"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        )}

        <div className="p-6 flex flex-col items-center border-b border-zinc-800 bg-zinc-900/50">
          {!isStacked && (
            <div className="w-full mb-4 flex justify-between items-center gap-2">
              <input
                type="text"
                placeholder="Set Nickname..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-600"
              />
              <div className="text-[10px] font-mono text-zinc-500">
                ID: {char.instanceId.slice(0, 8)}
              </div>
            </div>
          )}
          <div className="text-6xl font-bold text-zinc-100 mb-2">{def.char}</div>
          <div className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-1">
            {def.name}
          </div>
          {!isStacked ? (
            <>
              <div className="text-xs font-mono text-zinc-500 mb-2">
                Level {char.level}
              </div>
              <div className="w-full max-w-[200px] bg-zinc-950 rounded-full h-2 border border-zinc-800 overflow-hidden">
                <div className="bg-zinc-400 h-full transition-all duration-300" style={{ width: `${expPercent}%` }} />
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1">
                {Math.floor(char.exp)} / {cost} EXP
              </div>
            </>
          ) : (
            <div className="text-xs font-mono text-zinc-500 mb-2">
              Base Stats (Lv.1)
            </div>
          )}
          <div className="mt-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Stats Rating: <span className="text-zinc-100 font-bold">{isStacked ? 'B' : getAverageTier(char.statModifiers)}</span>
          </div>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs sm:text-sm overflow-y-auto max-h-[40vh]">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Acquired</span>
            <span className="text-zinc-400 text-[10px]">{formatDate(earliestAcquired)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Rarity</span>
            <span className="text-blue-400">{prob.toFixed(2)}%</span>
          </div>
          {!isStacked && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Value</span>
              <span className="text-yellow-500 font-bold">{formatNumber(sellPrice)} bits</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Production</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">[{getTierFromModifier(displayChar.statModifiers.prodRate)}]</span>
              <span className="text-green-500">+{stats.prodRate.toFixed(1)}/s</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Attack</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">[{getTierFromModifier(displayChar.statModifiers.attack)}]</span>
              <span className="text-zinc-100">{stats.attack}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">HP</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">[{getTierFromModifier(displayChar.statModifiers.hp)}]</span>
              <span className="text-zinc-100">{stats.hp}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Sp. Attack</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">[{getTierFromModifier(displayChar.statModifiers.spAtk)}]</span>
              <span className="text-zinc-100">{stats.spAtk}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Crit Chance</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">[{getTierFromModifier(displayChar.statModifiers.critChance)}]</span>
              <span className="text-zinc-100">{(stats.critChance * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Classes</span>
            <span className="text-zinc-100 text-[10px]">{def.classes.join(', ')}</span>
          </div>

          {!isStacked && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="text-zinc-500 mb-2 text-[10px] uppercase tracking-widest">
                {isBaseMode ? 'Possible Moves' : `Moves (${char.moves?.length || 0})`}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(isBaseMode ? def.possibleMoves.map(m => m.moveId) : char.moves || []).map(moveId => {
                  const move = MOVES[moveId];
                  if (!move) return null;
                  
                  const moveSlot = def.possibleMoves.find(m => m.moveId === moveId);
                  const totalWeight = def.possibleMoves.reduce((sum, m) => sum + m.chance, 0);
                  const prob = moveSlot ? (moveSlot.chance / totalWeight) * 100 : 0;

                  return (
                    <button 
                      key={moveId} 
                      onClick={() => setSelectedMoveId(selectedMoveId === moveId ? null : moveId)}
                      className={`bg-zinc-900/50 border ${selectedMoveId === moveId ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800/50'} rounded p-2 flex flex-col text-left transition-all hover:border-zinc-700`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-100 text-[10px] font-bold truncate">{move.name}</span>
                        <span className="text-[8px] text-zinc-500">{move.power}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-zinc-600 uppercase">{move.type}</span>
                        {isBaseMode && (
                          <span className="text-[8px] text-blue-400/70">{prob.toFixed(1)}%</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedMoveId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-2 bg-zinc-900 rounded border border-zinc-800">
                      <div className="text-[10px] text-zinc-100 font-bold mb-1">{MOVES[selectedMoveId].name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                        {MOVES[selectedMoveId].description}
                      </div>
                      <div className="mt-2 flex gap-3">
                        <div className="text-[9px] text-zinc-500">
                          Power: <span className="text-zinc-300">{MOVES[selectedMoveId].power}%</span>
                        </div>
                        <div className="text-[9px] text-zinc-500">
                          Accuracy: <span className="text-zinc-300">{MOVES[selectedMoveId].accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800">
            {isStacked && instances ? (
              <>
                <div className="text-zinc-500 mb-2 text-[10px] uppercase tracking-widest">Instances ({instances.length})</div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {instances.map(inst => (
                    <div key={inst.instanceId} className="flex justify-between items-center text-[10px] bg-zinc-900/50 p-1 rounded border border-zinc-800/50">
                      <span className="text-zinc-300 truncate max-w-[100px]">{inst.nickname || 'No Nickname'}</span>
                      <span className="text-zinc-500">Lv.{inst.level} • {getAverageTier(inst.statModifiers)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-zinc-500 mb-2 text-[10px] uppercase tracking-widest">Notes</div>
                <textarea
                  placeholder="Add notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleUpdate}
                  onKeyDown={handleInputKeyDown}
                  className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-600 resize-none"
                />
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-mono text-sm border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors"
          >
            Close
          </button>
          {onSell && (
            <button
              onClick={() => setShowSellConfirm(true)}
              className="flex-1 py-3 rounded-lg font-mono text-sm bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Sell Unichar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
