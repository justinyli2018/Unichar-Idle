import { Banner } from '../types';

export const BANNERS: Banner[] = [
  {
    id: 'standard',
    name: 'Standard Banner',
    description: 'All characters available.',
    costPerSummon: 4000,
    excludedRarities: [],
  },
  {
    id: 'uncommon',
    name: 'Uncommon Banner',
    description: 'No Common characters.',
    costPerSummon: 20000,
    excludedRarities: ['Common'],
    minRarity: 'Uncommon',
  },
  {
    id: 'rare',
    name: 'Rare Banner',
    description: 'No Common or Uncommon characters.',
    costPerSummon: 100000,
    excludedRarities: ['Common', 'Uncommon'],
    minRarity: 'Rare',
  },
  {
    id: 'epic',
    name: 'Epic Banner',
    description: 'No Common, Uncommon, or Rare characters.',
    costPerSummon: 500000,
    excludedRarities: ['Common', 'Uncommon', 'Rare'],
    minRarity: 'Epic',
  },
  {
    id: 'legendary',
    name: 'Legendary Banner',
    description: 'Only Legendary and Mythic characters.',
    costPerSummon: 2500000,
    excludedRarities: ['Common', 'Uncommon', 'Rare', 'Epic'],
    minRarity: 'Legendary',
  },
  {
    id: 'emoji',
    name: 'Emoji Banner',
    description: 'Only Emoji characters.',
    costPerSummon: 50000,
    excludedRarities: [],
    customWeights: {
      'emoji_joy': 1000,
      'emoji_sob': 1000,
      'emoji_heart': 1000,
      'emoji_thumbs': 1000,
      'emoji_skull': 500,
      'emoji_fire': 300,
      'emoji_sparkles': 200,
      'emoji_rocket': 100,
      'emoji_crown': 50,
      'emoji_gem': 20,
    }
  },
  {
    id: 'brackets',
    name: 'Brackets Banner',
    description: 'Only parentheses and brackets.',
    costPerSummon: 25000,
    excludedRarities: [],
    customWeights: {
      'symbol_40': 1000, // (
      'symbol_41': 1000, // )
      'symbol_91': 1000, // [
      'symbol_93': 1000, // ]
    }
  }
];
