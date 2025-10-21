import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
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

/**
 * FirestoreのTimestampオブジェクト、または { seconds: ... } / { _seconds: ... } 形式の
 * オブジェクトをJavaScriptのDateオブジェクトに変換する
 * @param {object | null | undefined} timestampField 変換対象のフィールド
 * @returns {Date | null} 変換後のDateオブジェクト、または変換不可の場合はnull
 */
export function normalizeTimestamp(timestampField) {
  if (!timestampField) {
    return null;
  }
  // 1. toDateメソッドを持つ場合 (Firestore Timestampオブジェクト)
  if (typeof timestampField.toDate === 'function') {
    return timestampField.toDate();
  }
  // 2. secondsプロパティを持つ場合
  if (typeof timestampField.seconds === 'number') {
    return new Date(timestampField.seconds * 1000);
  }
  // 3. _secondsプロパティを持つ場合 (コンソールログで確認された形式)
  if (typeof timestampField._seconds === 'number') {
    return new Date(timestampField._seconds * 1000);
  }
  // 変換できない場合は警告を出し、nullを返す
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
    const response = await fetch('/__/firebase/init.json');
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("ローカルのFirestoreエミュレータに接続しました。");
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
      loadingIndicator.textContent = 'エラーが発生しました。コンソールを確認してください。';
      console.error(error);
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