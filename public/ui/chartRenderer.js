import { ALL_DATA, CURRENT_STATS } from '../main.js';
import { getCssVariable, translate } from './utils.js';

function createBarChartRow(label, data, color) {
    const row = document.createElement('div');
    row.className = 'chart-row';
    const countText = data.count !== undefined ? `(${data.count}/${data.total})` : `(${data.total})`;
    row.innerHTML = `<div class="label">${label}</div><div class="chart-wrapper"><div class="bar-background"><div class="bar-foreground" style="width: ${data.rate}%; background-color: ${color};"></div></div><div class="value-text">${data.rate.toFixed(1)}% ${countText}</div></div>`;
    return row;
}

function drawPieChart(elementId, title, data, colors, customOptions = {}) {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) return;

    const header = data[0];
    const body = data.slice(1);
    const realTotal = body.reduce((sum, row) => sum + row[1], 0);

    if (realTotal === 0) {
        chartElement.innerHTML = `<div class="chart-title" style="text-align:center;font-weight:bold;color:#666;padding-top:20px;">${title}</div><div class="no-data-text" style="text-align:center;padding-top:50px;color:#999;">データがありません</div>`;
        return;
    }

    const labeledBody = body.map(row => {
        const [label, value, stats] = row;
        let legendLabel;
        if (customOptions.useFractionalLegend && stats) {
            legendLabel = `${label.replace(/\n/g, ' ')} (${stats.count}/${stats.total})`;
        } else {
            const valueString = Number.isInteger(value) ? value : value.toFixed(1);
            legendLabel = `${label.replace(/\n/g, ' ')} (${valueString})`;
        }
        return [legendLabel, value];
    });
    
    const chartData = [header, ...labeledBody];
    chartData.push(['', realTotal]);
    const dataTable = google.visualization.arrayToDataTable(chartData);
    const dummySliceIndex = chartData.length - 2;
    const options = {
        title,
        pieHole: 0.4,
        colors,
        legend: { position: 'bottom', alignment: 'center' },
        pieStartAngle: -90,
        width: '100%',
        height: '100%',
        chartArea: { left: '5%', top: '15%', width: '90%', height: '70%' },
        slices: { [dummySliceIndex]: { color: 'transparent' } },
        tooltip: { trigger: 'none' }
    };
    new google.visualization.PieChart(chartElement).draw(dataTable, options);
}

