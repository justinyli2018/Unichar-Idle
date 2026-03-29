import { UnicharClass } from '../types';

export interface ClassSynergy {
  className: UnicharClass;
  thresholds: { count: number; bonus: number }[];
}

export interface SynergyGroup {
  id: string;
  name: string;
  description: string;
  requiredDefIds: string[]; // e.g.['lower_a', 'lower_b', 'lower_c']
  bonus: number; // Multiplier bonus (e.g. 0.5 for +50%)
}

export const CLASS_SYNERGIES: ClassSynergy[] = [
  {
    className: 'Letter',
    thresholds:[
      { count: 3, bonus: 0.1 },
      { count: 6, bonus: 0.25 },
      { count: 9, bonus: 0.5 },
      { count: 12, bonus: 1.0 },
      { count: 26, bonus: 3.0 }, // The full alphabet bonus!
    ]
  },
  {
    className: 'Number',
    thresholds:[
      { count: 2, bonus: 0.15 },
      { count: 4, bonus: 0.4 },
      { count: 8, bonus: 1.0 },
      { count: 10, bonus: 2.0 },
    ]
  },
  {
    className: 'Symbol',
    thresholds:[
      { count: 2, bonus: 0.2 },
      { count: 4, bonus: 0.5 },
      { count: 6, bonus: 1.2 },
      { count: 10, bonus: 2.5 },
    ]
  },
  {
    className: 'Lowercase',
    thresholds:[
      { count: 4, bonus: 0.2 },
      { count: 8, bonus: 0.5 },
      { count: 16, bonus: 1.5 },
    ]
  },
  {
    className: 'Uppercase',
    thresholds:[
      { count: 4, bonus: 0.3 },
      { count: 8, bonus: 0.75 },
      { count: 16, bonus: 2.0 },
    ]
  },
  {
    className: 'Emoji',
    thresholds:[
      { count: 2, bonus: 0.5 },
      { count: 4, bonus: 1.5 },
      { count: 6, bonus: 3.0 },
    ]
  }
];

export const SYNERGY_GROUPS: SynergyGroup[] =[
  {
    id: 'vowels',
    name: 'Vowel Power',
    description: 'All lowercase vowels together.',
    requiredDefIds:['lower_a', 'lower_e', 'lower_i', 'lower_o', 'lower_u'],
    bonus: 0.5
  },
  {
    id: 'alphabet_start',
    name: 'ABC',
    description: 'The beginning of the alphabet.',
    requiredDefIds: ['lower_a', 'lower_b', 'lower_c'],
    bonus: 0.2
  },
  {
    id: 'binary',
    name: 'Binary Code',
    description: 'Just zeros and ones.',
    requiredDefIds:['digit_0', 'digit_1'],
    bonus: 0.3
  },
  {
    id: 'lucky_seven',
    name: 'Lucky Sevens',
    description: 'Double the luck.',
    requiredDefIds: ['digit_7', 'digit_7'],
    bonus: 0.4
  },
  {
    id: 'shout',
    name: 'Exclamation!',
    description: 'Feeling loud.',
    requiredDefIds: ['symbol_33', 'upper_A', 'upper_A'],
    bonus: 0.6
  },
  {
    id: 'qwerty',
    name: 'QWERTY',
    description: 'The iconic top row of the keyboard.',
    requiredDefIds:['lower_q', 'lower_w', 'lower_e', 'lower_r', 'lower_t', 'lower_y'],
    bonus: 1.0
  },
  {
    id: 'punctuation',
    name: 'Punctuation Squad',
    description: 'Ending sentences with proper style.',
    requiredDefIds:['symbol_46', 'symbol_44', 'symbol_33', 'symbol_63'], // . , ! ?
    bonus: 0.6
  },
  {
    id: 'math_basics',
    name: 'Math Basics',
    description: 'The foundation of arithmetic.',
    requiredDefIds:['symbol_43', 'symbol_45', 'symbol_42', 'symbol_61'], // + - * =
    bonus: 0.8
  },
  {
    id: 'hexadecimal',
    name: 'Hex Base',
    description: 'Machine language building blocks.',
    requiredDefIds:['upper_A', 'upper_B', 'upper_C', 'upper_D', 'upper_E', 'upper_F'],
    bonus: 1.5
  },
  {
    id: 'brackets_galore',
    name: 'Brackets Galore',
    description: 'Safely encapsulating logic.',
    requiredDefIds:['symbol_40', 'symbol_41', 'symbol_91', 'symbol_93'], // ( ) [ ]
    bonus: 0.7
  },
  {
    id: 'emotional_rollercoaster',
    name: 'Emotional Rollercoaster',
    description: 'Tears of joy and sadness.',
    requiredDefIds:['emoji_joy', 'emoji_sob'],
    bonus: 0.8
  },
  {
    id: 'heaven_and_hell',
    name: 'Heaven & Hell',
    description: 'Perfect balance of light and dark.',
    requiredDefIds: ['emoji_angel', 'emoji_devil'],
    bonus: 1.0
  },
  {
    id: 'jurassic_park',
    name: 'Extinction Event',
    description: 'Prehistoric power unleashed.',
    requiredDefIds:['emoji_trex', 'emoji_meteor', 'emoji_volcano'], // You can add meteor and volcano!
    bonus: 1.5
  },
  {
    id: 'sword_and_board',
    name: 'Sword & Board',
    description: 'The classic adventurer loadout.',
    requiredDefIds: ['emoji_sword', 'emoji_shield'],
    bonus: 0.8
  },
  {
    id: 'weather_control',
    name: 'Mother Nature',
    description: 'Harnessing the elements.',
    requiredDefIds:['emoji_sun', 'emoji_moon', 'emoji_lightning', 'emoji_tornado', 'emoji_ocean'],
    bonus: 2.5
  }
];