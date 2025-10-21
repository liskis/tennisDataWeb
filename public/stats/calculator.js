import { ALL_DATA, SELECTED_SET } from '../main.js';
import { normalizeTimestamp } from '../main.js';

export function calculateAllStats() {
    const allPoints = ALL_DATA.pointData;
    const allGames = ALL_DATA.gameData;
    if (!allPoints || !allGames) return {};

    const sortedSets = (ALL_DATA.setData || []).sort((a, b) => {
        const dateA = normalizeTimestamp(a.setStartDate);
        const dateB = normalizeTimestamp(b.setStartDate);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
    });
    
    let pointsToAnalyze, gamesToAnalyze;
    if (SELECTED_SET === 0) {
        pointsToAnalyze = allPoints;
        gamesToAnalyze = allGames
    } else {
        const selectedSetData = sortedSets[SELECTED_SET - 1];
        if (selectedSetData) {
            pointsToAnalyze = allPoints.filter(p => p.setId === selectedSetData.setId);
            gamesToAnalyze = allGames.filter(g => g.setId === selectedSetData.setId);
        } else {
            pointsToAnalyze = []; gamesToAnalyze = [];
        }
    }

    if (pointsToAnalyze.length === 0 && gamesToAnalyze.length === 0) {
        console.warn(`分析対象のデータがないため、統計を計算できません。(Set: ${SELECTED_SET})`);
        return {};
    }
    
    const rate = (numerator, denominator) => denominator > 0 ? (numerator / denominator) * 100 : 0;
    
    let pointStats = {};
    if (pointsToAnalyze.length > 0) {
        const filterPoints = (condition) => pointsToAnalyze.filter(condition);
        
        const myServerPoints = filterPoints(p => p.myPosition === 'server');
        const myFirstServeAttempts = myServerPoints.filter(p => p.service === 'first');
        const mySecondServeAttempts = myServerPoints.filter(p => p.service === 'second');
        const myDFs = mySecondServeAttempts.filter(p => p.whichPoint === 'opponent' && p.shot === 'serve');
        const myWonOn1stServe = myFirstServeAttempts.filter(p => p.whichPoint === 'myTeam');
        const myWonOn2ndServe = mySecondServeAttempts.filter(p => p.whichPoint === 'myTeam');
        
        const partnerServePoints = filterPoints(p => p.servOrRet === 'serviceGame' && p.myPosition === 'volleyer');
        const partnerFirstServeAttempts = partnerServePoints.filter(p => p.service === 'first');
        const partnerSecondServeAttempts = partnerServePoints.filter(p => p.service === 'second');
        const partnerDFs = partnerSecondServeAttempts.filter(p => p.whichPoint === 'opponent' && p.shot === 'serve');
        const partnerWonOn1stServe = partnerFirstServeAttempts.filter(p => p.whichPoint === 'myTeam');
        const partnerWonOn2ndServe = partnerSecondServeAttempts.filter(p => p.whichPoint === 'myTeam');
        
        const opponentServePoints = filterPoints(p => p.servOrRet === 'returnGame');
        const opponentFirstServeAttempts = opponentServePoints.filter(p => p.service === 'first');
        const opponentSecondServeAttempts = opponentServePoints.filter(p => p.service === 'second');
        const opponentDFs = opponentSecondServeAttempts.filter(p => p.whichPoint === 'myTeam' && p.shot === 'serve');
        
        const myReturnerPoints = filterPoints(p => p.myPosition === 'returner');
        const my1stReturnPoints = myReturnerPoints.filter(p => p.service === 'first');
        const my2ndReturnPoints = myReturnerPoints.filter(p => p.service === 'second');
        const myWonOn1stReturn = my1stReturnPoints.filter(p => p.whichPoint === 'myTeam');
        const myWonOn2ndReturn = my2ndReturnPoints.filter(p => p.whichPoint === 'myTeam');
        
        const partnerReturnerPoints = filterPoints(p => p.servOrRet === 'returnGame' && p.myPosition === 'volleyer');
        const partner1stReturnPoints = partnerReturnerPoints.filter(p => p.service === 'first');
        const partner2ndReturnPoints = partnerReturnerPoints.filter(p => p.service === 'second');
        const partnerWonOn1stReturn = partner1stReturnPoints.filter(p => p.whichPoint === 'myTeam');
        const partnerWonOn2ndReturn = partner2ndReturnPoints.filter(p => p.whichPoint === 'myTeam');
        
        const getPoints = filterPoints(p => p.whichPoint === 'myTeam');
        const lostPoints = filterPoints(p => p.whichPoint === 'opponent');
        
        const myWinnerPoints = filterPoints(p => p.whose === 'me' && p.whichPoint === 'myTeam');
        const myMissPoints = filterPoints(p => p.whose === 'me' && p.whichPoint === 'opponent');
        const partnerWinnerPoints = filterPoints(p => p.whose === 'partner' && p.whichPoint === 'myTeam');
        const partnerMissPoints = filterPoints(p => p.whose === 'partner' && p.whichPoint === 'opponent');
        const opponentWinnerPoints = filterPoints(p => ['playerA', 'playerB', 'opponent'].includes(p.whose) && p.whichPoint === 'opponent');
        const opponentMissPoints = filterPoints(p => ['playerA', 'playerB', 'opponent'].includes(p.whose) && p.whichPoint === 'myTeam');
        
        const serviceDuce = filterPoints(p=>p.servOrRet==='serviceGame'&&p.side==='duceSide');
        const serviceAdv = filterPoints(p=>p.servOrRet==='serviceGame'&&p.side==='advantageSide');
        const returnDuce = filterPoints(p=>p.servOrRet==='returnGame'&&((p.side==='duceSide'&&p.myPosition==='returner')||(p.side==='advantageSide'&&p.myPosition==='volleyer')));
        const returnAdv = filterPoints(p=>p.servOrRet==='returnGame'&&((p.side==='advantageSide'&&p.myPosition==='returner')||(p.side==='duceSide'&&p.myPosition==='volleyer')));
        
        const finishedGameIdsForPoints = new Set(gamesToAnalyze.map(g => g.gameId));
        let noAdPointsAtServ = [];
        let noAdPointsAtRetn = [];
        for (const gameId of finishedGameIdsForPoints) {
            const pointsInGame = pointsToAnalyze.filter(p => p.gameId === gameId);
            if (pointsInGame.length === 0) continue;
            
            const sortedPoints = pointsInGame.sort((a, b) => {
                const dateA = normalizeTimestamp(a.dateTime);
                const dateB = normalizeTimestamp(b.dateTime);
                if (!dateA || !dateB) return 0;
                return dateA.getTime() - dateB.getTime();
            });
            const lastPoint = sortedPoints.pop();

            if (lastPoint && lastPoint.getPoint === lastPoint.lostPoint && lastPoint.getPoint >= 3) {
                if (lastPoint.servOrRet === 'serviceGame') noAdPointsAtServ.push(lastPoint);
                else if (lastPoint.servOrRet === 'returnGame') noAdPointsAtRetn.push(lastPoint);
            }
        }
        const wonNoAdPointsAtServ = noAdPointsAtServ.filter(p => p.whichPoint === 'myTeam');
        const wonNoAdPointsAtRetn = noAdPointsAtRetn.filter(p => p.whichPoint === 'myTeam');

        // 事前計算用の変数
        const servicePointsTotal = filterPoints(p => p.servOrRet === 'serviceGame').length;
        const servicePointsWon = getPoints.filter(p => p.servOrRet === 'serviceGame').length;
        const returnPointsTotal = filterPoints(p => p.servOrRet === 'returnGame').length;
        const returnPointsWon = getPoints.filter(p => p.servOrRet === 'returnGame').length;

        pointStats = {
            firstSvIn: { rate: rate(myFirstServeAttempts.length, myServerPoints.length), total: myServerPoints.length, count: myFirstServeAttempts.length },
            firstSvInPartner: { rate: rate(partnerFirstServeAttempts.length, partnerServePoints.length), total: partnerServePoints.length, count: partnerFirstServeAttempts.length },
            firstSvInOpponent: { rate: rate(opponentFirstServeAttempts.length, opponentServePoints.length), total: opponentServePoints.length, count: opponentFirstServeAttempts.length },
            secondSvIn: { rate: rate(mySecondServeAttempts.length - myDFs.length, mySecondServeAttempts.length), total: mySecondServeAttempts.length, count: mySecondServeAttempts.length - myDFs.length },
            secondSvInPartner: { rate: rate(partnerSecondServeAttempts.length - partnerDFs.length, partnerSecondServeAttempts.length), total: partnerSecondServeAttempts.length, count: partnerSecondServeAttempts.length - partnerDFs.length },
            secondSvInOpponent: { rate: rate(opponentSecondServeAttempts.length - opponentDFs.length, opponentSecondServeAttempts.length), total: opponentSecondServeAttempts.length, count: opponentSecondServeAttempts.length - opponentDFs.length },
            doubleFault: { rate: rate(myDFs.length, myServerPoints.length), total: myServerPoints.length, count: myDFs.length },
            doubleFaultPartner: { rate: rate(partnerDFs.length, partnerServePoints.length), total: partnerServePoints.length, count: partnerDFs.length },
            doubleFaultOpponent: { rate: rate(opponentDFs.length, opponentServePoints.length), total: opponentServePoints.length, count: opponentDFs.length },
            atFirstSv: { rate: rate(myWonOn1stServe.length, myFirstServeAttempts.length), total: myFirstServeAttempts.length, count: myWonOn1stServe.length },
            atFirstSvPartner: { rate: rate(partnerWonOn1stServe.length, partnerFirstServeAttempts.length), total: partnerFirstServeAttempts.length, count: partnerWonOn1stServe.length },
            atSecondSv: { rate: rate(myWonOn2ndServe.length, mySecondServeAttempts.length), total: mySecondServeAttempts.length, count: myWonOn2ndServe.length },
            atSecondSvPartner: { rate: rate(partnerWonOn2ndServe.length, partnerSecondServeAttempts.length), total: partnerSecondServeAttempts.length, count: partnerWonOn2ndServe.length },
            atFirstReturn: { rate: rate(myWonOn1stReturn.length, my1stReturnPoints.length), total: my1stReturnPoints.length, count: myWonOn1stReturn.length },
            atFirstReturnPartner: { rate: rate(partnerWonOn1stReturn.length, partner1stReturnPoints.length), total: partner1stReturnPoints.length, count: partnerWonOn1stReturn.length },
            atSecondReturn: { rate: rate(myWonOn2ndReturn.length, my2ndReturnPoints.length), total: my2ndReturnPoints.length, count: myWonOn2ndReturn.length },
            atSecondReturnPartner: { rate: rate(partnerWonOn2ndReturn.length, partner2ndReturnPoints.length), total: partner2ndReturnPoints.length, count: partnerWonOn2ndReturn.length },
            onePointMatchRateAtServ: { rate: rate(wonNoAdPointsAtServ.length, noAdPointsAtServ.length), total: noAdPointsAtServ.length, count: wonNoAdPointsAtServ.length },
            onePointMatchRateAtRetn: { rate: rate(wonNoAdPointsAtRetn.length, noAdPointsAtRetn.length), total: noAdPointsAtRetn.length, count: wonNoAdPointsAtRetn.length },
            myWinningRate: { rate: rate(myWinnerPoints.length, myWinnerPoints.length + myMissPoints.length), total: myWinnerPoints.length + myMissPoints.length, count: myWinnerPoints.length },
            partnersWinningRate: { rate: rate(partnerWinnerPoints.length, partnerWinnerPoints.length + partnerMissPoints.length), total: partnerWinnerPoints.length + partnerMissPoints.length, count: partnerWinnerPoints.length },
            opponentsWinningRate: { rate: rate(opponentWinnerPoints.length, opponentWinnerPoints.length + opponentMissPoints.length), total: opponentWinnerPoints.length + opponentMissPoints.length, count: opponentWinnerPoints.length },
            getAndLostPoint: { get: getPoints.length, lost: lostPoints.length, total: pointsToAnalyze.length },
            
            // ▼▼▼ 修正箇所: サービス/リターン別ポイント取得率 ▼▼▼
            pointRateBySvOrRtn: {
                service: { rate: rate(servicePointsWon, servicePointsTotal), count: servicePointsWon, total: servicePointsTotal },
                return: { rate: rate(returnPointsWon, returnPointsTotal), count: returnPointsWon, total: returnPointsTotal }
            },
            // ▲▲▲ 修正ここまで ▲▲▲

            pointRateByServiceSide: {
                adv: { rate: rate(serviceAdv.filter(p => p.whichPoint === 'myTeam').length, serviceAdv.length), count: serviceAdv.filter(p => p.whichPoint === 'myTeam').length, total: serviceAdv.length },
                duce: { rate: rate(serviceDuce.filter(p => p.whichPoint === 'myTeam').length, serviceDuce.length), count: serviceDuce.filter(p => p.whichPoint === 'myTeam').length, total: serviceDuce.length }
            },
            pointRateByReturnSide: {
                adv: { rate: rate(returnAdv.filter(p => p.whichPoint === 'myTeam').length, returnAdv.length), count: returnAdv.filter(p => p.whichPoint === 'myTeam').length, total: returnAdv.length },
                duce: { rate: rate(returnDuce.filter(p => p.whichPoint === 'myTeam').length, returnDuce.length), count: returnDuce.filter(p => p.whichPoint === 'myTeam').length, total: returnDuce.length }
            },
            breakDownOfGetPoint: { myWinner: myWinnerPoints.length, opponentMiss: opponentMissPoints.length },
            breakDownOfLostPoint: { myMiss: myMissPoints.length, opponentWinner: opponentWinnerPoints.length },
            breakDownOfWinnerPoint: { myWinner: myWinnerPoints.length, opponentWinner: opponentWinnerPoints.length },
            breakDownOfMissPoint: { myMiss: myMissPoints.length, opponentMiss: opponentMissPoints.length },
            breakDownOfGetPointDbls: { myWinner: myWinnerPoints.length, partnerWinner: partnerWinnerPoints.length, opponentMiss: opponentMissPoints.length },
            breakDownOfLostPointDbls: { myMiss: myMissPoints.length, partnerMiss: partnerMissPoints.length, opponentWinner: opponentWinnerPoints.length },
            breakDownOfWinnerPointDbls: { myWinner: myWinnerPoints.length, partnerWinner: partnerWinnerPoints.length, opponentWinner: opponentWinnerPoints.length },
            breakDownOfMissPointDbls: { myMiss: myMissPoints.length, partnerMiss: partnerMissPoints.length, opponentMiss: opponentMissPoints.length },
        };
    }

    let gameStats = {};
    if (gamesToAnalyze.length > 0) {
        const filterGames = (c) => gamesToAnalyze.filter(c);
        const serviceGames = filterGames(g => g.servOrRet === 'serviceGame');
        const keepGames = serviceGames.filter(g => g.getPoint > g.lostPoint);
        const serviceDownGames = serviceGames.filter(g => g.getPoint < g.lostPoint);
        const returnGames = filterGames(g => g.servOrRet === 'returnGame');
        const breakGames = returnGames.filter(g => g.getPoint > g.lostPoint);
        const getGames = filterGames(g => g.getPoint > g.lostPoint);
        
        gameStats = {
            keepRate: { rate: rate(keepGames.length, serviceGames.length), total: serviceGames.length, count: keepGames.length },
            breakRate: { rate: rate(breakGames.length, returnGames.length), total: returnGames.length, count: breakGames.length },
            getAndLostGame: { get: getGames.length, lost: gamesToAnalyze.length - getGames.length, total: gamesToAnalyze.length },
            
            // ▼▼▼ 修正箇所: ブレーク率とサービスダウン率 ▼▼▼
            breakAndServiceDown: {
                break: { rate: rate(breakGames.length, returnGames.length), count: breakGames.length, total: returnGames.length },
                serviceDown: { rate: rate(serviceDownGames.length, serviceGames.length), count: serviceDownGames.length, total: serviceGames.length }
            },
            // ▲▲▲ 修正ここまで ▲▲▲
        };
    }

    const stats = { ...pointStats, ...gameStats };
    console.log(`統計を計算しました (Set: ${SELECTED_SET})`, stats);
    return stats;
}