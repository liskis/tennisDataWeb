import { fetchAllGameData } from './firebase/data.js';
import { calculateAllStats } from './stats/calculator.js';
// ▼▼▼ `updateLanguageSwitcherUI` をインポートに追加 ▼▼▼
import { renderScoreArea, setupUIEventListeners, updateStaticText, updateLanguageSwitcherUI } from './ui/renderer.js';
import { initI18n } from './i18n.js';

// --- Global State ---
export let ALL_DATA = {};
export let CURRENT_STATS = {};
export let SELECTED_SET = 0;
export let PLAYER_NAMES = {
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

export function normalizeTimestamp(timestampField) {
  if (!timestampField) return null;
  if (timestampField && typeof timestampField.toDate === 'function') {
    return timestampField.toDate();
  }
  if (typeof timestampField.seconds === 'number') return new Date(timestampField.seconds * 1000);
  if (typeof timestampField._seconds === 'number') return new Date(timestampField._seconds * 1000);
  console.warn("Cannot convert timestamp:", timestampField);
  return null;
}

// --- Chart Loader ---
google.charts.load('current', {'packages':['corechart', 'bar']});
const googleChartsPromise = new Promise(resolve => google.charts.setOnLoadCallback(resolve));

// --- Main Application Logic ---
async function main() {
  initI18n(); 
  updateStaticText(); 

  await googleChartsPromise;
  console.log("Google Charts ready.");

  const loadingIndicator = document.getElementById('loading-indicator');
  const appContainer = document.getElementById('app-container');

  try {
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    
    const db = firebase.firestore();
    const auth = firebase.auth();

    if (isLocal) {
      console.log("Running in local environment.");
    } else {
      console.log("Running in production environment.");
      await auth.signInAnonymously();
      console.log("Signed in anonymously.");
    }
    
    const url = new URL(window.location.href);
    const matchId = url.searchParams.get("matchId");

    if (matchId) {
      ALL_DATA = await fetchAllGameData(db, matchId);
      
      loadingIndicator.style.display = 'none';
      appContainer.style.display = 'block';

      setupUIEventListeners();
      document.querySelector('.tab-button.active').click();
    } else {
      loadingIndicator.setAttribute('data-i18n-key', 'no_match_id');
      updateStaticText();
    }
  } catch (error) {
      const errorKey = (error.code && (error.code.includes('permission-denied') || error.code.includes('unauthenticated')))
          ? 'error_loading'
          : 'error_generic';
      loadingIndicator.setAttribute('data-i18n-key', errorKey);
      updateStaticText();
      if (errorKey === 'error_generic') {
          loadingIndicator.textContent += (error.message || 'Unknown error');
      }
      console.error("Error in main process:", error);
  }
}

// --- UI Update Trigger ---
export async function updateAndRender() {
    updateStaticText();
    updateLanguageSwitcherUI(); // ▼▼▼ ここでボタンUIの更新を呼び出す ▼▼▼
    renderScoreArea();
    recalculateStats();

    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        const activeTabId = activeTab.dataset.tab;
        const rendererModule = await import('./ui/renderer.js');
        switch (activeTabId) {
            case 'basic-data':
                rendererModule.drawBasicCharts();
                break;
            case 'advance-data':
                rendererModule.drawAdvanceCharts();
                break;
            case 'point-history':
                rendererModule.renderPointHistory();
                break;
            case 'ai-analysis':
                rendererModule.renderAiAnalysis();
                break;
        }
    }
}

// --- Start Application ---
main();