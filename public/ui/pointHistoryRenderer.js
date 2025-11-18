// public/ui/pointHistoryRenderer.js

import { ALL_DATA, SELECTED_SET } from '../state.js';
import { normalizeTimestamp } from '../main.js';
import { translate } from '../i18n.js';

function calculateInGameScoresAfterPoint(points, isTieBreak) {
    let myScore = 0;
    let oppScore = 0;
    const scoreMap = { 0: '0', 1: '15', 2: '30', 3: '40' };

    const getTennisScore = (myS, oppS) => {
        if (isTieBreak) {
            return `${myS}-${oppS}`;
        }
        if (myS >= 3 && oppS >= 3) {
            if (myS === oppS) return '40-40';
            if (myS > oppS) return 'Ad-40';
            return '40-Ad';
        }
        const myScoreText = scoreMap[myS] || '40';
        const oppScoreText = scoreMap[oppS] || '40';
        return `${myScoreText}-${oppScoreText}`;
    };

    return points.map((point, index) => {
        const isLastPoint = index === points.length - 1;

        if (point.whichPoint === 'myTeam') myScore++;
        else oppScore++;

        if (isLastPoint) {
            const gameWon = (isTieBreak && myScore >= 7 && myScore - oppScore >= 2) || 
                            (!isTieBreak && myScore >= 4 && myScore - oppScore >= 2);
            const gameLost = (isTieBreak && oppScore >= 7 && oppScore - myScore >= 2) || 
                             (!isTieBreak && oppScore >= 4 && oppScore - myScore >= 2);

            if (gameWon) {
                point.inGameScoreAfter = translate('ph_get_game_long');
                point.isGameEnd = 'get';
            } else if (gameLost) {
                point.inGameScoreAfter = translate('ph_lost_game_long');
                point.isGameEnd = 'lost';
            } else {
                point.inGameScoreAfter = getTennisScore(myScore, oppScore);
            }
        } else {
             point.inGameScoreAfter = getTennisScore(myScore, oppScore);
        }

        return point;
    });
}

function getWhoseInfo(point) {
    const whose = point.whose;
    const winner = point.whichPoint;
    let textKey = '';
    let className = '';

    if (winner === 'myTeam') {
        if (whose === 'me') {
            textKey = 'pie_my_winner';
            className = 'ph-my-winner';
        } else if (whose === 'partner') {
            textKey = 'pie_partner_winner';
            className = 'ph-partner-winner';
        } else if (['playerA', 'playerB', 'opponent'].includes(whose)) {
            textKey = 'pie_opponent_miss';
            className = 'ph-opponent-miss';
        }
    } else { // winner === 'opponent'
        if (whose === 'me') {
            textKey = 'pie_my_miss';
            className = 'ph-my-miss';
        } else if (whose === 'partner') {
            textKey = 'pie_partner_miss';
            className = 'ph-partner-miss';
        } else if (['playerA', 'playerB', 'opponent'].includes(whose)) {
            textKey = 'pie_opponent_winner';
            className = 'ph-opponent-winner';
        }
    }

    if (textKey) {
        return { text: translate(textKey), className: className };
    }
    return { text: '-', className: '' };
}

