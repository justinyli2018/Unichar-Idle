import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, PlayerUnichar, UnicharDef, StatModifiers, Rarity, GameNotification } from '../types';
import { UNICHARS, getProbability } from '../data/unichars';
import { calculateProduction, getLevelUpCost, generateBellModifier, getRarityLabel, getUnicharValue, getActiveSynergies, getStatAtLevel } from '../lib/gameMath';
import { BANNERS } from '../data/banners';
import { SYNERGY_GROUPS } from '../data/synergies';

const TICK_RATE = 100; // 10 ticks per second
const SAVE_KEY = 'unichar_idle_save';

const INITIAL_STATE: GameState = {
  bits: 0, 
  freePulls: 3,
  hasReceivedInitialFreePulls: true,
  inventory: [],
  idleSlots: Array(12).fill(null),
  lastSaveTime: Date.now(),
  currentBannerId: 'rare',
  tabSettings: {
    collection: {
      sortBy: 'rarity',
      sortAscending: false,
      searchQuery: '',
      searchScope: 'all',
      rarityFilter: 'all',
      tierFilter: 'all',
      viewMode: 'individual'
    },
    upgrade: {
      searchQuery: '',
      searchScope: 'all',
      rarityFilter: 'all',
      tierFilter: 'all',
      sortBy: 'rarity',
      sortAscending: false,
      instanceSortBy: 'tier'
    }
  },
  discoveredGroupIds: [],
  availableGroupIds: [],
  notifications: []
};

