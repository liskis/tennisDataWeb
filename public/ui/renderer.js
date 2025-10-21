import { ALL_DATA, SELECTED_SET, updateSelectedSet, updateAndRender, normalizeTimestamp } from '../main.js';

// 各モジュールから描画関数をインポート
import { drawBasicCharts } from './chartRenderer.js';
import { drawAdvanceCharts } from './chartRenderer.js';
import { renderPointHistory } from './pointHistoryRenderer.js';

// インポートした関数を、main.jsが使えるように再度エクスポートする
export { drawBasicCharts, drawAdvanceCharts, renderPointHistory };

// スコアエリアの描画はこのファイルに残す
export function renderScoreArea() {
    const match = ALL_DATA.matchData[0];
    if (!match) return;

    const startDate = normalizeTimestamp(match.matchStartDate);
    
    if (!startDate) {
        document.getElementById('match-date').textContent = '日付不明';
    } else {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('match-date').textContent = startDate.toLocaleDateString('ja-JP', options);
    }
    
    document.getElementById('match-type').textContent = `${match.matchFormat} / ${match.matchType}`;
    
    const setScoresContainer = document.getElementById('set-scores');
    setScoresContainer.innerHTML = '';
    const allSetBtn = document.createElement('button');
    allSetBtn.className = 'set-score-button' + (SELECTED_SET === 0 ? ' active' : '');
    allSetBtn.textContent = '全体';
    allSetBtn.onclick = () => { updateSelectedSet(0); updateAndRender(); };
    setScoresContainer.appendChild(allSetBtn);

    const sortedSets = (ALL_DATA.setData || []).sort((a, b) => {
        const dateA = normalizeTimestamp(a.setStartDate);
        const dateB = normalizeTimestamp(b.setStartDate);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
    });

    sortedSets.forEach((set, index) => {
        const setBtn = document.createElement('button');
        const setNumber = index + 1;
        setBtn.className = 'set-score-button' + (SELECTED_SET === setNumber ? ' active' : '');
        setBtn.textContent = `第${setNumber}セット (${set.getGameCount}-${set.lostGameCount})`;
        setBtn.onclick = () => { updateSelectedSet(setNumber); updateAndRender(); };
        setScoresContainer.appendChild(setBtn);
    });
}

// UIイベントリスナーの設定もこのファイルに残す
export function setupUIEventListeners() {
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            const clickedTabId = tab.dataset.tab;
            switch (clickedTabId) {
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
        });
    });
}