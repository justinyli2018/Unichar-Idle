import { PlayerUnichar, UnicharDef, StatModifiers, StatTier, UnicharClass } from '../types';
import { UNICHARS } from '../data/unichars';
import { CLASS_SYNERGIES, SYNERGY_GROUPS } from '../data/synergies';

// Bell curve approximation using Box-Muller transform
export const generateBellModifier = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  // Standard deviation of 0.1 (10%), mean of 1.0
  // This results in ~68% within [0.9, 1.1], ~95% within [0.8, 1.2]
  return 1.0 + num * 0.1;
};

export const getTierFromModifier = (mod: number): StatTier => {
  if (mod >= 1.2) return 'S';
  if (mod >= 1.1) return 'A';
  if (mod >= 1.0) return 'B';
  if (mod >= 0.9) return 'C';
  if (mod >= 0.8) return 'D';
  return 'F';
};

export const getTierValue = (tier: StatTier): number => {
  switch (tier) {
    case 'S': return 5;
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    case 'F': return 0;
  }
};

export const getTierFromValue = (val: number): StatTier => {
  if (val >= 4.5) return 'S';
  if (val >= 3.5) return 'A';
  if (val >= 2.5) return 'B';
  if (val >= 1.5) return 'C';
  if (val >= 0.5) return 'D';
  return 'F';
};

export const getAverageTier = (mods?: StatModifiers): StatTier => {
  if (!mods) return 'B'; // Default tier for missing mods
  const values = [
    getTierValue(getTierFromModifier(mods.attack)),
    getTierValue(getTierFromModifier(mods.hp)),
    getTierValue(getTierFromModifier(mods.critChance)),
    getTierValue(getTierFromModifier(mods.spAtk)),
    getTierValue(getTierFromModifier(mods.prodRate)),
  ];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return getTierFromValue(avg);
};

export const getActiveSynergies = (slots: (string | null)[], inventory: PlayerUnichar[]) => {
  const activeUnichars = slots
    .map(id => inventory.find(u => u.instanceId === id))
    .filter((u): u is PlayerUnichar => u !== undefined);

  const classCounts: Record<string, number> = {};
  const defIdCounts: Record<string, number> = {};

  activeUnichars.forEach(u => {
    const def = UNICHARS[u.defId];
    if (!def) return;
    defIdCounts[u.defId] = (defIdCounts[u.defId] || 0) + 1;
    def.classes.forEach(c => {
      classCounts[c] = (classCounts[c] || 0) + 1;
    });
  });

  const activeClassBonuses: { className: UnicharClass; bonus: number; count: number }[] = [];
  CLASS_SYNERGIES.forEach(synergy => {
    const count = classCounts[synergy.className] || 0;
    const applicableThreshold = [...synergy.thresholds]
      .reverse()
      .find(t => count >= t.count);
    
    if (applicableThreshold) {
      activeClassBonuses.push({
        className: synergy.className,
        bonus: applicableThreshold.bonus,
        count
      });
    }
  });

  const activeGroupBonuses: { groupId: string; bonus: number }[] = [];
  SYNERGY_GROUPS.forEach(group => {
    const requiredCounts: Record<string, number> = {};
    group.requiredDefIds.forEach(id => {
      requiredCounts[id] = (requiredCounts[id] || 0) + 1;
    });

    const isMet = Object.entries(requiredCounts).every(([id, count]) => {
      return (defIdCounts[id] || 0) >= count;
    });

    if (isMet) {
      activeGroupBonuses.push({
        groupId: group.id,
        bonus: group.bonus
      });
    }
  });

  return { activeClassBonuses, activeGroupBonuses, classCounts };
};