export const useGame = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        
        // Migrate old data
        if (parsed.hasReceivedInitialFreePulls === undefined) {
          parsed.freePulls = 3;
          parsed.hasReceivedInitialFreePulls = true;
        }
        // Stuck prevention: If no pulls and no inventory, give 3 pulls
        if (parsed.freePulls === 0 && parsed.inventory.length === 0) {
          parsed.freePulls = 3;
        }
        if (!parsed.currentBannerId) parsed.currentBannerId = 'rare';
        if (!parsed.tabSettings) parsed.tabSettings = INITIAL_STATE.tabSettings;
        if (!parsed.tabSettings.collection) parsed.tabSettings.collection = INITIAL_STATE.tabSettings.collection;
        if (!parsed.tabSettings.upgrade) parsed.tabSettings.upgrade = (parsed.tabSettings as any).reroll || INITIAL_STATE.tabSettings.upgrade;
        if (!parsed.discoveredGroupIds) parsed.discoveredGroupIds = [];
        if (!parsed.availableGroupIds) parsed.availableGroupIds = [];
        if (!parsed.notifications) parsed.notifications = [];
        
        const inventoryCounts = parsed.inventory.reduce((acc, u) => {
          acc[u.defId] = (acc[u.defId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        parsed.availableGroupIds = SYNERGY_GROUPS
          .filter(group => {
            const requiredCounts = group.requiredDefIds.reduce((acc, id) => {
              acc[id] = (acc[id] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            return Object.entries(requiredCounts).every(([id, count]) => (inventoryCounts[id] || 0) >= count);
          })
          .map(g => g.id);

        parsed.inventory = parsed.inventory.map(u => {
          if (!u.moves) u.moves = []; // Ensure moves array exists
          if (!u.statModifiers) {
            return {
              ...u,
              statModifiers: {
                attack: 1.0,
                hp: 1.0,
                critChance: 1.0,
                spAtk: 1.0,
                prodRate: 1.0,
              }
            };
          }
          return u;
        });

        // Offline progress
        const now = Date.now();
        const lastSave = parsed.lastSaveTime || now;
        const diffSec = (now - lastSave) / 1000;
        
        if (diffSec > 60) {
          const prod = calculateProduction(parsed.idleSlots, parsed.inventory);
          parsed.bits += prod * diffSec;
          
          // Offline EXP
          const expPerSec = 10;
          const offlineExp = expPerSec * diffSec;
          parsed.inventory = parsed.inventory.map(u => {
            if (parsed.idleSlots.includes(u.instanceId)) {
              let newExp = u.exp + offlineExp;
              let newLevel = u.level;
              const def = UNICHARS[u.defId];
              if (def) {
                let cost = getLevelUpCost(newLevel, def.baseStats.wisdom);
                while (newExp >= cost) {
                  newExp -= cost;
                  newLevel++;
                  cost = getLevelUpCost(newLevel, def.baseStats.wisdom);
                }
              }
              return { ...u, exp: newExp, level: newLevel };
            }
            return u;
          });
        }
        parsed.lastSaveTime = now;
        return parsed;
      } catch (e) {
        console.error("Failed to parse save", e);
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // Use a ref to avoid stale closures in the interval
  const stateRef = useRef(state);
  stateRef.current = state;

  // Stuck prevention
  useEffect(() => {
    if (state.freePulls === 0 && state.inventory.length === 0 && state.bits < 100) {
      setState(s => ({ ...s, freePulls: 3 }));
    }
  }, [state.freePulls, state.inventory.length, state.bits]);

  // Save loop
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = { ...stateRef.current, lastSaveTime: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(currentState));
    }, 5000); // Save every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => {
        const prodPerSec = calculateProduction(s.idleSlots, s.inventory);
        const prodPerTick = prodPerSec * (TICK_RATE / 1000);
        
        // Add EXP to active unichars
        const EXP_PER_SECOND = 10;
        const expPerTick = EXP_PER_SECOND * (TICK_RATE / 1000);
        
        let inventoryChanged = false;
        const newNotifications: GameNotification[] = [];
        const newInventory = s.inventory.map(u => {
          if (s.idleSlots.includes(u.instanceId)) {
            let newExp = u.exp + expPerTick;
            let newLevel = u.level;
            const def = UNICHARS[u.defId];
            if (def) {
              let cost = getLevelUpCost(newLevel, def.baseStats.wisdom);
              while (newExp >= cost) {
                newExp -= cost;
                newLevel++;
                newNotifications.push({
                  id: Math.random().toString(36).substr(2, 9),
                  message: `${u.nickname || def.name} leveled up to ${newLevel}!`,
                  type: 'levelUp',
                  timestamp: Date.now()
                });
                cost = getLevelUpCost(newLevel, def.baseStats.wisdom);
              }
            }
            if (newExp !== u.exp || newLevel !== u.level) {
              inventoryChanged = true;
              return { ...u, exp: newExp, level: newLevel };
            }
          }
          return u;
        });

        // Check for new synergy discoveries
        const { activeGroupBonuses } = getActiveSynergies(s.idleSlots, s.inventory);
        const newlyDiscoveredIds: string[] = [];
        activeGroupBonuses.forEach(g => {
          if (!s.discoveredGroupIds.includes(g.groupId)) {
            newlyDiscoveredIds.push(g.groupId);
            const group = SYNERGY_GROUPS.find(sg => sg.id === g.groupId);
            if (group) {
              newNotifications.push({
                id: Math.random().toString(36).substr(2, 9),
                message: `New Synergy Discovered: ${group.name}!`,
                type: 'synergy',
                timestamp: Date.now()
              });
            }
          }
        });

        if (prodPerTick === 0 && !inventoryChanged && newlyDiscoveredIds.length === 0 && newNotifications.length === 0) return s;

        return { 
          ...s, 
          bits: s.bits + prodPerTick,
          inventory: inventoryChanged ? newInventory : s.inventory,
          discoveredGroupIds: newlyDiscoveredIds.length > 0 ? [...s.discoveredGroupIds, ...newlyDiscoveredIds] : s.discoveredGroupIds,
          notifications: [...s.notifications, ...newNotifications].slice(-3) // Keep last 3
        };
      });
    }, TICK_RATE);
    return () => clearInterval(interval);
  }, []);

  const summon = useCallback((count: number = 1, bannerId?: string, costOverride?: number): PlayerUnichar[] => {
    const bId = bannerId || stateRef.current.currentBannerId;
    const banner = BANNERS.find(b => b.id === bId) || BANNERS[0];
    
    const useFreePulls = bId === 'rare' && stateRef.current.freePulls >= count;
    const cost = useFreePulls ? 0 : (costOverride !== undefined ? costOverride : (banner.costPerSummon * count));
    
    if (!useFreePulls && stateRef.current.bits < cost) return [];
    
    const generatedChars: PlayerUnichar[] = [];
    
    // Filter characters based on banner
    let availableChars: UnicharDef[] = [];
    let totalWeight = 0;

    if (banner.customWeights) {
      availableChars = Object.keys(banner.customWeights).map(id => UNICHARS[id]).filter(Boolean);
      totalWeight = Object.values(banner.customWeights).reduce((sum, w) => sum + w, 0);
    } else {
      availableChars = Object.values(UNICHARS).filter(u => {
        const rarity = getRarityLabel(getProbability(u.id));
        return !banner.excludedRarities.includes(rarity as Rarity);
      });
      totalWeight = availableChars.reduce((sum, u) => sum + u.rarity, 0);
    }

    if (availableChars.length === 0) return [];

    for (let i = 0; i < count; i++) {
      let random = Math.random() * totalWeight;
      let pulledDef: UnicharDef | null = null;
      
      if (banner.customWeights) {
        for (const u of availableChars) {
          const weight = banner.customWeights[u.id] || 0;
          random -= weight;
          if (random <= 0) {
            pulledDef = u;
            break;
          }
        }
      } else {
        for (const u of availableChars) {
          random -= u.rarity;
          if (random <= 0) {
            pulledDef = u;
            break;
          }
        }
      }
      
      if (!pulledDef) pulledDef = availableChars[0];

      const statModifiers: StatModifiers = {
        attack: generateBellModifier(),
        hp: generateBellModifier(),
        critChance: generateBellModifier(),
        spAtk: generateBellModifier(),
        prodRate: generateBellModifier(),
      };

      // Assign moves - rarer characters get more moves
      const logMult = 1 + Math.log10(Math.max(1, 1000000 / pulledDef.rarity));
      const maxPossibleMoves = Math.min(4, Math.floor(Math.random() * logMult) + 1);
      const assignedMoves: string[] = [];
      const possibleMoves = [...pulledDef.possibleMoves];
      
      for (let j = 0; j < maxPossibleMoves && possibleMoves.length > 0; j++) {
        const totalMoveWeight = possibleMoves.reduce((sum, m) => sum + m.chance, 0);
        let moveRandom = Math.random() * totalMoveWeight;
        let selectedMoveIndex = -1;
        
        for (let k = 0; k < possibleMoves.length; k++) {
          moveRandom -= possibleMoves[k].chance;
          if (moveRandom <= 0) {
            selectedMoveIndex = k;
            break;
          }
        }
        
        if (selectedMoveIndex === -1) selectedMoveIndex = 0;
        
        assignedMoves.push(possibleMoves[selectedMoveIndex].moveId);
        possibleMoves.splice(selectedMoveIndex, 1); // Don't assign the same move twice
      }

      const newChar: PlayerUnichar = {
        instanceId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(),
        defId: pulledDef.id,
        level: 1,
        exp: 0,
        acquiredAt: Date.now(),
        statModifiers,
        moves: assignedMoves,
      };
      generatedChars.push(newChar);
    }

    setState(s => {
      if (!useFreePulls && s.bits < cost) return s;
      const newInventory = [...s.inventory, ...generatedChars];
      
      // We no longer trigger notifications here, they are triggered by the UI after the reveal
      const inventoryCounts = newInventory.reduce((acc, u) => {
        acc[u.defId] = (acc[u.defId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const updatedAvailableIds = SYNERGY_GROUPS
        .filter(group => {
          const requiredCounts = group.requiredDefIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(requiredCounts).every(([id, count]) => (inventoryCounts[id] || 0) >= count);
        })
        .map(g => g.id);

      return {
        ...s,
        bits: useFreePulls ? s.bits : s.bits - cost,
        freePulls: useFreePulls ? s.freePulls - count : s.freePulls,
        inventory: newInventory,
        availableGroupIds: updatedAvailableIds
      };
    });

    return generatedChars;
  }, []);

  const triggerDiscoveryNotifications = useCallback((newInventory: PlayerUnichar[]) => {
    setState(s => {
      const inventoryCounts = newInventory.reduce((acc, u) => {
        acc[u.defId] = (acc[u.defId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const updatedAvailableIds = SYNERGY_GROUPS
        .filter(group => {
          const requiredCounts = group.requiredDefIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(requiredCounts).every(([id, count]) => (inventoryCounts[id] || 0) >= count);
        })
        .map(g => g.id);

      const newNotifications: GameNotification[] = [];
      SYNERGY_GROUPS.forEach(group => {
        if (!s.availableGroupIds.includes(group.id) && updatedAvailableIds.includes(group.id)) {
          newNotifications.push({
            id: Math.random().toString(36).substr(2, 9),
            message: `Synergy Group Available: ${group.name}!`,
            type: 'synergy',
            timestamp: Date.now()
          });
        }
      });

      if (newNotifications.length === 0) return s;

      return {
        ...s,
        availableGroupIds: updatedAvailableIds,
        notifications: [...s.notifications, ...newNotifications].slice(-3)
      };
    });
  }, []);

  const setBanner = useCallback((bannerId: string) => {
    setState(s => ({ ...s, currentBannerId: bannerId }));
  }, []);

  const upgrade = useCallback((targetId: string, fodderId: string, mode: 'all' | 'stat' | 'move', statKey?: keyof StatModifiers, moveIndex?: number) => {
    setState(s => {
      const target = s.inventory.find(u => u.instanceId === targetId);
      const fodder = s.inventory.find(u => u.instanceId === fodderId);
      
      if (!target || !fodder || targetId === fodderId) return s;
      if (target.defId !== fodder.defId) return s;

      const newInventory = [...s.inventory];
      const targetIdx = newInventory.findIndex(u => u.instanceId === targetId);
      
      let updatedTarget = { ...newInventory[targetIdx] };

      if (mode === 'all') {
        updatedTarget.statModifiers = {
          attack: generateBellModifier(),
          hp: generateBellModifier(),
          critChance: generateBellModifier(),
          spAtk: generateBellModifier(),
          prodRate: generateBellModifier(),
        };
      } else if (mode === 'stat' && statKey) {
        updatedTarget.statModifiers = {
          ...updatedTarget.statModifiers,
          [statKey]: fodder.statModifiers[statKey]
        };
      } else if (mode === 'move') {
        const def = UNICHARS[target.defId];
        if (def) {
          const currentMoves = new Set(target.moves);
          const availableMoves = def.possibleMoves.filter(m => !currentMoves.has(m.moveId));
          
          if (availableMoves.length > 0) {
            const totalChance = availableMoves.reduce((sum, m) => sum + m.chance, 0);
            let rand = Math.random() * totalChance;
            let pickedMoveId = availableMoves[0].moveId;
            for (const m of availableMoves) {
              if (rand < m.chance) {
                pickedMoveId = m.moveId;
                break;
              }
              rand -= m.chance;
            }

            const newMoves = [...target.moves];
            if (moveIndex !== undefined && moveIndex < newMoves.length) {
              newMoves[moveIndex] = pickedMoveId;
            } else if (newMoves.length < 4) {
              newMoves.push(pickedMoveId);
            }
            updatedTarget.moves = newMoves;
          }
        }
      }

      newInventory[targetIdx] = updatedTarget;
      const finalInventory = newInventory.filter(u => u.instanceId !== fodderId);

      return {
        ...s,
        inventory: finalInventory,
        idleSlots: s.idleSlots.map(id => id === fodderId ? null : id)
      };
    });
  }, []);

  const assignSlot = useCallback((slotIndex: number, instanceId: string) => {
    setState(s => {
      const newSlots = [...s.idleSlots];
      newSlots[slotIndex] = instanceId;
      return { ...s, idleSlots: newSlots };
    });
  }, []);

  const clearSlot = useCallback((slotIndex: number) => {
    setState(s => {
      const newSlots = [...s.idleSlots];
      newSlots[slotIndex] = null;
      return { ...s, idleSlots: newSlots };
    });
  }, []);

  const updateUnichar = useCallback((instanceId: string, updates: Partial<Pick<PlayerUnichar, 'nickname' | 'notes'>>) => {
    setState(s => ({
      ...s,
      inventory: s.inventory.map(u => u.instanceId === instanceId ? { ...u, ...updates } : u)
    }));
  }, []);

  const updateTabSettings = useCallback((tab: 'collection' | 'reroll', updates: any) => {
    setState(s => ({
      ...s,
      tabSettings: {
        ...s.tabSettings,
        [tab]: { ...s.tabSettings[tab], ...updates }
      }
    }));
  }, []);

  const sellUnichar = useCallback((instanceId: string) => {
    setState(s => {
      const char = s.inventory.find(u => u.instanceId === instanceId);
      if (!char) return s;
      
      const def = UNICHARS[char.defId];
      if (!def) return s;
      
      const price = getUnicharValue(char, def);
      const newInventory = s.inventory.filter(u => u.instanceId !== instanceId);
      const inventoryCounts = newInventory.reduce((acc, u) => {
        acc[u.defId] = (acc[u.defId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const updatedAvailableIds = SYNERGY_GROUPS
        .filter(group => {
          const requiredCounts = group.requiredDefIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(requiredCounts).every(([id, count]) => (inventoryCounts[id] || 0) >= count);
        })
        .map(g => g.id);
      
      return {
        ...s,
        bits: s.bits + price,
        inventory: newInventory,
        idleSlots: s.idleSlots.map(id => id === instanceId ? null : id),
        availableGroupIds: updatedAvailableIds
      };
    });
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }, []);

  const clearNotification = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.filter(n => n.id !== id)
    }));
  }, []);

  const fillSynergyGroup = useCallback((groupId: string) => {
    setState(s => {
      const group = SYNERGY_GROUPS.find(g => g.id === groupId);
      if (!group) return s;

      const newSlots = [...s.idleSlots];
      const inventory = [...s.inventory];
      
      // Find unichars in inventory that are not already in idle slots
      const availableUnichars = inventory.filter(u => !newSlots.includes(u.instanceId));
      
      const requiredDefIds = [...group.requiredDefIds];
      const currentDefIdsInSlots = newSlots
        .map(id => id ? inventory.find(u => u.instanceId === id)?.defId : null)
        .filter(Boolean);

      // Remove defIds that are already in slots from the requirement
      currentDefIdsInSlots.forEach(defId => {
        const index = requiredDefIds.indexOf(defId!);
        if (index > -1) {
          requiredDefIds.splice(index, 1);
        }
      });

      // If all requirements are already met, do nothing
      if (requiredDefIds.length === 0) return s;

      // Check if we have enough empty slots
      const emptySlotIndices = newSlots.map((id, idx) => id === null ? idx : -1).filter(idx => idx !== -1);
      if (emptySlotIndices.length < requiredDefIds.length) return s;

      // Try to fill the remaining requirements
      let filledCount = 0;
      requiredDefIds.forEach(defId => {
        const unichar = availableUnichars.find(u => u.defId === defId);
        if (unichar) {
          const slotIdx = emptySlotIndices[filledCount];
          newSlots[slotIdx] = unichar.instanceId;
          // Remove from available so we don't pick the same instance twice
          const availIdx = availableUnichars.indexOf(unichar);
          availableUnichars.splice(availIdx, 1);
          filledCount++;
        }
      });

      if (filledCount === 0) return s;

      return { ...s, idleSlots: newSlots };
    });
  }, []);

  const productionBreakdown = useMemo(() => {
    const activeUnichars = state.idleSlots
      .map(id => state.inventory.find(u => u.instanceId === id))
      .filter((u): u is PlayerUnichar => u !== undefined);

    const { activeClassBonuses, activeGroupBonuses } = getActiveSynergies(state.idleSlots, state.inventory);
    const totalGroupBonus = activeGroupBonuses.reduce((sum, g) => sum + g.bonus, 0);

    let baseProd = 0;
    let totalWithClass = 0;

    activeUnichars.forEach(u => {
      const def = UNICHARS[u.defId];
      if (!def) return;
      
      const mods = u.statModifiers || { prodRate: 1.0 };
      const charProd = getStatAtLevel(def.baseStats.prodRate, u.level, 0.05) * (mods.prodRate || 1.0);
      baseProd += charProd;

      let classMultiplier = 1;
      def.classes.forEach(c => {
        const bonus = activeClassBonuses.find(b => b.className === c)?.bonus || 0;
        classMultiplier += bonus;
      });
      totalWithClass += charProd * classMultiplier;
    });

    const finalProd = totalWithClass * (1 + totalGroupBonus);
    const totalMultiplier = baseProd > 0 ? (finalProd / baseProd) : 1;

    return {
      baseProd,
      totalMultiplier,
      finalProd
    };
  }, [state.idleSlots, state.inventory]);

  return {
    state,
    summon,
    assignSlot,
    clearSlot,
    updateUnichar,
    sellUnichar,
    resetData,
    setBanner,
    updateTabSettings,
    clearNotification,
    fillSynergyGroup,
    triggerDiscoveryNotifications,
    productionRate: productionBreakdown.finalProd,
    productionBreakdown,
    upgrade
  };
};