export function drawBasicCharts() {
    const stats = CURRENT_STATS;
    if (!stats || Object.keys(stats).length === 0) {
        document.getElementById('basic-data').innerHTML = '<h2>試合データ</h2><p>表示するデータがありません</p>';
        return;
    }
    const isDoubles = ALL_DATA.matchData[0]?.matchFormat === 'doubles';
    const colors = { me: getCssVariable('--my-color'), partner: getCssVariable('--partner-color'), opponent: getCssVariable('--opponent-color'), info: getCssVariable('--info-color'), success: getCssVariable('--success-color'), danger: getCssVariable('--danger-color') };
    const clearAndAppend = (groupId, elements) => { const group = document.getElementById(groupId); if(group) { group.innerHTML = ''; group.append(...elements.filter(Boolean)); } };
    clearAndAppend('first-serve-group', [stats.firstSvIn && createBarChartRow('自分', stats.firstSvIn, colors.me), isDoubles && stats.firstSvInPartner && createBarChartRow('パートナー', stats.firstSvInPartner, colors.partner), stats.firstSvInOpponent && createBarChartRow('相手', stats.firstSvInOpponent, colors.opponent)]);
    clearAndAppend('second-serve-group', [stats.secondSvIn && createBarChartRow('自分', stats.secondSvIn, colors.me), isDoubles && stats.secondSvInPartner && createBarChartRow('パートナー', stats.secondSvInPartner, colors.partner), stats.secondSvInOpponent && createBarChartRow('相手', stats.secondSvInOpponent, colors.opponent)]);
    clearAndAppend('double-fault-group', [stats.doubleFault && createBarChartRow('自分', stats.doubleFault, colors.me), isDoubles && stats.doubleFaultPartner && createBarChartRow('パートナー', stats.doubleFaultPartner, colors.partner), stats.doubleFaultOpponent && createBarChartRow('相手', stats.doubleFaultOpponent, colors.opponent)]);
    clearAndAppend('at-first-sv-group', [stats.atFirstSv && createBarChartRow('自分', stats.atFirstSv, colors.me), isDoubles && stats.atFirstSvPartner && createBarChartRow('パートナー', stats.atFirstSvPartner, colors.partner)]);
    clearAndAppend('at-second-sv-group', [stats.atSecondSv && createBarChartRow('自分', stats.atSecondSv, colors.me), isDoubles && stats.atSecondSvPartner && createBarChartRow('パートナー', stats.atSecondSvPartner, colors.partner)]);
    clearAndAppend('at-first-return-group', [stats.atFirstReturn && createBarChartRow('自分', stats.atFirstReturn, colors.me), isDoubles && stats.atFirstReturnPartner && createBarChartRow('パートナー', stats.atFirstReturnPartner, colors.partner)]);
    clearAndAppend('at-second-return-group', [stats.atSecondReturn && createBarChartRow('自分', stats.atSecondReturn, colors.me), isDoubles && stats.atSecondReturnPartner && createBarChartRow('パートナー', stats.atSecondReturnPartner, colors.partner)]);
    clearAndAppend('game-rate-group', [stats.keepRate && createBarChartRow(translate('Keep rate'), stats.keepRate, colors.success), stats.breakRate && createBarChartRow(translate('Break rate'), stats.breakRate, colors.danger)]);
    
    if (stats.getAndLostPoint) { const { get, lost, total } = stats.getAndLostPoint; drawPieChart('get_lost_point_chart', translate('GetPoint and LostPoint') + ` (${total})`, [['Result', 'Points'], [translate('Get\nPoint'), get], [translate('Lost\nPoint'), lost]], [colors.me, colors.opponent]); }
    
    // ▼▼▼ 修正箇所: サービス/リターン別ポイント取得率 ▼▼▼
    if (stats.pointRateBySvOrRtn) {
        const { service, return: ret } = stats.pointRateBySvOrRtn;
        drawPieChart('point_rate_sv_rtn_chart', translate('PointRate By ServiceGame or RetrunGame'),
            [
                ['Type', 'Rate'],
                [translate('Service\nGame'), service.rate, { count: service.count, total: service.total }],
                [translate('Return\nGame'), ret.rate, { count: ret.count, total: ret.total }]
            ],
            [colors.me, colors.partner],
            { useFractionalLegend: true }
        );
    }
    // ▲▲▲ 修正ここまで ▲▲▲

    if (stats.pointRateByServiceSide) {
        const { adv, duce } = stats.pointRateByServiceSide;
        drawPieChart('point_rate_service_side_chart', translate('Point acquisition rate\nby service side'), [['Side', 'Rate'], [translate('Advantage\nSide'), adv.rate, { count: adv.count, total: adv.total }], [translate('Duce\nSide'), duce.rate, { count: duce.count, total: duce.total }]], [colors.me, colors.info], { useFractionalLegend: true });
    }
    if (stats.pointRateByReturnSide) {
        const { adv, duce } = stats.pointRateByReturnSide;
        drawPieChart('point_rate_return_side_chart', translate('Point acquisition rate\nby return side'), [['Side', 'Rate'], [translate('Advantage\nSide'), adv.rate, { count: adv.count, total: adv.total }], [translate('Duce\nSide'), duce.rate, { count: duce.count, total: duce.total }]], [colors.me, colors.info], { useFractionalLegend: true });
    }
    if (stats.getAndLostGame) { const { get, lost, total } = stats.getAndLostGame; drawPieChart('get_lost_game_chart', translate('GetGame\n and LostGame') + ` (${total}G)`, [['Result', 'Games'], [translate('Get\nGame'), get], [translate("Couldn't\nGet"), lost]], [colors.success, colors.danger]); }
    
    // ▼▼▼ 修正箇所: ブレーク率とサービスダウン率 ▼▼▼
    if (stats.breakAndServiceDown) {
        const { break: brk, serviceDown: sDown } = stats.breakAndServiceDown;
        drawPieChart('break_service_down_chart', translate('Break and\n Service Down'),
            [
                ['Type', 'Rate'],
                [translate('Break\nRate'), brk.rate, { count: brk.count, total: brk.total }],
                [translate('Service\nDown'), sDown.rate, { count: sDown.count, total: sDown.total }]
            ],
            [colors.success, colors.danger],
            { useFractionalLegend: true }
        );
    }
    // ▲▲▲ 修正ここまで ▲▲▲
}

