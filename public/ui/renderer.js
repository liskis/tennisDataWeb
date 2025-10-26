import { ALL_DATA, SELECTED_SET, updateSelectedSet, updateAndRender as triggerFullUpdate, normalizeTimestamp, PLAYER_NAMES, CURRENT_STATS, recalculateStats } from '../main.js';
import { drawBasicCharts, drawAdvanceCharts } from './chartRenderer.js';
import { renderPointHistory } from './pointHistoryRenderer.js';
import { renderAiAnalysis } from './aiAnalysisRenderer.js';
import { translate, setLanguage, getLanguage } from '../i18n.js';

export { drawBasicCharts, drawAdvanceCharts, renderPointHistory, renderAiAnalysis, updateLanguageSwitcherUI };

export function updateStaticText() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        el.textContent = translate(key);
    });
}

function updateLanguageSwitcherUI() {
    const lang = getLanguage();
    document.querySelectorAll('#language-switcher button').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

export function renderScoreArea() {
    const match = ALL_DATA.matchData?.[0];
    const users = ALL_DATA.userData || [];
    if (!match) return;

    const playerNamesContainer = document.getElementById('player-names');
    if (playerNamesContainer) {
        
        const myUser = users.find(user => user.relation === 'mySelf');
        const myName = myUser ? myUser.myName : translate('player_my_self');
        
        const playerNameMap = users.reduce((map, user) => {
            map[user.id] = user.myName;
            return map;
        }, {});

        let myTeamDisplay, opponentTeamDisplay;
        PLAYER_NAMES.mySelf = myName;

        if (match.matchFormat === 'doubles') {
            const partnerName = playerNameMap[match.partnerId] || translate('player_partner');
            const opponentAName = playerNameMap[match.playerAid] || 'Opponent A';
            const opponentBName = playerNameMap[match.playerBid] || 'Opponent B';
            
            myTeamDisplay = `${myName} / ${partnerName}`;
            opponentTeamDisplay = `${opponentAName} / ${opponentBName}`;

            PLAYER_NAMES.partner = partnerName;
            PLAYER_NAMES.opponentTeam = opponentTeamDisplay;

        } else {
            const opponentAName = playerNameMap[match.playerAid] || translate('player_opponent');
            
            myTeamDisplay = myName;
            opponentTeamDisplay = opponentAName;

            PLAYER_NAMES.partner = null;
            PLAYER_NAMES.opponentTeam = opponentTeamDisplay;
        }
        
        playerNamesContainer.innerHTML = `
            <div class="team-names my-team">
                <span>${myTeamDisplay}</span>
            </div>
            <div class="vs-divider">VS</div>
            <div class="team-names opponent-team">
                <span>${opponentTeamDisplay}</span>
            </div>
        `;
    }

    const startDate = normalizeTimestamp(match.matchStartDate);
    
    if (!startDate) {
        document.getElementById('match-date').textContent = 'Date unknown';
    } else {
        const lang = getLanguage();
        const locale = lang === 'ja' ? 'ja-JP' : 'en-US';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('match-date').textContent = startDate.toLocaleDateString(locale, options);
    }
    
    // ▼▼▼ ここを修正 ▼▼▼
    const translatedFormat = translate(match.matchFormat);
    const translatedType = translate(match.matchType);
    document.getElementById('match-type').textContent = `${translatedFormat} / ${translatedType}`;
    // ▲▲▲ 修正ここまで ▲▲▲
    
    const setScoresContainer = document.getElementById('set-scores');
    setScoresContainer.innerHTML = '';
    const allSetBtn = document.createElement('button');
    allSetBtn.className = 'set-score-button' + (SELECTED_SET === 0 ? ' active' : '');
    allSetBtn.textContent = translate('all_sets');
    allSetBtn.onclick = async () => { if (!allSetBtn.disabled) { updateSelectedSet(0); await triggerFullUpdate(); } };
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
        setBtn.textContent = `${translate('set_x', {number: setNumber})} (${set.getGameCount}-${set.lostGameCount})`;
        setBtn.onclick = async () => { if (!setBtn.disabled) { updateSelectedSet(setNumber); await triggerFullUpdate(); } };
        setScoresContainer.appendChild(setBtn);
    });
}

export function setupUIEventListeners() {
    // Language Switcher
    const switcher = document.getElementById('language-switcher');
    switcher.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newLang = e.target.dataset.lang;
            if (newLang !== getLanguage()) {
                setLanguage(newLang);
                await triggerFullUpdate();
            }
        }
    });

    // Tabs
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // First, update text and non-tab UI elements
            updateStaticText();
            renderScoreArea();
            updateLanguageSwitcherUI();

            // Then handle tab switching logic
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            const clickedTabId = tab.dataset.tab;
            const isAiTab = clickedTabId === 'ai-analysis';
            
            let needsRecalc = false;
            if (isAiTab && SELECTED_SET !== 0) {
                updateSelectedSet(0);
                renderScoreArea(); 
                needsRecalc = true;
            }
            
            document.querySelectorAll('.set-score-button').forEach(btn => {
                const isAllButton = btn.textContent === translate('all_sets');
                btn.disabled = isAiTab && !isAllButton;
            });
            
            if(needsRecalc) {
                recalculateStats();
            } else if (Object.keys(CURRENT_STATS).length === 0) {
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
        });
    });
    
    // Initial UI state update
    updateLanguageSwitcherUI();
}