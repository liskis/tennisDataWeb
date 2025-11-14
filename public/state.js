// public/state.js

import { calculateAllStats } from './stats/calculator.js';

// --- Global State ---
export const ALL_DATA = {};
export let CURRENT_STATS = {};
export let SELECTED_SET = 0;
export const PLAYER_NAMES = {
  mySelf: 'You',
  partner: 'Partner',
  opponentTeam: 'Opponent'
};

export function updateSelectedSet(newSet) {
  SELECTED_SET = newSet;
}

export function recalculateStats() {
  CURRENT_STATS = calculateAllStats();
}