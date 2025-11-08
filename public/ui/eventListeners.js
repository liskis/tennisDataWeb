// public/ui/eventListeners.js

import { CURRENT_STATS, SELECTED_SET, recalculateStats, updateSelectedSet } from '../state.js';
import { updateAndRender } from '../main.js';
import { renderScoreArea, updateLanguageSwitcherUI } from './scoreAreaRenderer.js';
import { drawBasicCharts, drawAdvanceCharts } from './chartRenderer.js';
import { renderPointHistory } from './pointHistoryRenderer.js';
import { renderAiAnalysis } from './aiAnalysisRenderer.js';
import { translate, setLanguage, getLanguage } from '../i18n.js';

export function setupUIEventListeners() {
    // Language Switcher
    document.getElementById('language-switcher').addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newLang = e.target.dataset.lang;
            if (newLang !== getLanguage()) {
                setLanguage(newLang);
                await updateAndRender();
            }
        }
    });

    // Tabs
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // 1. タブの見た目を切り替える
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(tab.dataset.tab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // 2. ★★★重要★★★
            //    各タブのコンテンツを描画する前に、必ずヘッダー情報と選手名を更新する
            renderScoreArea();

            const clickedTabId = tab.dataset.tab;
            const isAiTab = clickedTabId === 'ai-analysis';
            
            let needsFullUpdate = false;
            // AIタブに切り替えた際、もしセットが選択されていたら全体表示に戻す
            if (isAiTab && SELECTED_SET !== 0) {
                updateSelectedSet(0);
                needsFullUpdate = true;
            }
            
            // AIタブではセット選択ボタンを無効化する
            document.querySelectorAll('.set-score-button').forEach(btn => {
                const isAllButton = btn.textContent === translate('all_sets');
                btn.disabled = isAiTab && !isAllButton;
            });
            
            // 3. 状態に応じて描画処理を実行する
            if (needsFullUpdate) {
                // セット選択が変更されたので、統計再計算を含めて全体を再描画
                await updateAndRender();
            } else {
                // 統計データが未計算の場合のみ計算する
                if (Object.keys(CURRENT_STATS).length === 0) {
                    recalculateStats();
                }
                
                // 対応するタブのコンテンツを描画する
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
                    case 'ai-analysis':
                        renderAiAnalysis();
                        break;
                }
            }
        });
    });
    
    // 初期UI状態の更新
    updateLanguageSwitcherUI();
}