import { ALL_DATA, SELECTED_SET, PLAYER_NAMES, updateSelectedSet } from '../state.js';
import { updateAndRender } from '../main.js';
import { normalizeTimestamp } from '../main.js';
import { translate, getLanguage } from '../i18n.js';

export function updateLanguageSwitcherUI() {
    const lang = getLanguage();
    document.querySelectorAll('#language-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

export function renderScoreArea() {
    const match = ALL_DATA.matchData?.[0];
    const users = ALL_DATA.userData || [];
    if (!match) {
        console.warn("Match data not found in ALL_DATA for rendering score area.", ALL_DATA);
        return;
    }

    const playerNamesContainer = document.getElementById('player-names');
    if (playerNamesContainer) {
        
        const myUser = users.find(user => user.relation === 'mySelf');
        const myName = myUser ? myUser.myName : translate('player_my_self');
        
        const playerNameMap = users.reduce((map, user) => {
            map[user.id] = user.myName;
            return map;
        }, {});

        let myTeamHtml, opponentTeamHtml;
        PLAYER_NAMES.mySelf = myName;

        if (match.matchFormat === 'doubles') {
            const partnerName = playerNameMap[match.partnerId] || translate('player_partner');
            const opponentAName = playerNameMap[match.playerAid] || 'Opponent A';
            const opponentBName = playerNameMap[match.playerBid] || 'Opponent B';
            
            PLAYER_NAMES.partner = partnerName;
            PLAYER_NAMES.opponentTeam = `${opponentAName} / ${opponentBName}`;

            myTeamHtml = `<span class="player-name">${myName}</span><span class="name-separator"> / </span><span class="player-name">${partnerName}</span>`;
            opponentTeamHtml = `<span class="player-name">${opponentAName}</span><span class="name-separator"> / </span><span class="player-name">${opponentBName}</span>`;

        } else { // singles
            const opponentAName = playerNameMap[match.playerAid] || translate('player_opponent');
            
            myTeamHtml = `<span class="player-name">${myName}</span>`;
            opponentTeamHtml = `<span class="player-name">${opponentAName}</span>`;
            
            PLAYER_NAMES.partner = null;
            PLAYER_NAMES.opponentTeam = opponentAName;
        }
        
        playerNamesContainer.innerHTML = `
            <div class="team-names my-team">
                ${myTeamHtml}
            </div>
            <div class="vs-divider">VS</div>
            <div class="team-names opponent-team">
                ${opponentTeamHtml}
            </div>
        `;
    }

    const startDate = normalizeTimestamp(match.matchStartDate);
    const matchDateContainer = document.getElementById('match-date');
    
    // ▼▼▼ 日付表示のロジックを修正 ▼▼▼
    if (!startDate) {
        matchDateContainer.textContent = 'Date unknown';
    } else {
        const lang = getLanguage();
        const locale = lang === 'ja' ? 'ja-JP' : 'en-US';

        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false }; // 24時間表記に統一

        const dateString = startDate.toLocaleDateString(locale, dateOptions);
        const timeString = startDate.toLocaleTimeString(locale, timeOptions);
        
        matchDateContainer.innerHTML = `${dateString}<br class="br-on-sp">${timeString}`;
    }
    // ▲▲▲ 修正ここまで ▲▲▲
    
    const translatedFormat = translate(match.matchFormat);
    const translatedType = translate(match.matchType);
    
    const matchTypeContainer = document.getElementById('match-type');
    if (matchTypeContainer) {
        matchTypeContainer.innerHTML = `
            <span class="match-info-part">${translatedFormat}</span>
            <span class="info-separator"> / </span>
            <span class="match-info-part">${translatedType}</span>
        `;
    }
    
    const setScoresContainer = document.getElementById('set-scores');
    setScoresContainer.innerHTML = '';
    const allSetBtn = document.createElement('button');
    allSetBtn.className = 'set-score-button' + (SELECTED_SET === 0 ? ' active' : '');
    allSetBtn.textContent = translate('all_sets');
    allSetBtn.onclick = async () => { if (!allSetBtn.disabled) { updateSelectedSet(0); await updateAndRender(); } };
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
        setBtn.onclick = async () => { if (!setBtn.disabled) { updateSelectedSet(setNumber); await updateAndRender(); } };
        setScoresContainer.appendChild(setBtn);
    });
}