export const calculateProduction = (slots: (string | null)[], inventory: PlayerUnichar[]): number => {
  const activeUnichars = slots
    .map(id => inventory.find(u => u.instanceId === id))
    .filter((u): u is PlayerUnichar => u !== undefined);

  const { activeClassBonuses, activeGroupBonuses } = getActiveSynergies(slots, inventory);

  // Class bonuses are multiplicative per character
  // Group bonuses are additive to the total multiplier
  const totalGroupBonus = activeGroupBonuses.reduce((sum, g) => sum + g.bonus, 0);

  let totalProd = 0;
  activeUnichars.forEach(u => {
    const def = UNICHARS[u.defId];
    if (!def) return;
    
    // Base production + geometric scaling per level
    const mods = u.statModifiers || { prodRate: 1.0 };
    const charProd = getStatAtLevel(def.baseStats.prodRate, u.level, 0.05) * (mods.prodRate || 1.0);
    
    // Apply class synergies
    let classMultiplier = 1;
    def.classes.forEach(c => {
      const bonus = activeClassBonuses.find(b => b.className === c)?.bonus || 0;
      classMultiplier += bonus;
    });
    
    totalProd += charProd * classMultiplier;
  });

  // Apply group bonuses to the final total
  return totalProd * (1 + totalGroupBonus);
};

export const getLevelUpCost = (level: number, baseWisdom: number): number => {
  // Geometric scaling: base * (1.05 ^ (level - 1))
  return Math.floor(baseWisdom * Math.pow(1.05, level - 1));
};

export const getStatAtLevel = (base: number, level: number, rate: number): number => {
  // Geometric scaling: base * ((1 + rate) ^ (level - 1))
  return base * Math.pow(1 + rate, level - 1);
};

export const getUnicharValue = (u: PlayerUnichar, def: UnicharDef): number => {
  if (!def) return 0;
  // Base value based on rarity (logarithmic scale)
  const multiplier = Math.max(1, 1000000 / def.rarity);
  const baseValue = multiplier * 100;
  
  // Value increases geometrically with level
  return Math.floor(baseValue * Math.pow(1.1, u.level - 1));
};

export const getRarityColor = (prob: number | string) => {
  if (typeof prob === 'string') {
    switch (prob) {
      case 'Divine': return 'text-yellow-300';
      case 'Mythic': return 'text-pink-400';
      case 'Legendary': return 'text-yellow-400';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      case 'Uncommon': return 'text-green-400';
      case 'Common': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  }
  if (prob < 0.01) return 'text-yellow-300'; // Divine
  if (prob < 0.1) return 'text-pink-400'; // Mythic
  if (prob < 0.5) return 'text-yellow-400'; // Legendary
  if (prob < 1) return 'text-purple-400'; // Epic
  if (prob < 2.5) return 'text-blue-400'; // Rare
  if (prob < 5) return 'text-green-400'; // Uncommon
  return 'text-zinc-400';
};

export const getRarityLabel = (prob: number) => {
  if (prob < 0.01) return 'Divine';
  if (prob < 0.1) return 'Mythic';
  if (prob < 0.5) return 'Legendary';
  if (prob < 1) return 'Epic';
  if (prob < 2.5) return 'Rare';
  if (prob < 5) return 'Uncommon';
  return 'Common';
};

export const getFullStats = (u: PlayerUnichar, def: UnicharDef) => {
  const mods = u.statModifiers || {
    attack: 1.0,
    hp: 1.0,
    critChance: 1.0,
    spAtk: 1.0,
    prodRate: 1.0,
  };
  return {
    attack: Math.round(getStatAtLevel(def.baseStats.attack, u.level, 0.05) * mods.attack),
    hp: Math.round(getStatAtLevel(def.baseStats.hp, u.level, 0.05) * mods.hp),
    critChance: getStatAtLevel(def.baseStats.critChance, u.level, 0.01) * mods.critChance,
    spAtk: Math.round(getStatAtLevel(def.baseStats.spAtk, u.level, 0.05) * mods.spAtk),
    prodRate: getStatAtLevel(def.baseStats.prodRate, u.level, 0.05) * mods.prodRate,
  };
};

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(1);
  const formatter = new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2
  });
  return formatter.format(num);
};
