export type UnicharClass = 'Letter' | 'Number' | 'Symbol' | 'Lowercase' | 'Uppercase' | 'Emoji';

export interface BaseStats {
  attack: number;
  hp: number;
  critChance: number;
  spAtk: number;
  wisdom: number;
  prodRate: number;
}

export interface Move {
  id: string;
  name: string;
  description: string;
  power: number;
  accuracy: number;
  type: 'physical' | 'special' | 'status';
  rarity: number; // 1 to 1,000,000
}

export interface UnicharMoveSlot {
  moveId: string;
  chance: number; // 1 to 1,000,000 (relative weight for this unichar)
}

export interface UnicharDef {
  id: string;
  char: string;
  name: string;
  classes: UnicharClass[];
  baseStats: BaseStats;
  rarity: number; // 1 to 1,000,000
  possibleMoves: UnicharMoveSlot[];
}

export type StatTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface StatModifiers {
  attack: number;
  hp: number;
  critChance: number;
  spAtk: number;
  prodRate: number;
}

export interface PlayerUnichar {
  instanceId: string;
  defId: string;
  level: number;
  exp: number;
  acquiredAt: number;
  statModifiers: StatModifiers;
  moves: string[]; // move IDs
  nickname?: string;
  notes?: string;
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Divine';

export type CollectionSortOption = 'rarity' | 'date' | 'level' | 'attack' | 'hp' | 'crit' | 'spAtk' | 'prod';
export type CollectionViewMode = 'individual' | 'stacked' | 'base';
export type SearchScope = 'all' | 'nickname' | 'character';

export interface CollectionSettings {
  sortBy: CollectionSortOption;
  sortAscending: boolean;
  searchQuery: string;
  searchScope: SearchScope;
  rarityFilter: string;
  tierFilter: string;
  viewMode: CollectionViewMode;
}

export type UpgradeSortOption = 'rarity' | 'level' | 'count' | 'attack' | 'hp' | 'crit' | 'spAtk' | 'prod';
export type InstanceSortOption = 'level' | 'tier' | 'attack' | 'hp' | 'crit' | 'spAtk' | 'prod';

export interface UpgradeSettings {
  searchQuery: string;
  searchScope: SearchScope;
  rarityFilter: string;
  tierFilter: string;
  sortBy: UpgradeSortOption;
  sortAscending: boolean;
  instanceSortBy: InstanceSortOption;
}

export interface Banner {
  id: string;
  name: string;
  description: string;
  costPerSummon: number;
  excludedRarities: Rarity[];
  minRarity?: Rarity;
  customWeights?: Record<string, number>; // Map of defId to weight
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'levelUp' | 'synergy';
  timestamp: number;
}

export interface GameState {
  bits: number;
  freePulls: number;
  hasReceivedInitialFreePulls?: boolean;
  inventory: PlayerUnichar[];
  idleSlots: (string | null)[];
  lastSaveTime: number;
  currentBannerId: string;
  tabSettings: {
    collection: CollectionSettings;
    upgrade: UpgradeSettings;
  };
  discoveredGroupIds: string[];
  availableGroupIds: string[];
  notifications: GameNotification[];
}
