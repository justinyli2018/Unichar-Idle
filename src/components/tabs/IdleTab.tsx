import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Search, Filter, Info, Zap, Star } from 'lucide-react';
import { PlayerUnichar } from '../../types';
import { UNICHARS, getProbability } from '../../data/unichars';
import { getFullStats, getAverageTier, getRarityColor, getRarityLabel, formatNumber, getActiveSynergies } from '../../lib/gameMath';
import { UnicharDetails } from '../UnicharDetails';
import { CLASS_SYNERGIES, SYNERGY_GROUPS } from '../../data/synergies';

type SortOption = 'rarity' | 'date' | 'level' | 'attack' | 'hp' | 'crit' | 'spAtk' | 'prod';
type SearchScope = 'all' | 'nickname' | 'character';

interface IdleTabProps {
  slots: (string | null)[];
  inventory: PlayerUnichar[];
  discoveredGroupIds: string[];
  availableGroupIds: string[];
  onAssign: (slotIndex: number, instanceId: string) => void;
  onClear: (slotIndex: number) => void;
  onUpdateUnichar?: (instanceId: string, updates: Partial<Pick<PlayerUnichar, 'nickname' | 'notes'>>) => void;
  onFillGroup?: (groupId: string) => void;
}

export const IdleTab: React.FC<IdleTabProps> = ({ slots, inventory, discoveredGroupIds, availableGroupIds, onAssign, onClear, onUpdateUnichar, onFillGroup }) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('prod');
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [viewingChar, setViewingChar] = useState<PlayerUnichar | null>(null);

  const autoAddHighestProd = () => {
    const available = inventory.filter(u => !slots.includes(u.instanceId));
    const sorted = [...available].sort((a, b) => {
      const statsA = getFullStats(a, UNICHARS[a.defId]);
      const statsB = getFullStats(b, UNICHARS[b.defId]);
      if (statsB.prodRate !== statsA.prodRate) return statsB.prodRate - statsA.prodRate;
      return a.level - b.level;
    });

    let slotIdx = 0;
    let addedCount = 0;
    while (slotIdx < slots.length && addedCount < sorted.length) {
      if (slots[slotIdx] === null) {
        onAssign(slotIdx, sorted[addedCount].instanceId);
        addedCount++;
      }
      slotIdx++;
    }
  };

  const autoAddHighestRarity = () => {
    const available = inventory.filter(u => !slots.includes(u.instanceId));
    const sorted = [...available].sort((a, b) => {
      const probA = getProbability(a.defId);
      const probB = getProbability(b.defId);
      if (probA !== probB) return probA - probB; // Lower prob = higher rarity
      return a.level - b.level;
    });

    let slotIdx = 0;
    let addedCount = 0;
    while (slotIdx < slots.length && addedCount < sorted.length) {
      if (slots[slotIdx] === null) {
        onAssign(slotIdx, sorted[addedCount].instanceId);
        addedCount++;
      }
      slotIdx++;
    }
  };

  const clearAllSlots = () => {
    slots.forEach((instanceId, index) => {
      if (instanceId) onClear(index);
    });
  };

  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(u => !slots.includes(u.instanceId));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => {
        const def = UNICHARS[u.defId];
        const nameMatch = def.name.toLowerCase().includes(query);
        const nicknameMatch = (u.nickname && u.nickname.toLowerCase().includes(query)) || 
                             (u.notes && u.notes.toLowerCase().includes(query));
        
        if (searchScope === 'character') return nameMatch;
        if (searchScope === 'nickname') return nicknameMatch;
        return nameMatch || nicknameMatch;
      });
    }

    if (rarityFilter !== 'all') {
      filtered = filtered.filter(u => getRarityLabel(getProbability(u.defId)) === rarityFilter);
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(u => getAverageTier(u.statModifiers) === tierFilter);
    }

    return filtered.sort((a, b) => {
      const defA = UNICHARS[a.defId];
      const defB = UNICHARS[b.defId];
      if (!defA || !defB) return 0;
      
      const statsA = getFullStats(a, defA);
      const statsB = getFullStats(b, defB);

      const modifier = sortAscending ? 1 : -1;

      switch (sortBy) {
        case 'rarity': return modifier * (getProbability(a.defId) - getProbability(b.defId));
        case 'date': return modifier * ((a.acquiredAt || 0) - (b.acquiredAt || 0));
        case 'level': return modifier * (a.level - b.level);
        case 'attack': return modifier * (statsA.attack - statsB.attack);
        case 'hp': return modifier * (statsA.hp - statsB.hp);
        case 'crit': return modifier * (statsA.critChance - statsB.critChance);
        case 'spAtk': return modifier * (statsA.spAtk - statsB.spAtk);
        case 'prod': return modifier * (statsA.prodRate - statsB.prodRate);
        default: return 0;
      }
    });
  }, [inventory, slots, sortBy, sortAscending, searchQuery, rarityFilter, tierFilter]);

  return (
    <div className="p-4 space-y-8">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button 
          onClick={autoAddHighestProd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs font-mono hover:bg-green-500/20 transition-colors"
        >
          <Zap size={14} /> Best Prod
        </button>
        <button 
          onClick={autoAddHighestRarity}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-mono hover:bg-blue-500/20 transition-colors"
        >
          <Star size={14} /> Rarest
        </button>
        <button 
          onClick={clearAllSlots}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-xs font-mono hover:bg-zinc-800 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-2xl mx-auto w-full mb-8">
        {slots.map((instanceId, index) => {
          const char = instanceId ? inventory.find(u => u.instanceId === instanceId) : null;
          const def = char ? UNICHARS[char.defId] : null;

          return (
            <div
              key={index}
              className={`aspect-square border border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors relative ${
                char ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-950 hover:bg-zinc-900 border-dashed'
              }`}
              onClick={() => {
                if (char) {
                  onClear(index);
                } else {
                  setSelectedSlot(index);
                }
              }}
            >
              {char && def ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingChar(char);
                    }}
                    className="absolute top-1 right-1 p-1 text-zinc-600 hover:text-zinc-400"
                  >
                    <Info size={12} />
                  </button>
                  <div className="text-3xl font-bold mb-1">{def.char}</div>
                  {char.nickname && (
                    <div className="text-[7px] text-zinc-400 font-mono truncate w-full text-center px-1">
                      {char.nickname}
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-500 font-mono">Lv.{char.level}</div>
                  <div className="text-[10px] text-green-500/80 font-mono mt-0.5">+{getFullStats(char, def).prodRate.toFixed(1)}/s</div>
                </>
              ) : (
                <div className="text-zinc-700 text-2xl">+</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-8 pb-12">
        {/* Class Synergies */}
        <section>
          <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={10} className="text-green-500" /> Class Synergies
          </h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="px-3 py-2 text-zinc-500 font-normal">Class</th>
                  <th className="px-3 py-2 text-zinc-500 font-normal">Active</th>
                  <th className="px-3 py-2 text-zinc-500 font-normal">Next Tier</th>
                  <th className="px-3 py-2 text-zinc-500 font-normal text-right">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_SYNERGIES.map(synergy => {
                  const { activeClassBonuses, classCounts } = getActiveSynergies(slots, inventory);
                  const active = activeClassBonuses.find(b => b.className === synergy.className);
                  const count = classCounts[synergy.className] || 0;
                  const currentThreshold = [...synergy.thresholds].reverse().find(t => t.count <= count);
                  const currentTierCount = currentThreshold ? currentThreshold.count : 0;
                  const nextThreshold = synergy.thresholds.find(t => t.count > count);
                  
                  return (
                    <tr key={synergy.className} className="border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2 text-zinc-300">{synergy.className}</td>
                      <td className="px-3 py-2 text-zinc-400">{count}</td>
                      <td className="px-3 py-2 text-zinc-500">
                        {nextThreshold ? (
                          <div className="flex items-center gap-1">
                            <span>{currentTierCount}</span>
                            <ArrowUp size={8} className="rotate-90 opacity-30" />
                            <span className="text-zinc-300">{nextThreshold.count}</span>
                          </div>
                        ) : 'MAX'}
                      </td>
                      <td className="px-3 py-2 text-right text-green-400">
                        {active ? `+${(active.bonus * 100).toFixed(0)}%` : '0%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Synergy Groups */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Star size={10} className="text-purple-500" /> Synergy Groups
            </h3>
          </div>

          <div className="space-y-6">
            {/* Active Groups */}
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-tighter mb-2 font-mono">Active</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYNERGY_GROUPS.filter(g => getActiveSynergies(slots, inventory).activeGroupBonuses.some(ab => ab.groupId === g.id)).map(group => (
                  <div key={group.id} className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-purple-200 text-xs font-bold font-mono">{group.name}</div>
                      <div className="text-green-400 text-[10px] font-mono">+{(group.bonus * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-zinc-500 text-[9px] font-mono mb-2">{group.description}</div>
                    <div className="flex gap-1">
                      {group.requiredDefIds.map((defId, i) => (
                        <div key={i} className="w-5 h-5 bg-purple-500/20 border border-purple-500/40 rounded flex items-center justify-center text-[10px] text-purple-100 font-bold">
                          {UNICHARS[defId]?.char || '?'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {SYNERGY_GROUPS.filter(g => getActiveSynergies(slots, inventory).activeGroupBonuses.some(ab => ab.groupId === g.id)).length === 0 && (
                  <div className="text-zinc-600 text-[10px] font-mono italic">No active groups</div>
                )}
              </div>
            </div>

            {/* Discovered Groups */}
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-tighter mb-2 font-mono">Discovered</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYNERGY_GROUPS.filter(g => 
                  discoveredGroupIds.includes(g.id) && 
                  !getActiveSynergies(slots, inventory).activeGroupBonuses.some(ab => ab.groupId === g.id)
                ).map(group => {
                  const currentDefIdsInSlots = slots
                    .map(id => id ? inventory.find(u => u.instanceId === id)?.defId : null)
                    .filter(Boolean);
                  
                  const availableInInventory = inventory.filter(u => !slots.includes(u.instanceId));
                  const canFill = group.requiredDefIds.every(defId => {
                    const inSlots = currentDefIdsInSlots.filter(id => id === defId).length;
                    const inInv = availableInInventory.filter(u => u.defId === defId).length;
                    const required = group.requiredDefIds.filter(id => id === defId).length;
                    return (inSlots + inInv) >= required;
                  });

                  const emptySlots = slots.filter(s => s === null).length;
                  const neededSlots = group.requiredDefIds.length - group.requiredDefIds.filter(defId => {
                    const idx = currentDefIdsInSlots.indexOf(defId);
                    if (idx > -1) {
                      currentDefIdsInSlots.splice(idx, 1);
                      return true;
                    }
                    return false;
                  }).length;

                  return (
                    <div key={group.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-zinc-300 text-xs font-bold font-mono">{group.name}</div>
                        <div className="text-green-500/60 text-[10px] font-mono">+{(group.bonus * 100).toFixed(0)}%</div>
                      </div>
                      <div className="text-zinc-500 text-[9px] font-mono mb-2">{group.description}</div>
                      <div className="flex items-end justify-between">
                        <div className="flex gap-1">
                          {group.requiredDefIds.map((defId, i) => {
                            const isPresent = currentDefIdsInSlots.includes(defId);
                            if (isPresent) {
                              currentDefIdsInSlots.splice(currentDefIdsInSlots.indexOf(defId), 1);
                            }
                            return (
                              <div key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${
                                isPresent 
                                  ? 'bg-green-500/20 border-green-500/40 text-green-200' 
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                              }`}>
                                {UNICHARS[defId]?.char || '?'}
                              </div>
                            );
                          })}
                        </div>
                        {canFill && emptySlots >= neededSlots && onFillGroup && (
                          <button 
                            onClick={() => onFillGroup(group.id)}
                            className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-[9px] font-mono hover:bg-blue-500/20 transition-colors"
                          >
                            Auto-Fill
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {SYNERGY_GROUPS.filter(g => 
                  discoveredGroupIds.includes(g.id) && 
                  !getActiveSynergies(slots, inventory).activeGroupBonuses.some(ab => ab.groupId === g.id)
                ).length === 0 && (
                  <div className="text-zinc-600 text-[10px] font-mono italic">No discovered groups</div>
                )}
              </div>
            </div>

            {/* Undiscovered Groups */}
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-tighter mb-2 font-mono">Undiscovered</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYNERGY_GROUPS.filter(g => availableGroupIds.includes(g.id) && !discoveredGroupIds.includes(g.id)).map(group => (
                  <div key={group.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
                    <div className="text-zinc-700 text-[10px] font-mono font-bold tracking-tighter uppercase select-none">
                      {group.name}
                    </div>
                  </div>
                ))}
                {SYNERGY_GROUPS.filter(g => availableGroupIds.includes(g.id) && !discoveredGroupIds.includes(g.id)).length === 0 && (
                  <div className="text-zinc-600 text-[10px] font-mono italic">No undiscovered groups</div>
                )}
              </div>
            </div>

            {/* Unavailable Groups */}
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-tighter mb-2 font-mono">Unavailable</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYNERGY_GROUPS.filter(g => !availableGroupIds.includes(g.id)).map(group => (
                  <div key={group.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
                    <div className="text-zinc-800 text-[10px] font-mono font-bold tracking-tighter uppercase blur-[2px] select-none">
                      {group.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedSlot !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-mono">Select Unichar</h3>
                <button 
                  onClick={() => setSelectedSlot(null)}
                  className="text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <select
                    value={searchScope}
                    onChange={(e) => setSearchScope(e.target.value as SearchScope)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-2 py-1 font-mono outline-none"
                  >
                    <option value="all">All</option>
                    <option value="character">Char</option>
                    <option value="nickname">Nick</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select 
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-2 py-1 font-mono outline-none"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>

                  <select 
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-2 py-1 font-mono outline-none"
                  >
                    <option value="all">All Tiers</option>
                    <option value="S">Tier S</option>
                    <option value="A">Tier A</option>
                    <option value="B">Tier B</option>
                    <option value="C">Tier C</option>
                    <option value="D">Tier D</option>
                    <option value="F">Tier F</option>
                  </select>

                  <div className="flex-1" />

                  <div className="flex items-center gap-1">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded px-2 py-1 font-mono outline-none"
                    >
                      <option value="prod">Production</option>
                      <option value="rarity">Rarity</option>
                      <option value="level">Level</option>
                      <option value="attack">Attack</option>
                    </select>
                    <button 
                      onClick={() => setSortAscending(!sortAscending)}
                      className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:bg-zinc-800"
                    >
                      {sortAscending ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {filteredInventory.length === 0 ? (
                <div className="text-center text-zinc-500 py-8 font-mono text-sm">
                  {inventory.length === 0 ? "No Unichars yet." : "No matches found."}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {filteredInventory.map(char => {
                    const def = UNICHARS[char.defId];
                    if (!def) return null;
                    const stats = getFullStats(char, def);
                    
                    return (
                      <div
                        key={char.instanceId}
                        onClick={() => {
                          onAssign(selectedSlot, char.instanceId);
                          setSelectedSlot(null);
                        }}
                        className="aspect-square border border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 bg-zinc-950 p-1 overflow-hidden group relative"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingChar(char);
                          }}
                          className="absolute top-1 right-1 p-1 text-zinc-700 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Info size={10} />
                        </button>
                        <div className="text-2xl font-bold">{def.char}</div>
                        {char.nickname && (
                          <div className="text-[7px] text-zinc-400 font-mono truncate w-full text-center px-1">
                            {char.nickname}
                          </div>
                        )}
                        <div className="flex flex-col items-center mt-0.5">
                          <div className={`text-[7px] font-mono uppercase tracking-tighter ${getRarityColor(getProbability(char.defId))}`}>
                            {getRarityLabel(getProbability(char.defId))}
                          </div>
                          <div className="text-[7px] text-zinc-500 font-mono">
                            Tier: <span className="text-zinc-300">{getAverageTier(char.statModifiers)}</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-blue-400/80 font-mono mt-0.5">
                          {sortBy === 'prod' ? `${formatNumber(stats.prodRate)}/s` : `Lv.${char.level}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingChar && (
        <UnicharDetails 
          char={inventory.find(u => u.instanceId === viewingChar.instanceId) || viewingChar} 
          onClose={() => setViewingChar(null)} 
          onUpdate={onUpdateUnichar}
        />
      )}
    </div>
  );
};