export function drawAdvanceCharts() {
    const stats = CURRENT_STATS;
    if (!stats || Object.keys(stats).length === 0) { document.getElementById('advance-data').innerHTML = `<h2>${translate('AdvanceData')}</h2><p>表示するデータがありません</p>`; return; }
    const isDoubles = ALL_DATA.matchData[0]?.matchFormat === 'doubles';
    const colors = { me: getCssVariable('--my-winner'), partner: getCssVariable('--par-winner'), opponent: getCssVariable('--opponent-color'), myMiss: getCssVariable('--my-miss'), parMiss: getCssVariable('--par-miss'), oppMiss: getCssVariable('--opp-miss')};
    const clearAndAppend = (groupId, elements) => { const group = document.getElementById(groupId); if (group) { group.innerHTML = ''; group.append(...elements.filter(Boolean)); } };
    clearAndAppend('winning-rate-group', [
        stats.myWinningRate && createBarChartRow(translate('MySelf'), stats.myWinningRate, colors.me),
        isDoubles && stats.partnersWinningRate && createBarChartRow(translate('Partner'), stats.partnersWinningRate, colors.partner),
        stats.opponentsWinningRate && createBarChartRow(translate('Opponent'), stats.opponentsWinningRate, colors.opponent)
    ]);
    if (isDoubles) {
        if (stats.breakDownOfGetPointDbls) { const { myWinner, partnerWinner, opponentMiss } = stats.breakDownOfGetPointDbls; drawPieChart('get_point_breakdown_chart', translate('breakdown of getPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Partners\nWinner'), partnerWinner], [translate('Opponent\nMiss'), opponentMiss]], [colors.me, colors.partner, colors.oppMiss]); }
        if (stats.breakDownOfLostPointDbls) { const { myMiss, partnerMiss, opponentWinner } = stats.breakDownOfLostPointDbls; drawPieChart('lost_point_breakdown_chart', translate('breakdown of lostPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Partners\nMiss'), partnerMiss], [translate('Opponent\nWinner'), opponentWinner]], [colors.myMiss, colors.parMiss, colors.opponent]); }
        if (stats.breakDownOfWinnerPointDbls) { const { myWinner, partnerWinner, opponentWinner } = stats.breakDownOfWinnerPointDbls; drawPieChart('winner_point_breakdown_chart', translate('breakdown of winnerPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Partners\nWinner'), partnerWinner], [translate('Opponent\nWinner'), opponentWinner]], [colors.me, colors.partner, colors.opponent]); }
        if (stats.breakDownOfMissPointDbls) { const { myMiss, partnerMiss, opponentMiss } = stats.breakDownOfMissPointDbls; drawPieChart('miss_point_breakdown_chart', translate('breakdown of missPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Partners\nMiss'), partnerMiss], [translate('Opponent\nMiss'), opponentMiss]], [colors.myMiss, colors.parMiss, colors.oppMiss]); }
    } else {
        if (stats.breakDownOfGetPoint) { const { myWinner, opponentMiss } = stats.breakDownOfGetPoint; drawPieChart('get_point_breakdown_chart', translate('breakdown of getPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Opponent\nMiss'), opponentMiss]], [colors.me, colors.oppMiss]); }
        if (stats.breakDownOfLostPoint) { const { myMiss, opponentWinner } = stats.breakDownOfLostPoint; drawPieChart('lost_point_breakdown_chart', translate('breakdown of lostPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Opponent\nWinner'), opponentWinner]], [colors.myMiss, colors.opponent]); }
        if (stats.breakDownOfWinnerPoint) { const { myWinner, opponentWinner } = stats.breakDownOfWinnerPoint; drawPieChart('winner_point_breakdown_chart', translate('breakdown of winnerPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Opponent\nWinner'), opponentWinner]], [colors.me, colors.opponent]); }
        if (stats.breakDownOfMissPoint) { const { myMiss, opponentMiss } = stats.breakDownOfMissPoint; drawPieChart('miss_point_breakdown_chart', translate('breakdown of missPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Opponent\nMiss'), opponentMiss]], [colors.myMiss, colors.oppMiss]); }
    }
}