import { UnicharDef, UnicharClass } from '../types';

// Helper to create a unichar definition with defaults
const createUnichar = (
  id: string,
  char: string,
  name: string,
  classes: UnicharClass[],
  rarity: number,
  prodRate: number,
  attack: number,
  hp: number,
  spAtk: number,
  critChance: number,
  possibleMoves: { moveId: string; chance: number }[]
): UnicharDef => ({
  id,
  char,
  name,
  classes,
  rarity,
  baseStats: {
    attack,
    hp,
    critChance,
    spAtk,
    wisdom: 100,
    prodRate
  },
  possibleMoves
});

export const UNICHARS: Record<string, UnicharDef> = {
  // === LOWERCASE LETTERS (Frequency-based Rarity) ===
  'lower_e': createUnichar('lower_e', 'e', 'Lowercase e', ['Letter', 'Lowercase'], 1000000, 2.0, 10, 50, 10, 0.05,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'ping', chance: 500000 }]),
  'lower_t': createUnichar('lower_t', 't', 'Lowercase t', ['Letter', 'Lowercase'], 716000, 2.2, 12, 55, 8, 0.06,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'pierce', chance: 300000 }]),
  'lower_a': createUnichar('lower_a', 'a', 'Lowercase a', ['Letter', 'Lowercase'], 645000, 2.3, 11, 52, 11, 0.07,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'spark', chance: 400000 }]),
  'lower_o': createUnichar('lower_o', 'o', 'Lowercase o', ['Letter', 'Lowercase'], 590000, 2.4, 9, 65, 12, 0.04,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'harden', chance: 500000 }]),
  'lower_i': createUnichar('lower_i', 'i', 'Lowercase i', ['Letter', 'Lowercase'], 551000, 2.5, 8, 45, 15, 0.08,[{ moveId: 'ping', chance: 1000000 }, { moveId: 'pulse', chance: 200000 }]),
  'lower_n': createUnichar('lower_n', 'n', 'Lowercase n', ['Letter', 'Lowercase'], 527000, 2.6, 13, 58, 7, 0.05,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'bash', chance: 400000 }]),
  'lower_s': createUnichar('lower_s', 's', 'Lowercase s', ['Letter', 'Lowercase'], 496000, 2.7, 14, 48, 9, 0.10,[{ moveId: 'slash', chance: 800000 }, { moveId: 'glare', chance: 300000 }]),
  'lower_h': createUnichar('lower_h', 'h', 'Lowercase h', ['Letter', 'Lowercase'], 480000, 2.8, 12, 60, 12, 0.05,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'focus', chance: 400000 }]),
  'lower_r': createUnichar('lower_r', 'r', 'Lowercase r', ['Letter', 'Lowercase'], 472000, 2.9, 14, 65, 14, 0.06,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'pierce', chance: 600000 }]),
  'lower_d': createUnichar('lower_d', 'd', 'Lowercase d', ['Letter', 'Lowercase'], 336000, 3.2, 16, 75, 15, 0.07,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'harden', chance: 800000 }]),
  'lower_l': createUnichar('lower_l', 'l', 'Lowercase l', ['Letter', 'Lowercase'], 320000, 3.3, 15, 80, 16, 0.08,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'beam', chance: 300000 }]),
  'lower_c': createUnichar('lower_c', 'c', 'Lowercase c', ['Letter', 'Lowercase'], 216000, 3.8, 18, 85, 22, 0.09,[{ moveId: 'crunch', chance: 500000 }, { moveId: 'spark', chance: 800000 }]),
  'lower_u': createUnichar('lower_u', 'u', 'Lowercase u', ['Letter', 'Lowercase'], 216000, 3.8, 16, 85, 24, 0.05,[{ moveId: 'ping', chance: 1000000 }, { moveId: 'cache', chance: 600000 }]),
  'lower_m': createUnichar('lower_m', 'm', 'Lowercase m', ['Letter', 'Lowercase'], 192000, 3.9, 20, 95, 20, 0.07,[{ moveId: 'smash', chance: 800000 }, { moveId: 'focus', chance: 500000 }]),
  'lower_w': createUnichar('lower_w', 'w', 'Lowercase w', ['Letter', 'Lowercase'], 184000, 4.0, 22, 105, 18, 0.08,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'pulse', chance: 500000 }]),
  'lower_f': createUnichar('lower_f', 'f', 'Lowercase f', ['Letter', 'Lowercase'], 176000, 4.0, 24, 90, 20, 0.10,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pierce', chance: 700000 }]),
  'lower_g': createUnichar('lower_g', 'g', 'Lowercase g', ['Letter', 'Lowercase'], 160000, 4.2, 20, 110, 18, 0.06,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'glare', chance: 600000 }]),
  'lower_p': createUnichar('lower_p', 'p', 'Lowercase p', ['Letter', 'Lowercase'], 152000, 4.3, 21, 100, 21, 0.09,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'beam', chance: 400000 }]),
  'lower_y': createUnichar('lower_y', 'y', 'Lowercase y', ['Letter', 'Lowercase'], 152000, 4.3, 19, 90, 25, 0.10,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'hex', chance: 500000 }]),
  'lower_b': createUnichar('lower_b', 'b', 'Lowercase b', ['Letter', 'Lowercase'], 112000, 4.5, 22, 100, 18, 0.08,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'smash', chance: 400000 }]),
  'lower_v': createUnichar('lower_v', 'v', 'Lowercase v', ['Letter', 'Lowercase'], 72000, 6.0, 26, 115, 26, 0.12,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'slash', chance: 600000 }]),
  'lower_k': createUnichar('lower_k', 'k', 'Lowercase k', ['Letter', 'Lowercase'], 56000, 6.5, 28, 120, 25, 0.15,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'crunch', chance: 400000 }]),
  'lower_j': createUnichar('lower_j', 'j', 'Lowercase j', ['Letter', 'Lowercase'], 12000, 7.5, 30, 140, 30, 0.25,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'glitch', chance: 600000 }]),
  'lower_x': createUnichar('lower_x', 'x', 'Lowercase x', ['Letter', 'Lowercase'], 12000, 7.5, 30, 140, 30, 0.25,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'hex', chance: 600000 }]),
  'lower_q': createUnichar('lower_q', 'q', 'Lowercase q', ['Letter', 'Lowercase'], 8000, 8.5, 35, 180, 45, 0.15,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'glitch', chance: 500000 }]),
  'lower_z': createUnichar('lower_z', 'z', 'Lowercase z', ['Letter', 'Lowercase'], 8000, 8.8, 42, 160, 38, 0.18,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'giga_impact', chance: 150000 }]),

  // === UPPERCASE LETTERS (~15% Rarity of Lowercase, 1.5x Multiplier to stats) ===
  'upper_E': createUnichar('upper_E', 'E', 'Uppercase E', ['Letter', 'Uppercase'], 150000, 3.0, 15, 75, 15, 0.07,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'ping', chance: 600000 }]),
  'upper_T': createUnichar('upper_T', 'T', 'Uppercase T', ['Letter', 'Uppercase'], 107000, 3.3, 18, 82, 12, 0.09,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'pierce', chance: 400000 }]),
  'upper_A': createUnichar('upper_A', 'A', 'Uppercase A', ['Letter', 'Uppercase'], 96000, 3.5, 16, 78, 16, 0.10,[{ moveId: 'beam', chance: 1000000 }, { moveId: 'nova', chance: 300000 }]),
  'upper_O': createUnichar('upper_O', 'O', 'Uppercase O', ['Letter', 'Uppercase'], 88000, 3.6, 13, 97, 18, 0.06,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'harden', chance: 800000 }]),
  'upper_I': createUnichar('upper_I', 'I', 'Uppercase I', ['Letter', 'Uppercase'], 82000, 3.7, 12, 67, 22, 0.12,[{ moveId: 'ping', chance: 1000000 }, { moveId: 'pulse', chance: 500000 }]),
  'upper_N': createUnichar('upper_N', 'N', 'Uppercase N', ['Letter', 'Uppercase'], 79000, 3.9, 19, 87, 10, 0.07,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'bash', chance: 600000 }]),
  'upper_S': createUnichar('upper_S', 'S', 'Uppercase S', ['Letter', 'Uppercase'], 74000, 4.0, 21, 72, 13, 0.15,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'nova', chance: 400000 }]),
  'upper_H': createUnichar('upper_H', 'H', 'Uppercase H', ['Letter', 'Uppercase'], 72000, 4.2, 18, 90, 18, 0.07,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'focus', chance: 600000 }]),
  'upper_R': createUnichar('upper_R', 'R', 'Uppercase R', ['Letter', 'Uppercase'], 71000, 4.3, 21, 97, 21, 0.09,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'pierce', chance: 800000 }]),
  'upper_D': createUnichar('upper_D', 'D', 'Uppercase D', ['Letter', 'Uppercase'], 50000, 4.8, 24, 112, 22, 0.10,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'harden', chance: 1000000 }]),
  'upper_L': createUnichar('upper_L', 'L', 'Uppercase L', ['Letter', 'Uppercase'], 48000, 4.9, 22, 120, 24, 0.12,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'beam', chance: 500000 }]),
  'upper_C': createUnichar('upper_C', 'C', 'Uppercase C', ['Letter', 'Uppercase'], 32000, 5.7, 27, 127, 33, 0.13,[{ moveId: 'crunch', chance: 800000 }, { moveId: 'spark', chance: 1000000 }]),
  'upper_U': createUnichar('upper_U', 'U', 'Uppercase U', ['Letter', 'Uppercase'], 32000, 5.7, 24, 127, 36, 0.07,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'cache', chance: 800000 }]),
  'upper_M': createUnichar('upper_M', 'M', 'Uppercase M', ['Letter', 'Uppercase'], 29000, 5.8, 30, 142, 30, 0.10,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'giga_impact', chance: 300000 }]),
  'upper_W': createUnichar('upper_W', 'W', 'Uppercase W', ['Letter', 'Uppercase'], 28000, 6.0, 33, 157, 27, 0.12,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'pulse', chance: 700000 }]),
  'upper_F': createUnichar('upper_F', 'F', 'Uppercase F', ['Letter', 'Uppercase'], 26000, 6.0, 36, 135, 30, 0.15,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pierce', chance: 900000 }]),
  'upper_G': createUnichar('upper_G', 'G', 'Uppercase G', ['Letter', 'Uppercase'], 24000, 6.3, 30, 165, 27, 0.09,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'glare', chance: 800000 }]),
  'upper_P': createUnichar('upper_P', 'P', 'Uppercase P', ['Letter', 'Uppercase'], 23000, 6.4, 31, 150, 31, 0.13,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'beam', chance: 600000 }]),
  'upper_Y': createUnichar('upper_Y', 'Y', 'Uppercase Y', ['Letter', 'Uppercase'], 23000, 6.4, 28, 135, 37, 0.15,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'hex', chance: 800000 }]),
  'upper_B': createUnichar('upper_B', 'B', 'Uppercase B', ['Letter', 'Uppercase'], 17000, 6.7, 33, 150, 27, 0.12,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'smash', chance: 600000 }]),
  'upper_V': createUnichar('upper_V', 'V', 'Uppercase V', ['Letter', 'Uppercase'], 11000, 9.0, 39, 172, 39, 0.18,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'slash', chance: 900000 }]),
  'upper_K': createUnichar('upper_K', 'K', 'Uppercase K', ['Letter', 'Uppercase'], 8000, 9.7, 42, 180, 37, 0.22,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'crunch', chance: 600000 }]),
  'upper_J': createUnichar('upper_J', 'J', 'Uppercase J', ['Letter', 'Uppercase'], 2000, 11.2, 45, 210, 45, 0.35,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'glitch', chance: 800000 }]),
  'upper_X': createUnichar('upper_X', 'X', 'Uppercase X', ['Letter', 'Uppercase'], 2000, 11.2, 45, 210, 45, 0.35,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'hex', chance: 900000 }]),
  'upper_Q': createUnichar('upper_Q', 'Q', 'Uppercase Q', ['Letter', 'Uppercase'], 1000, 12.7, 52, 270, 67, 0.25,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'glitch', chance: 800000 }]),
  'upper_Z': createUnichar('upper_Z', 'Z', 'Uppercase Z', ['Letter', 'Uppercase'], 1000, 13.2, 63, 240, 57, 0.27,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'giga_impact', chance: 400000 }]),

  // === NUMBERS (Smoothly decreasing rarity based on Benford's Law & usage) ===
  'digit_0': createUnichar('digit_0', '0', 'Digit 0', ['Number'], 150000, 4.0, 15, 150, 15, 0.05,[{ moveId: 'harden', chance: 1000000 }, { moveId: 'pulse', chance: 400000 }]),
  'digit_1': createUnichar('digit_1', '1', 'Digit 1', ['Number'], 140000, 4.2, 20, 100, 10, 0.10,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'pierce', chance: 500000 }]),
  'digit_2': createUnichar('digit_2', '2', 'Digit 2', ['Number'], 130000, 4.4, 22, 105, 12, 0.11,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'bash', chance: 400000 }]),
  'digit_3': createUnichar('digit_3', '3', 'Digit 3', ['Number'], 120000, 4.6, 24, 110, 15, 0.12,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'beam', chance: 300000 }]),
  'digit_4': createUnichar('digit_4', '4', 'Digit 4', ['Number'], 110000, 4.8, 25, 115, 18, 0.12,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'slash', chance: 300000 }]),
  'digit_5': createUnichar('digit_5', '5', 'Digit 5', ['Number'], 100000, 5.0, 26, 120, 20, 0.13,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pulse', chance: 400000 }]),
  'digit_6': createUnichar('digit_6', '6', 'Digit 6', ['Number'], 90000, 5.2, 27, 125, 22, 0.13,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'glare', chance: 300000 }]),
  'digit_7': createUnichar('digit_7', '7', 'Digit 7', ['Number'], 80000, 6.0, 28, 110, 35, 0.14,[{ moveId: 'beam', chance: 1000000 }, { moveId: 'nova', chance: 200000 }]),
  'digit_8': createUnichar('digit_8', '8', 'Digit 8', ['Number'], 70000, 6.5, 30, 135, 30, 0.15,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'harden', chance: 600000 }]),
  'digit_9': createUnichar('digit_9', '9', 'Digit 9', ['Number'], 60000, 7.2, 32, 130, 40, 0.16,[{ moveId: 'hyper_beam', chance: 500000 }, { moveId: 'nova', chance: 500000 }]),

  // === SYMBOLS (Rarity mapped to internet syntax and code frequency) ===
  'symbol_46': createUnichar('symbol_46', '.', 'Period', ['Symbol'], 200000, 3.5, 12, 60, 15, 0.05,[{ moveId: 'ping', chance: 1000000 }, { moveId: 'pierce', chance: 500000 }]),
  'symbol_44': createUnichar('symbol_44', ',', 'Comma', ['Symbol'], 180000, 3.7, 10, 65, 12, 0.05,[{ moveId: 'strike', chance: 1000000 }, { moveId: 'cache', chance: 400000 }]),
  'symbol_45': createUnichar('symbol_45', '-', 'Hyphen', ['Symbol'], 150000, 4.0, 18, 55, 18, 0.10,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pierce', chance: 600000 }]),
  'symbol_40': createUnichar('symbol_40', '(', 'Open Paren', ['Symbol'], 50000, 6.0, 25, 140, 25, 0.10,[{ moveId: 'harden', chance: 1000000 }, { moveId: 'encrypt', chance: 800000 }]),
  'symbol_41': createUnichar('symbol_41', ')', 'Close Paren', ['Symbol'], 50000, 6.0, 25, 140, 25, 0.10,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'firewall', chance: 800000 }]),
  'symbol_61': createUnichar('symbol_61', '=', 'Equals', ['Symbol'], 45000, 6.5, 30, 120, 30, 0.12,[{ moveId: 'beam', chance: 1000000 }, { moveId: 'pulse', chance: 500000 }]),
  'symbol_43': createUnichar('symbol_43', '+', 'Plus', ['Symbol'], 40000, 6.8, 28, 150, 28, 0.12,[{ moveId: 'cache', chance: 1000000 }, { moveId: 'smash', chance: 600000 }]),
  'symbol_63': createUnichar('symbol_63', '?', 'Symbol ?', ['Symbol'], 15000, 6.5, 25, 120, 45, 0.10,[{ moveId: 'glare', chance: 1000000 }, { moveId: 'pulse', chance: 500000 }]),
  'symbol_37': createUnichar('symbol_37', '%', 'Symbol %', ['Symbol'], 12000, 7.2, 32, 140, 35, 0.08,[{ moveId: 'spark', chance: 1000000 }, { moveId: 'beam', chance: 400000 }]),
  'symbol_91': createUnichar('symbol_91', '[', 'Open Bracket', ['Symbol'], 10000, 8.5, 40, 160, 40, 0.15,[{ moveId: 'encrypt', chance: 1000000 }, { moveId: 'hex', chance: 700000 }]),
  'symbol_93': createUnichar('symbol_93', ']', 'Close Bracket', ['Symbol'], 10000, 8.5, 40, 160, 40, 0.15,[{ moveId: 'firewall', chance: 1000000 }, { moveId: 'smash', chance: 700000 }]),
  'symbol_33': createUnichar('symbol_33', '!', 'Symbol !', ['Symbol'], 10000, 9.5, 50, 150, 60, 0.20,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 400000 }, { moveId: 'pulse', chance: 600000 }]),
  'symbol_38': createUnichar('symbol_38', '&', 'Symbol &', ['Symbol'], 8000, 9.0, 35, 180, 50, 0.12,[{ moveId: 'spark', chance: 1000000 }, { moveId: 'pulse', chance: 800000 }]),
  'symbol_35': createUnichar('symbol_35', '#', 'Symbol #', ['Symbol'], 5000, 12.0, 45, 250, 45, 0.15,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'crunch', chance: 800000 }, { moveId: 'harden', chance: 1000000 }]),
  'symbol_64': createUnichar('symbol_64', '@', 'Symbol @', ['Symbol'], 5000, 11.5, 40, 220, 70, 0.18,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'nova', chance: 700000 }, { moveId: 'focus', chance: 1000000 }]),
  'symbol_42': createUnichar('symbol_42', '*', 'Symbol *', ['Symbol'], 3000, 15.0, 55, 300, 90, 0.22,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 800000 }]),
  'symbol_36': createUnichar('symbol_36', '$', 'Symbol $', ['Symbol'], 1000, 25.0, 80, 400, 80, 0.25,[{ moveId: 'giga_impact', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'nova', chance: 1000000 }, { moveId: 'crunch', chance: 1000000 }]),

  // === EMOJIS (Mythic/Divine rarity) ===
  'emoji_joy': createUnichar('emoji_joy', '😂', 'Joy Emoji', ['Emoji'], 1500, 18.0, 65, 350, 70, 0.20,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'glare', chance: 800000 }]),
  'emoji_sob': createUnichar('emoji_sob', '😭', 'Sob Emoji', ['Emoji'], 1300, 21.0, 65, 360, 75, 0.22,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'cache', chance: 1000000 }]),
  'emoji_heart': createUnichar('emoji_heart', '❤️', 'Heart Emoji', ['Emoji'], 1200, 20.0, 60, 400, 80, 0.25,[{ moveId: 'cache', chance: 1000000 }, { moveId: 'beam', chance: 800000 }]),
  'emoji_thumbs': createUnichar('emoji_thumbs', '👍', 'Thumbs Up', ['Emoji'], 1000, 25.0, 80, 380, 75, 0.25,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'focus', chance: 1000000 }]),
  'emoji_skull': createUnichar('emoji_skull', '💀', 'Skull Emoji', ['Emoji'], 800, 35.0, 100, 450, 100, 0.35,[{ moveId: 'hex', chance: 1000000 }, { moveId: 'glitch', chance: 1000000 }, { moveId: 'crunch', chance: 600000 }]),
  'emoji_fire': createUnichar('emoji_fire', '🔥', 'Fire Emoji', ['Emoji'], 500, 50.0, 120, 600, 150, 0.30,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'giga_impact', chance: 500000 }]),
  'emoji_sparkles': createUnichar('emoji_sparkles', '✨', 'Sparkles Emoji', ['Emoji'], 200, 75.0, 100, 500, 200, 0.40,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'beam', chance: 1000000 }, { moveId: 'focus', chance: 1000000 }]),
  'emoji_rocket': createUnichar('emoji_rocket', '🚀', 'Rocket Emoji', ['Emoji'], 100, 120.0, 200, 800, 100, 0.25,[{ moveId: 'giga_impact', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'bash', chance: 1000000 }]),
  'emoji_crown': createUnichar('emoji_crown', '👑', 'Crown Emoji', ['Emoji'], 50, 250.0, 150, 1200, 150, 0.35,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'crunch', chance: 1000000 }, { moveId: 'glare', chance: 1000000 }]),
  'emoji_gem': createUnichar('emoji_gem', '💎', 'Gem Emoji', ['Emoji'], 20, 500.0, 180, 2000, 180, 0.50,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'giga_impact', chance: 1000000 }, { moveId: 'crunch', chance: 1000000 }]),
  'emoji_sunglasses': createUnichar('emoji_sunglasses', '😎', 'Cool Emoji', ['Emoji'], 1000, 20.0, 75, 380, 75, 0.25,[{ moveId: 'focus', chance: 1000000 }, { moveId: 'beam', chance: 600000 }]),
  'emoji_devil': createUnichar('emoji_devil', '😈', 'Devil Emoji',['Emoji'], 800, 28.0, 95, 420, 110, 0.30,[{ moveId: 'hex', chance: 1000000 }, { moveId: 'slash', chance: 800000 }, { moveId: 'glare', chance: 1000000 }]),
  'emoji_angel': createUnichar('emoji_angel', '😇', 'Angel Emoji', ['Emoji'], 800, 28.0, 80, 500, 90, 0.20,[{ moveId: 'cache', chance: 1000000 }, { moveId: 'beam', chance: 800000 }, { moveId: 'harden', chance: 1000000 }]),
  'emoji_alien': createUnichar('emoji_alien', '👽', 'Alien Emoji', ['Emoji'], 600, 35.0, 70, 400, 130, 0.25,[{ moveId: 'glitch', chance: 1000000 }, { moveId: 'pulse', chance: 1000000 }, { moveId: 'beam', chance: 700000 }]),
  'emoji_robot': createUnichar('emoji_robot', '🤖', 'Robot Emoji', ['Emoji'], 600, 35.0, 110, 550, 110, 0.15,[{ moveId: 'firewall', chance: 1000000 }, { moveId: 'smash', chance: 1000000 }, { moveId: 'beam', chance: 500000 }]),
  'emoji_ghost': createUnichar('emoji_ghost', '👻', 'Ghost Emoji', ['Emoji'], 500, 40.0, 60, 300, 140, 0.35,[{ moveId: 'hex', chance: 1000000 }, { moveId: 'glare', chance: 1000000 }, { moveId: 'ping', chance: 800000 }]),
  'emoji_poop': createUnichar('emoji_poop', '💩', 'Poop Emoji', ['Emoji'], 1500, 15.0, 40, 600, 40, 0.05,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'glare', chance: 500000 }]),

  'emoji_dog': createUnichar('emoji_dog', '🐶', 'Dog Emoji', ['Emoji'], 900, 25.0, 85, 400, 50, 0.20,[{ moveId: 'crunch', chance: 1000000 }, { moveId: 'strike', chance: 1000000 }]),
  'emoji_cat': createUnichar('emoji_cat', '🐱', 'Cat Emoji', ['Emoji'], 900, 25.0, 75, 350, 60, 0.35,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pierce', chance: 800000 }]),
  'emoji_lion': createUnichar('emoji_lion', '🦁', 'Lion Emoji', ['Emoji'], 400, 55.0, 130, 600, 80, 0.30,[{ moveId: 'crunch', chance: 1000000 }, { moveId: 'smash', chance: 1000000 }, { moveId: 'glare', chance: 1000000 }]),
  'emoji_wolf': createUnichar('emoji_wolf', '🐺', 'Wolf Emoji', ['Emoji'], 450, 50.0, 120, 550, 85, 0.35,[{ moveId: 'crunch', chance: 1000000 }, { moveId: 'slash', chance: 1000000 }, { moveId: 'focus', chance: 800000 }]),
  'emoji_snake': createUnichar('emoji_snake', '🐍', 'Snake Emoji', ['Emoji'], 500, 45.0, 110, 400, 120, 0.40,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'hex', chance: 800000 }]),
  'emoji_trex': createUnichar('emoji_trex', '🦖', 'T-Rex Emoji', ['Emoji'], 150, 100.0, 180, 900, 50, 0.25,[{ moveId: 'giga_impact', chance: 1000000 }, { moveId: 'crunch', chance: 1000000 }, { moveId: 'smash', chance: 1000000 }]),
  'emoji_dragon': createUnichar('emoji_dragon', '🐉', 'Dragon Emoji', ['Emoji'], 50, 250.0, 170, 1000, 180, 0.35,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'hyper_beam', chance: 1000000 }, { moveId: 'crunch', chance: 1000000 }, { moveId: 'firewall', chance: 500000 }]),
  'emoji_unicorn': createUnichar('emoji_unicorn', '🦄', 'Unicorn Emoji', ['Emoji'], 75, 180.0, 100, 800, 200, 0.40,[{ moveId: 'beam', chance: 1000000 }, { moveId: 'pulse', chance: 1000000 }, { moveId: 'pierce', chance: 1000000 }, { moveId: 'cache', chance: 800000 }]),

  'emoji_sun': createUnichar('emoji_sun', '☀️', 'Sun Emoji', ['Emoji'], 300, 65.0, 100, 700, 160, 0.20,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'beam', chance: 1000000 }, { moveId: 'harden', chance: 800000 }]),
  'emoji_moon': createUnichar('emoji_moon', '🌙', 'Moon Emoji', ['Emoji'], 300, 65.0, 90, 650, 150, 0.25,[{ moveId: 'pulse', chance: 1000000 }, { moveId: 'hex', chance: 1000000 }, { moveId: 'focus', chance: 800000 }]),
  'emoji_lightning': createUnichar('emoji_lightning', '⚡', 'Lightning Emoji', ['Emoji'], 250, 70.0, 120, 500, 180, 0.45,[{ moveId: 'spark', chance: 1000000 }, { moveId: 'hyper_beam', chance: 800000 }, { moveId: 'ping', chance: 1000000 }]),
  'emoji_tornado': createUnichar('emoji_tornado', '🌪️', 'Tornado Emoji', ['Emoji'], 250, 70.0, 140, 600, 130, 0.30,[{ moveId: 'smash', chance: 1000000 }, { moveId: 'slash', chance: 1000000 }, { moveId: 'giga_impact', chance: 600000 }]),
  'emoji_ocean': createUnichar('emoji_ocean', '🌊', 'Ocean Wave Emoji', ['Emoji'], 350, 60.0, 110, 800, 140, 0.20,[{ moveId: 'bash', chance: 1000000 }, { moveId: 'pulse', chance: 1000000 }, { moveId: 'cache', chance: 500000 }]),

  'emoji_sword': createUnichar('emoji_sword', '⚔️', 'Swords Emoji', ['Emoji'], 400, 55.0, 160, 450, 40, 0.40,[{ moveId: 'slash', chance: 1000000 }, { moveId: 'pierce', chance: 1000000 }, { moveId: 'strike', chance: 1000000 }]),
  'emoji_shield': createUnichar('emoji_shield', '🛡️', 'Shield Emoji', ['Emoji'], 400, 55.0, 60, 900, 40, 0.10,[{ moveId: 'harden', chance: 1000000 }, { moveId: 'firewall', chance: 1000000 }, { moveId: 'bash', chance: 800000 }]),
  'emoji_bow': createUnichar('emoji_bow', '🏹', 'Bow Emoji',['Emoji'], 450, 50.0, 140, 400, 80, 0.45,[{ moveId: 'pierce', chance: 1000000 }, { moveId: 'ping', chance: 800000 }]),
  'emoji_magic_wand': createUnichar('emoji_magic_wand', '🪄', 'Magic Wand Emoji', ['Emoji'], 200, 80.0, 50, 550, 190, 0.25,[{ moveId: 'hex', chance: 1000000 }, { moveId: 'beam', chance: 1000000 }, { moveId: 'glitch', chance: 700000 }]),
  'emoji_bomb': createUnichar('emoji_bomb', '💣', 'Bomb Emoji', ['Emoji'], 350, 60.0, 200, 200, 150, 0.50,[{ moveId: 'nova', chance: 1000000 }, { moveId: 'giga_impact', chance: 800000 }, { moveId: 'smash', chance: 1000000 }]),

};

export const CLASSES: UnicharClass[] = ['Letter', 'Lowercase', 'Uppercase', 'Number', 'Symbol', 'Emoji'];

export const TOTAL_WEIGHT = Object.values(UNICHARS).reduce((sum, u) => sum + u.rarity, 0);

export const getProbability = (defId: string): number => {
  const def = UNICHARS[defId];
  if (!def) return 0;
  return (def.rarity / TOTAL_WEIGHT) * 100;
};