import { ALL_DATA, SELECTED_SET, normalizeTimestamp } from '../main.js';
import { translate } from './utils.js';

function calculateInGameScoresAfterPoint(points, isTieBreak) {
    let myScore = 0;
    let oppScore = 0;
    const scoreMap = { 0: '0', 1: '15', 2: '30', 3: '40' };

    const getTennisScore = (s1, s2, servOrRet) => {
        if (isTieBreak) {
            return servOrRet === 'serviceGame' ? `${s1}-${s2}` : `${s2}-${s1}`;
        }
        if (s1 >= 3 && s2 >= 3) {
            if (s1 === s2) return '40-40';
            const advantagePlayer = s1 > s2 ? 'myTeam' : 'opponent';
            if (servOrRet === 'serviceGame') {
                return advantagePlayer === 'myTeam' ? 'Ad-40' : '40-Ad';
            } else {
                return advantagePlayer === 'myTeam' ? '40-Ad' : 'Ad-40';
            }
        }
        const score1 = scoreMap[s1] || '40';
        const score2 = scoreMap[s2] || '40';
        return servOrRet === 'serviceGame' ? `${score1}-${score2}` : `${score2}-${score1}`;
    };

    return points.map(point => {
        if (point.whichPoint === 'myTeam') myScore++;
        else oppScore++;
        point.inGameScoreAfter = getTennisScore(myScore, oppScore, point.servOrRet);
        return point;
    });
}

function getWhoseText(point) {
    const whose = point.whose;
    const winner = point.whichPoint;

    if (winner === 'myTeam') {
        if (whose === 'me') return '自分が決めた';
        if (whose === 'partner') return '味方が決めた';
        if (['playerA', 'playerB', 'opponent'].includes(whose)) return '相手がミス';
    } else { // winner === 'opponent'
        if (whose === 'me') return '自分がミス';
        if (whose === 'partner') return '味方がミス';
        if (['playerA', 'playerB', 'opponent'].includes(whose)) return '相手が決めた';
    }
    return '-';
}

export function renderPointHistory() {
    const container = document.getElementById('point-history');
    if (!container) return;

    container.innerHTML = '<h2>全ポイント履歴</h2><div id="history-container"></div>';
    const historyContainer = document.getElementById('history-container');

    const allSets = ALL_DATA.setData || [];
    const allGames = ALL_DATA.gameData || [];
    const allPoints = ALL_DATA.pointData || [];

    const sortedAllSets = [...allSets].sort((a, b) => normalizeTimestamp(a.setStartDate) - normalizeTimestamp(b.setStartDate));
    const setsToRender = (SELECTED_SET === 0 ? sortedAllSets : [sortedAllSets[SELECTED_SET - 1]]).filter(Boolean);

    if (setsToRender.length === 0) {
        historyContainer.innerHTML = '<p>表示するデータがありません。</p>';
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
    
    setsToRender.forEach((set, setIndex) => {
        const setHeader = document.createElement('div');
        setHeader.className = 'set-header';
        const setNumber = sortedAllSets.findIndex(s => s.setId === set.setId) + 1;
        setHeader.innerHTML = `<h3>第${setNumber}セット (${set.getGameCount} - ${set.lostGameCount})</h3>`;
        historyContainer.appendChild(setHeader);

        const gamesInSet = sortedGames.filter(g => g.setId === set.setId);

        gamesInSet.forEach((game, gameIndex) => {
            const gameType = game.isTieBreak ? 'タイブレーク' : (game.servOrRet === 'serviceGame' ? 'サービスゲーム' : 'リターンゲーム');
            const server = game.server;
            const result = game.getPoint > game.lostPoint
                ? (game.servOrRet === 'serviceGame' ? 'キープ' : 'ブレーク')
                : (game.servOrRet === 'serviceGame' ? 'サービスダウン' : 'キープされました');
            
            const gameHeader = document.createElement('div');
            gameHeader.className = 'game-header';
            
            const serverInfo = server ? ` - <span class="game-server">サーバー: ${server}</span>` : '';
            gameHeader.innerHTML = `<h4>第${gameIndex + 1}ゲーム (${gameType})${serverInfo} - <span class="game-result">${result}</span></h4>`;
            historyContainer.appendChild(gameHeader);

            const table = document.createElement('table');
            table.className = 'point-history-table';
            table.innerHTML = `<thead><tr><th>ポジション</th><th>ポイント</th><th>Get/Lost</th><th>サービス</th><th>ショット</th><th>誰が</th></tr></thead>`;
            const tbody = document.createElement('tbody');

            let pointsInGame = pointsByGame[game.gameId] || [];
            if (pointsInGame.length > 0) {
                pointsInGame.sort((a, b) => normalizeTimestamp(a.dateTime) - normalizeTimestamp(b.dateTime));
                pointsInGame = calculateInGameScoresAfterPoint(pointsInGame, game.isTieBreak || false);
                
                pointsInGame.forEach(point => {
                    const row = tbody.insertRow();
                    row.insertCell().textContent = translate(point.myPosition) || point.myPosition;
                    row.insertCell().textContent = point.inGameScoreAfter || 'N/A';
                    
                    const getLostCell = row.insertCell();
                    const getLostText = point.whichPoint === 'myTeam' ? 'Get' : 'Lost';
                    getLostCell.textContent = getLostText;
                    getLostCell.className = getLostText === 'Get' ? 'point-get' : 'point-lost';

                    const serviceCell = row.insertCell();
                    if (point.whichPoint === 'myTeam' && point.shot === 'serve' && point.service === 'second') {
                        serviceCell.textContent = 'DF (相手)';
                    } else if (point.whichPoint === 'opponent' && point.shot === 'serve' && point.service === 'second') {
                        serviceCell.textContent = 'DF';
                    } else {
                        serviceCell.textContent = point.service === 'first' ? '1st' : '2nd';
                    }

                    row.insertCell().textContent = '-';
                    row.insertCell().textContent = getWhoseText(point);
                });
            }
            table.appendChild(tbody);
            historyContainer.appendChild(table);
        });
    });
}