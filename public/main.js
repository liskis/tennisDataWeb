import { fetchAllGameData } from './firebase/data.js';
import { calculateAllStats } from './stats/calculator.js';
import { renderScoreArea, renderPointHistory, drawBasicCharts, drawAdvanceCharts, setupUIEventListeners } from './ui/renderer.js';

// --- Global State ---
export let ALL_DATA = {};
export let CURRENT_STATS = {};
export let SELECTED_SET = 0;

export function updateSelectedSet(newSet) {
  SELECTED_SET = newSet;
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
  await googleChartsPromise;
  console.log("Google Chartsの準備が完了しました。");

  const loadingIndicator = document.getElementById('loading-indicator');
  const appContainer = document.getElementById('app-container');

  try {
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    
    // index.htmlで初期化されたグローバルなfirebaseオブジェクトを使用
    const db = firebase.firestore();
    const auth = firebase.auth();

    if (isLocal) {
      console.log("ローカル環境で実行します。");
      db.useEmulator('localhost', 8080); // Compat版のエミュレータ接続方法
      console.log("ローカルのFirestoreエミュレータに接続しました。");
    } else {
      console.log("本番環境で実行します。");
      await auth.signInAnonymously();
      console.log("匿名認証に成功しました。");
    }
    
    const url = new URL(window.location.href);
    const matchId = url.searchParams.get("matchId");

    if (matchId) {
      ALL_DATA = await fetchAllGameData(db, matchId);
      
      loadingIndicator.style.display = 'none';
      appContainer.style.display = 'block';

      updateAndRender();
      setupUIEventListeners();
    } else {
      loadingIndicator.textContent = '試合IDが指定されていません';
    }
  } catch (error) {
      if (error.code && (error.code.includes('permission-denied') || error.code.includes('unauthenticated'))) {
        loadingIndicator.textContent = 'データの読み込みに失敗しました。アクセス権限を確認してください。';
      } else {
        loadingIndicator.textContent = `エラーが発生しました: ${error.message || '詳細不明'}`;
      }
      console.error("メイン処理でエラー:", error);
  }
}

// --- UI Update Trigger ---
export function updateAndRender() {
    renderScoreArea();
    CURRENT_STATS = calculateAllStats();

    const activeTabId = document.querySelector('.tab-button.active').dataset.tab;
    switch (activeTabId) {
        case 'basic-data':
            drawBasicCharts();
            break;
        case 'advance-data':
            drawAdvanceCharts();
            break;
        case 'point-history':
            renderPointHistory();
            break;
    }
}

// --- Start Application ---
main();