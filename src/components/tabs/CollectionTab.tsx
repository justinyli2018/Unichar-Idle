import React, { useState, useMemo } from 'react';
import { Search, ArrowUp, ArrowDown, Trash2, CheckCircle, Circle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerUnichar, CollectionSettings, CollectionSortOption, SearchScope, CollectionViewMode } from '../../types';
import { UNICHARS, getProbability } from '../../data/unichars';
import { getFullStats, getLevelUpCost, formatNumber, getAverageTier, getRarityColor, getRarityLabel } from '../../lib/gameMath';
import { UnicharDetails } from '../UnicharDetails';

interface CollectionTabProps {
  inventory: PlayerUnichar[];
  onUpdateUnichar?: (instanceId: string, updates: Partial<Pick<PlayerUnichar, 'nickname' | 'notes'>>) => void;
  onSell?: (instanceId: string) => void;
  settings: CollectionSettings;
  onUpdateSettings: (settings: CollectionSettings) => void;
}

export const CollectionTab: React.FC<CollectionTabProps> = ({ 
  inventory, 
  onUpdateUnichar, 
  onSell,
  settings,
  onUpdateSettings
}) => {
  const [selectedChar, setSelectedChar] = useState<PlayerUnichar | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { sortBy, sortAscending, searchQuery, searchScope, rarityFilter, tierFilter, viewMode } = settings;

  const updateSettings = (updates: Partial<CollectionSettings>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const filteredInventory = useMemo(() => {
    if (viewMode === 'base') {
      // Show all possible unichars
      let allDefs = Object.values(UNICHARS);
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allDefs = allDefs.filter(def => def.name.toLowerCase().includes(query));
      }

      if (rarityFilter !== 'all') {
        allDefs = allDefs.filter(def => getRarityLabel(getProbability(def.id)) === rarityFilter);
      }

      // Sort base defs
      allDefs.sort((a, b) => {
        const modifier = sortAscending ? 1 : -1;
        switch (sortBy) {
          case 'rarity': return modifier * (getProbability(a.id) - getProbability(b.id));
          case 'attack': return modifier * (a.baseStats.attack - b.baseStats.attack);
          case 'hp': return modifier * (a.baseStats.hp - b.baseStats.hp);
          case 'crit': return modifier * (a.baseStats.critChance - b.baseStats.critChance);
          case 'spAtk': return modifier * (a.baseStats.spAtk - b.baseStats.spAtk);
          case 'prod': return modifier * (a.baseStats.prodRate - b.baseStats.prodRate);
          default: return modifier * (getProbability(a.id) - getProbability(b.id));
        }
      });

      return allDefs;
    }

    let filtered = [...inventory];

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

    filtered.sort((a, b) => {
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

    if (viewMode === 'stacked') {
      const stacked: { [defId: string]: PlayerUnichar[] } = {};
      filtered.forEach(u => {
        if (!stacked[u.defId]) stacked[u.defId] = [];
        stacked[u.defId].push(u);
      });
      
      const result: PlayerUnichar[] = [];
      const seen = new Set<string>();
      filtered.forEach(u => {
        if (!seen.has(u.defId)) {
          result.push(u);
          seen.add(u.defId);
        }
      });
      return result;
    }

    return filtered;
  }, [inventory, sortBy, sortAscending, searchQuery, rarityFilter, tierFilter, viewMode, searchScope]);

  const toggleSelect = (char: PlayerUnichar) => {
    if (viewMode === 'stacked') {
      const allOfThisType = inventory.filter(u => u.defId === char.defId).map(u => u.instanceId);
      const isAlreadySelected = allOfThisType.every(id => selectedIds.includes(id));
      
      if (isAlreadySelected) {
        setSelectedIds(prev => prev.filter(id => !allOfThisType.includes(id)));
      } else {
        setSelectedIds(prev => Array.from(new Set([...prev, ...allOfThisType])));
      }
    } else {
      setSelectedIds(prev => 
        prev.includes(char.instanceId) 
          ? prev.filter(i => i !== char.instanceId) 
          : [...prev, char.instanceId]
      );
    }
  };

  const handleSellSelected = () => {
    if (onSell && selectedIds.length > 0) {
      selectedIds.forEach(id => onSell(id));
      setSelectedIds([]);
      setIsSelectionMode(false);
      setShowSellConfirmation(false);
    }
  };

  const startSellConfirmation = () => {
    setShowSellConfirmation(true);
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleViewMode = () => {
    const modes: CollectionViewMode[] = ['individual', 'stacked', 'base'];
    const nextMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
    updateSettings({ viewMode: nextMode });
    if (nextMode === 'base') {
      setIsSelectionMode(false);
      setSelectedIds([]);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-zinc-400 font-mono text-xs sm:text-sm">
              {viewMode === 'base' 
                ? `All Possible Unichars (${Object.keys(UNICHARS).length})`
                : (searchQuery || rarityFilter !== 'all' || tierFilter !== 'all' 
                  ? `Search Results (${filteredInventory.length})` 
                  : `Your Unichar Collection (${inventory.length})`)}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Sorted by {sortBy} ({sortAscending ? 'Asc' : 'Desc'})
              {rarityFilter !== 'all' && ` • Rarity: ${rarityFilter}`}
              {tierFilter !== 'all' && viewMode !== 'base' && ` • Tier: ${tierFilter}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {viewMode !== 'base' && (
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] border transition-colors ${
                  isSelectionMode 
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isSelectionMode ? 'Cancel Selection' : 'Selection Mode'}
              </button>
            )}
            <button
              onClick={toggleViewMode}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] border transition-colors ${
                viewMode === 'stacked' 
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                  : viewMode === 'base'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {viewMode === 'stacked' ? 'Stacked View' : viewMode === 'base' ? 'Base Stats' : 'Individual View'}
            </button>
            <select 
              value={sortBy} 
              onChange={(e) => updateSettings({ sortBy: e.target.value as CollectionSortOption })}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded p-1.5 font-mono outline-none"
            >
              {viewMode !== 'base' && <option value="date">Sort: Newest</option>}
              <option value="rarity">Sort: Rarity</option>
              {viewMode !== 'base' && <option value="level">Sort: Level</option>}
              <option value="prod">Sort: Production</option>
              <option value="attack">Sort: Attack</option>
              <option value="hp">Sort: HP</option>
              <option value="spAtk">Sort: Sp. Atk</option>
              <option value="crit">Sort: Crit</option>
            </select>
            <button 
              onClick={() => updateSettings({ sortAscending: !sortAscending })}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {sortAscending ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => updateSettings({ searchQuery: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
              />
            </div>
            {viewMode !== 'base' && (
              <select
                value={searchScope}
                onChange={(e) => updateSettings({ searchScope: e.target.value as SearchScope })}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-2 py-1.5 font-mono outline-none"
              >
                <option value="all">Search: All</option>
                <option value="character">Search: Character</option>
                <option value="nickname">Search: Nick/Notes</option>
              </select>
            )}
          </div>
          
          <div className="flex gap-2">
            <select 
              value={rarityFilter}
              onChange={(e) => updateSettings({ rarityFilter: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded px-2 py-1.5 font-mono outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
            </select>

            {viewMode !== 'base' && (
              <select 
                value={tierFilter}
                onChange={(e) => updateSettings({ tierFilter: e.target.value })}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded px-2 py-1.5 font-mono outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="S">Tier S</option>
                <option value="A">Tier A</option>
                <option value="B">Tier B</option>
                <option value="C">Tier C</option>
                <option value="D">Tier D</option>
                <option value="F">Tier F</option>
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto pb-20 relative">
        {isSelectionMode && selectedIds.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[40] bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-center gap-4 shadow-2xl">
            <div className="text-xs font-mono text-zinc-300">
              Selected: <span className="text-blue-400 font-bold">{selectedIds.length}</span>
            </div>
            <button
              onClick={startSellConfirmation}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-mono text-xs font-bold hover:bg-red-400 transition-colors"
            >
              Sell Selected
            </button>
          </div>
        )}
        {filteredInventory.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-600 font-mono">
            No Unichars found matching your criteria.
          </div>
        ) : (
          filteredInventory.map(item => {
            const isBaseMode = viewMode === 'base';
            const char = isBaseMode ? null : item as PlayerUnichar;
            const def = isBaseMode ? item as any : UNICHARS[(item as PlayerUnichar).defId];
            
            if (!def) return null;
            
            const prob = getProbability(def.id);
            const isSelected = !isBaseMode && (viewMode === 'stacked' 
              ? inventory.filter(u => u.defId === char!.defId).every(u => selectedIds.includes(u.instanceId))
              : selectedIds.includes(char!.instanceId));

            // Count how many of this type the user owns
            const ownedCount = inventory.filter(u => u.defId === def.id).length;
            const isUnowned = isBaseMode && ownedCount === 0;
            const stackCount = !isBaseMode && viewMode === 'stacked' ? inventory.filter(u => u.defId === char!.defId).length : 0;

            return (
              <div
                key={isBaseMode ? def.id : char!.instanceId}
                onClick={() => {
                  if (isSelectionMode && !isBaseMode) {
                    toggleSelect(char!);
                  } else {
                    if (isBaseMode) {
                      // Create a mock PlayerUnichar for the details view
                      setSelectedChar({
                        instanceId: `base_${def.id}`,
                        defId: def.id,
                        level: 1,
                        exp: 0,
                        acquiredAt: Date.now(),
                        statModifiers: {
                          attack: 1,
                          hp: 1,
                          critChance: 1,
                          spAtk: 1,
                          prodRate: 1
                        },
                        moves: def.possibleMoves.map(m => m.moveId) // Show all possible moves in base mode? 
                        // Actually the user said "view the base stat for that unichar type... as well as the moves with base damage and the probabilities of that move"
                      });
                    } else {
                      setSelectedChar(char!);
                    }
                  }
                }}
                className={`min-h-[110px] border rounded-lg flex flex-col items-center justify-center transition-all p-2 overflow-hidden relative cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-zinc-800 hover:bg-zinc-900 bg-zinc-950'
                } ${isUnowned ? 'opacity-30 grayscale' : ''}`}
              >
                {isBaseMode && (
                  <div className={`absolute top-1 right-1 text-[8px] font-mono px-1 rounded border ${
                    ownedCount > 0 ? 'border-zinc-700 text-zinc-400' : 'border-zinc-900 text-zinc-600'
                  }`}>
                    x{ownedCount}
                  </div>
                )}
                {isSelectionMode && (
                  <div className={`absolute top-1 right-1 w-3 h-3 rounded-full border ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-zinc-700 bg-zinc-900'
                  }`} />
                )}
                <div className="text-2xl font-bold text-zinc-100 leading-none mb-1">{def.char}</div>
                {viewMode === 'stacked' ? (
                  <div className="text-[10px] text-purple-400 font-mono font-bold mb-1">
                    x{stackCount}
                  </div>
                ) : (
                  !isBaseMode && char!.nickname && (
                    <div className="text-[8px] text-zinc-400 font-mono truncate w-full text-center mb-1 px-1">
                      {char!.nickname}
                    </div>
                  )
                )}
                <div className="flex flex-col items-center">
                  <div className={`text-[8px] font-mono uppercase tracking-tighter ${getRarityColor(prob)}`}>
                    {getRarityLabel(prob)}
                  </div>
                  {!isBaseMode && viewMode !== 'stacked' && (
                    <div className="text-[8px] text-zinc-500 font-mono">
                      Rating: <span className="text-zinc-300">{getAverageTier(char!.statModifiers)}</span>
                    </div>
                  )}
                </div>
                <div className="text-[9px] text-blue-400/80 font-mono mt-1 text-center">
                  {(() => {
                    if (isBaseMode) {
                      switch (sortBy) {
                        case 'attack': return `ATK: ${def.baseStats.attack}`;
                        case 'hp': return `HP: ${def.baseStats.hp}`;
                        case 'crit': return `CRT: ${(def.baseStats.critChance * 100).toFixed(1)}%`;
                        case 'spAtk': return `SP: ${def.baseStats.spAtk}`;
                        case 'prod': return `PRD: ${formatNumber(def.baseStats.prodRate)}/s`;
                        default: return `${prob.toFixed(2)}%`;
                      }
                    }
                    if (viewMode === 'stacked') return 'Base Stats';
                    const stats = getFullStats(char!, def);
                    switch (sortBy) {
                      case 'rarity': return `${prob.toFixed(2)}%`;
                      case 'level': return `Lv.${char!.level}`;
                      case 'attack': return `ATK: ${stats.attack}`;
                      case 'hp': return `HP: ${stats.hp}`;
                      case 'crit': return `CRT: ${(stats.critChance * 100).toFixed(1)}%`;
                      case 'spAtk': return `SP: ${stats.spAtk}`;
                      case 'prod': return `PRD: ${formatNumber(stats.prodRate)}/s`;
                      case 'date': return formatDate(char!.acquiredAt);
                      default: return `Lv.${char!.level}`;
                    }
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showSellConfirmation && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
          >
            <h3 className="text-xl font-bold font-mono text-zinc-100 mb-2">Confirm Mass Sell</h3>
            <p className="text-zinc-400 font-mono text-sm mb-6">
              You are about to sell <span className="text-red-400 font-bold">{selectedIds.length}</span> Unichars. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSellConfirmation(false)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-mono font-bold hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSellSelected}
                disabled={countdown > 0}
                className={`flex-1 py-3 rounded-xl font-mono font-bold transition-all ${
                  countdown > 0 
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-400'
                }`}
              >
                {countdown > 0 ? `Wait (${countdown}s)` : 'Sell All'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedChar && (
        <UnicharDetails 
          char={inventory.find(u => u.instanceId === selectedChar.instanceId) || selectedChar} 
          onClose={() => setSelectedChar(null)} 
          onUpdate={onUpdateUnichar}
          onSell={onSell}
          isStacked={viewMode === 'stacked'}
          instances={viewMode === 'stacked' ? inventory.filter(u => u.defId === selectedChar.defId) : undefined}
        />
      )}
    </div>
  );
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
