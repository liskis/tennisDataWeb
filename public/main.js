// public/main.js

import { fetchAllGameData } from './firebase/data.js';
import { ALL_DATA, recalculateStats } from './state.js';
import { initI18n, translate, setLanguage, getLanguage } from './i18n.js';
import { renderScoreArea, updateLanguageSwitcherUI } from './ui/scoreAreaRenderer.js';
import { setupUIEventListeners } from './ui/eventListeners.js';

// --- Timestamp Utility ---
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
    const db = firebase.firestore();
    const auth = firebase.auth();

    // カスタムクレーム方式のセキュリティルールに合わせて、Webアプリでも匿名認証を行う
    if (!auth.currentUser) {
      await auth.signInAnonymously();
      console.log("Web app signed in anonymously to read data.");
    }
    
    const url = new URL(window.location.href);
    const matchId = url.searchParams.get("matchId");

    if (matchId) {
      const fetchedData = await fetchAllGameData(db, matchId);
      Object.assign(ALL_DATA, fetchedData);
      

      // matchDataのinputModeが'beginner'の場合、アドバンスデータタブを非表示にする
      if (ALL_DATA.matchData && ALL_DATA.matchData.length > 0) {
        const matchInfo = ALL_DATA.matchData[0];
        if (matchInfo.inputMode === 'beginner') {
          const advanceTabButton = document.querySelector('button[data-tab="advance-data"]');
          if (advanceTabButton) {
            advanceTabButton.style.display = 'none';
          }
        }
      }

      loadingIndicator.style.display = 'none';
      appContainer.style.display = 'block';

      setupUIEventListeners();
      // 最初のタブをプログラム的にクリックして初期表示を行う
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

// --- UI Update Helpers ---
export function updateStaticText() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        const translatedText = translate(key);

        // ▼▼▼ ここから変更 ▼▼▼
        // 改行マーカー '|' が含まれているかチェック
        if (translatedText.includes('|')) {
            // マーカーをスマホ表示用の<br>タグに置換してinnerHTMLに設定
            // /\|/g は、文字列中の全ての'|'を置換するための正規表現
            el.innerHTML = translatedText.replace(/\|/g, '<br class="br-on-sp">');
        } else {
            // 含まれていない場合は従来通りtextContentに設定
            el.textContent = translatedText;
        }
        // ▲▲▲ ここまで変更 ▲▲▲
    });
}


// --- UI Update Trigger ---
export async function updateAndRender() {
    updateStaticText();
    updateLanguageSwitcherUI();
    renderScoreArea();
    recalculateStats();

    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        const activeTabId = activeTab.dataset.tab;
        
        switch (activeTabId) {
            case 'basic-data':
                const { drawBasicCharts } = await import('./ui/chartRenderer.js');
                drawBasicCharts();
                break;
            case 'advance-data':
                const { drawAdvanceCharts } = await import('./ui/chartRenderer.js');
                drawAdvanceCharts();
                break;
            case 'point-history':
                const { renderPointHistory } = await import('./ui/pointHistoryRenderer.js');
                renderPointHistory();
                break;
            case 'ai-analysis':
                const { renderAiAnalysis } = await import('./ui/aiAnalysisRenderer.js');
                renderAiAnalysis();
                break;
        }
    }
}

// --- Start Application ---
main();