export function renderPointHistory() {
    // ... (renderPointHistory 関数の前半は変更なし) ...
    const container = document.getElementById('point-history');
    if (!container) return;

    container.innerHTML = `<h2 data-i18n-key="point_history_title">${translate('point_history_title')}</h2><div id="history-container"></div>`;
    const historyContainer = document.getElementById('history-container');

    const allSets = ALL_DATA.setData || [];
    const allGames = ALL_DATA.gameData || [];
    const allPoints = ALL_DATA.pointData || [];

    const sortedAllSets = [...allSets].sort((a, b) => normalizeTimestamp(a.setStartDate) - normalizeTimestamp(b.setStartDate));
    const setsToRender = (SELECTED_SET === 0 ? sortedAllSets : [sortedAllSets[SELECTED_SET - 1]]).filter(Boolean);

    if (setsToRender.length === 0) {
        historyContainer.innerHTML = `<p>${translate('no_data_to_display')}</p>`;
        return;
    }

    const setIdsToRender = new Set(setsToRender.map(s => s.setId));
    const gamesToRender = allGames.filter(g => setIdsToRender.has(g.setId));
    const gameIdsToRender = new Set(gamesToRender.map(g => g.gameId));
    const pointsToRender = allPoints.filter(p => gameIdsToRender.has(p.gameId));

    const pointsByGame = pointsToRender.reduce((acc, point) => {
        if (!acc[point.gameId]) acc[point.gameId] = [];
        acc[point.gameId].push(point);
        return acc;
    }, {});

    const sortedGames = gamesToRender.sort((a, b) => normalizeTimestamp(a.gameStartDate) - normalizeTimestamp(b.gameStartDate));
    
    setsToRender.forEach((set) => {
        const setHeader = document.createElement('div');
        setHeader.className = 'set-header';
        const setNumber = sortedAllSets.findIndex(s => s.setId === set.setId) + 1;
        setHeader.innerHTML = `<h3>${translate('set_x', {number: setNumber})} (${set.getGameCount} - ${set.lostGameCount})</h3>`;
        historyContainer.appendChild(setHeader);

        const gamesInSet = sortedGames.filter(g => g.setId === set.setId);

        let myGameCountInSet = 0;
        let oppGameCountInSet = 0;

        gamesInSet.forEach((game, gameIndex) => {
            if (game.getPoint > game.lostPoint) {
                myGameCountInSet++;
            } else {
                oppGameCountInSet++;
            }
            
            const gameTypeKey = game.isTieBreak ? 'ph_tie_break' : (game.servOrRet === 'serviceGame' ? 'label_service_game' : 'label_return_game');
            const resultKey = game.getPoint > game.lostPoint
                ? (game.servOrRet === 'serviceGame' ? 'ph_keep' : 'ph_break')
                : (game.servOrRet === 'serviceGame' ? 'ph_service_down' : 'ph_kept_by_opponent');
            
            const gameHeader = document.createElement('div');
            gameHeader.className = 'game-header';
            
            const serverInfo = game.server ? ` - <span class="game-server">${translate('ph_server')}: ${game.server}</span>` : '';
            gameHeader.innerHTML = `<h4>${translate('ph_game_x', {number: gameIndex + 1})} (${translate(gameTypeKey)})${serverInfo} - <span class="game-result">${translate(resultKey)}</span></h4>`;
            historyContainer.appendChild(gameHeader);

            const table = document.createElement('table');
            table.className = 'point-history-table';
            table.innerHTML = `<thead><tr>
                <th>${translate('ph_position')}</th>
                <th>${translate('ph_point')}</th>
                <th>${translate('ph_get_lost')}</th>
                <th>${translate('ph_service')}</th>
                <th>${translate('ph_shot')}</th>
                <th>${translate('ph_whose')}</th>
            </tr></thead>`;
            const tbody = document.createElement('tbody');

            let pointsInGame = pointsByGame[game.gameId] || [];
            if (pointsInGame.length > 0) {
                pointsInGame.sort((a, b) => normalizeTimestamp(a.dateTime) - normalizeTimestamp(b.dateTime));
                pointsInGame = calculateInGameScoresAfterPoint(pointsInGame, game.isTieBreak || false);
                
                pointsInGame.forEach(point => {
                    const row = tbody.insertRow();
                    row.insertCell().textContent = translate(point.myPosition) || point.myPosition;
                    
                    const scoreCell = row.insertCell();
                    // --- ▼▼▼ ここを修正 ('|' を <br> に置換) ▼▼▼
                    const scoreText = (point.inGameScoreAfter || 'N/A').toString();
                    scoreCell.innerHTML = scoreText.replace(/\|/g, '<br class="br-on-sp">');
                    // --- ▲▲▲ 修正ここまで ▲▲▲

                    if (point.isGameEnd === 'get') {
                        scoreCell.classList.add('point-get-game');
                    } else if (point.isGameEnd === 'lost') {
                        scoreCell.classList.add('point-lost-game');
                    }
                    
                    const getLostCell = row.insertCell();
                    const getLostText = point.whichPoint === 'myTeam' ? translate('ph_get') : translate('ph_lost');
                    getLostCell.textContent = getLostText;
                    getLostCell.className = getLostText === translate('ph_get') ? 'point-get' : 'point-lost';

                    const serviceCell = row.insertCell();
                    if (point.whichPoint === 'myTeam' && point.shot === 'serve' && point.service === 'second') {
                        serviceCell.textContent = translate('ph_df_opponent');
                    } else if (point.whichPoint === 'opponent' && point.shot === 'serve' && point.service === 'second') {
                        serviceCell.textContent = translate('ph_df_you');
                    } else {
                        serviceCell.textContent = point.service === 'first' ? translate('ph_1st') : translate('ph_2nd');
                    }

                    row.insertCell().textContent = '-';

                    const whoseCell = row.insertCell();
                    const whoseInfo = getWhoseInfo(point);
                    whoseCell.className = whoseInfo.className;

                    // 'whose' のテキストも '|' を含んでいる可能性があるので、同様に置換処理を適用
                    if (whoseInfo.text.includes('|')) {
                        whoseCell.innerHTML = whoseInfo.text.replace(/\|/g, '<br class="br-on-sp">');
                    } else {
                        whoseCell.textContent = whoseInfo.text;
                    }
                });
            }
            table.appendChild(tbody);

            const tfoot = document.createElement('tfoot');
            const footerRow = tfoot.insertRow();
            const footerCell = footerRow.insertCell();
            footerCell.colSpan = 6;
            footerCell.className = 'game-count-footer';
            footerCell.textContent = `${myGameCountInSet} - ${oppGameCountInSet}`;
            table.appendChild(tfoot);

            historyContainer.appendChild(table);
        });
    });
}