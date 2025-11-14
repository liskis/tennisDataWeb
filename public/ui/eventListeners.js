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
            const clickedTabId = tab.dataset.tab;
            const targetPanel = document.getElementById(clickedTabId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // 2. ヘッダー情報を更新
            renderScoreArea();

            const isAiTab = clickedTabId === 'ai-analysis';
            
            let needsFullUpdate = false;
            if (isAiTab && SELECTED_SET !== 0) {
                updateSelectedSet(0);
                needsFullUpdate = true;
            }
            
            document.querySelectorAll('.set-score-button').forEach(btn => {
                const isAllButton = btn.textContent === translate('all_sets');
                btn.disabled = isAiTab && !isAllButton;
            });
            
            // 3. 状態に応じて描画処理を実行する
            if (needsFullUpdate) {
                await updateAndRender();
            } else {
                if (Object.keys(CURRENT_STATS).length === 0) {
                    recalculateStats();
                }
                
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
    
    updateLanguageSwitcherUI();
}