import { ALL_DATA, SELECTED_SET, updateSelectedSet, updateAndRender, normalizeTimestamp } from '../main.js';
import { drawBasicCharts, drawAdvanceCharts } from './chartRenderer.js';
import { renderPointHistory } from './pointHistoryRenderer.js';

export { drawBasicCharts, drawAdvanceCharts, renderPointHistory };

export function renderScoreArea() {
    const match = ALL_DATA.matchData?.[0];
    const users = ALL_DATA.userData || [];
    if (!match) return;

    const playerNamesContainer = document.getElementById('player-names');
    if (playerNamesContainer) {
        
        // 1. relationが'mySelf'のユーザーを自分として特定
        const myUser = users.find(user => user.relation === 'mySelf');
        const myName = myUser ? myUser.myName : '自分';
        
        // 2. userDataのidをキー、myNameを値とするマップを作成
        const playerNameMap = users.reduce((map, user) => {
            map[user.id] = user.myName;
            return map;
        }, {});

        let myTeamDisplay, opponentTeamDisplay;

        if (match.matchFormat === 'doubles') {
            const partnerName = playerNameMap[match.partnerId] || 'パートナー';
            const opponentAName = playerNameMap[match.playerAid] || '相手A';
            const opponentBName = playerNameMap[match.playerBid] || '相手B';
            
            myTeamDisplay = `${myName} / ${partnerName}`;
            opponentTeamDisplay = `${opponentAName} / ${opponentBName}`;
        } else {
            const opponentAName = playerNameMap[match.playerAid] || '相手';
            
            myTeamDisplay = myName;
            opponentTeamDisplay = opponentAName;
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