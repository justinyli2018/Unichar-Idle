import { Move } from '../types';

export const MOVES: Record<string, Move> = {
  // Physical Moves
  'strike': {
    id: 'strike',
    name: 'Strike',
    description: 'A basic physical attack.',
    power: 100,
    accuracy: 100,
    type: 'physical',
    rarity: 1000000
  },
  'pierce': {
    id: 'pierce',
    name: 'Pierce',
    description: 'A fast, sharp physical strike.',
    power: 110,
    accuracy: 95,
    type: 'physical',
    rarity: 800000
  },
  'bash': {
    id: 'bash',
    name: 'Bash',
    description: 'A heavy physical blow.',
    power: 120,
    accuracy: 90,
    type: 'physical',
    rarity: 500000
  },
  'smash': {
    id: 'smash',
    name: 'Smash',
    description: 'A crushing, weighty attack.',
    power: 130,
    accuracy: 85,
    type: 'physical',
    rarity: 350000
  },
  'slash': {
    id: 'slash',
    name: 'Slash',
    description: 'A sharp physical cut.',
    power: 140,
    accuracy: 95,
    type: 'physical',
    rarity: 250000
  },
  'crunch': {
    id: 'crunch',
    name: 'Crunch',
    description: 'A powerful bite.',
    power: 160,
    accuracy: 100,
    type: 'physical',
    rarity: 100000
  },
  'giga_impact': {
    id: 'giga_impact',
    name: 'Giga Impact',
    description: 'A massive physical impact.',
    power: 250,
    accuracy: 90,
    type: 'physical',
    rarity: 10000
  },

  // Special Moves
  'ping': {
    id: 'ping',
    name: 'Ping',
    description: 'A fast data packet attack.',
    power: 90,
    accuracy: 100,
    type: 'special',
    rarity: 1000000
  },
  'spark': {
    id: 'spark',
    name: 'Spark',
    description: 'A small electrical discharge.',
    power: 100,
    accuracy: 100,
    type: 'special',
    rarity: 1000000
  },
  'beam': {
    id: 'beam',
    name: 'Beam',
    description: 'A focused energy beam.',
    power: 120,
    accuracy: 100,
    type: 'special',
    rarity: 500000
  },
  'hex': {
    id: 'hex',
    name: 'Hex',
    description: 'A curse woven from raw code.',
    power: 140,
    accuracy: 95,
    type: 'special',
    rarity: 300000
  },
  'pulse': {
    id: 'pulse',
    name: 'Pulse',
    description: 'An energy pulse.',
    power: 150,
    accuracy: 100,
    type: 'special',
    rarity: 250000
  },
  'glitch': {
    id: 'glitch',
    name: 'Glitch',
    description: 'A chaotic rupture in reality.',
    power: 180,
    accuracy: 80,
    type: 'special',
    rarity: 100000
  },
  'nova': {
    id: 'nova',
    name: 'Nova',
    description: 'A powerful energy explosion.',
    power: 200,
    accuracy: 85,
    type: 'special',
    rarity: 50000
  },
  'hyper_beam': {
    id: 'hyper_beam',
    name: 'Hyper Beam',
    description: 'A devastating energy beam.',
    power: 300,
    accuracy: 90,
    type: 'special',
    rarity: 10000
  },

  // Status Moves
  'focus': {
    id: 'focus',
    name: 'Focus',
    description: 'Increases concentration.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 1000000
  },
  'harden': {
    id: 'harden',
    name: 'Harden',
    description: 'Increases defense.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 500000
  },
  'encrypt': {
    id: 'encrypt',
    name: 'Encrypt',
    description: 'Scrambles data to drastically boost defense.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 400000
  },
  'glare': {
    id: 'glare',
    name: 'Glare',
    description: 'Intimidates the foe.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 250000
  },
  'cache': {
    id: 'cache',
    name: 'Cache',
    description: 'Stores temporary data to restore health.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 200000
  },
  'firewall': {
    id: 'firewall',
    name: 'Firewall',
    description: 'Blocks incoming attacks and burns the attacker.',
    power: 0,
    accuracy: 100,
    type: 'status',
    rarity: 50000
  }
};