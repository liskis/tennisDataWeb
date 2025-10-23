import { ALL_DATA, CURRENT_STATS } from '../main.js';
import { getCssVariable, translate } from './utils.js';

function createBarChartRow(label, data, color) {
    const row = document.createElement('div');
    row.className = 'chart-row';
    const countText = data.count !== undefined ? `(${data.count}/${data.total})` : `(${data.total})`;
    row.innerHTML = `<div class="label">${label}</div><div class="chart-wrapper"><div class="bar-background"><div class="bar-foreground" style="width: ${data.rate}%; background-color: ${color};"></div></div><div class="value-text">${data.rate.toFixed(1)}% ${countText}</div></div>`;
    return row;
}

// 3. 解説文を取得するヘルパー関数
function getChartExplanation(chartId) {
    const explanations = {
        get_lost_point_chart: "テニスは相手よりも１ポイントでも多く取ったほうが勝ちますが、ゲームとセットに分かれているためにその限りではありません。ゲーム数では圧倒していても、ポイント差は少ない場合は、大事なところでポイントが取れているという事でしょう。",
        point_rate_sv_rtn_chart: "テニスはサービスゲームの方が有利とされています。サービスゲームの取得率がリターンゲームの取得率よりも低い場合は、サービスゲームの取得率を上がるようにしていきたいです。サーブだけではなく、サーブの後のポジションや、サーブの次のショットも改善していきましょう！",
        point_rate_service_side_chart: "ダブルスでは、サイドが変わるとリターンする相手が変わります。ポイント取得率の低いサイドの相手を攻略できるように、作戦を変えていきましょう。シングルスでは、フォアサイドとバックサイドでポイント取得率に差がある場合は、サーブの質に差がないかどうか、サーブの後の立ち位置などを確認してみましょう！",
        point_rate_return_side_chart: "試合開始時にリターンサイドを選ぶ時は実際にポイントが取れているかどうかが大切です。リターンの時に取れていなくても、ボレーヤーの時に取れているかもしれません。「リターナーとボレーヤーのポイント取得率」も合わせて参考にしてみてください。",
        get_lost_game_chart: "テニスは取ったゲームが取られたゲームよりも多い方が勝ちます。レッスン中の「サーブから３点先取」でもゲームが取れているか？を意識できると良いですね。",
        break_service_down_chart: "サービスゲームを落としても、それ以上にブレークできれば良いのです。サービスダウン率よりも、ブレーク率が上回るように練習していきましょう！",
        get_point_breakdown_chart: "「自分が決めた＋味方が決めた」が「相手がミス」より多い場合は「自分たちが攻撃的なテニスをしている」ということになります。「自分が決めた＋味方が決めた」が「相手がミス」より少ない場合は「自分たちが守備的なテニスをしている」ということになります。",
        lost_point_breakdown_chart: "「自分がミス＋味方がミス」が「相手が決めた」より少ない場合は「相手が攻撃的なテニスをしている」ということになります。「自分がミス＋味方がミス」が「相手が決めた」より多い場合は、「相手が守備的なテニスをしている」ということになります。",
        winner_point_breakdown_chart: "「自分が決めた＋味方が決めた」が「相手が決めた」より少なくても、ミスの数が相手よりも少なければ勝つことができます。「ミスしたポイントの内訳」も合わせて参考にしてください。",
        miss_point_breakdown_chart: "「自分がミス＋味方がミス」が「相手がミス」より多くても、決めた数が多ければ勝つことができます。「決めたポイントの内訳」も合わせて参考にしてください。"
    };
    return explanations[chartId] || "";
}

function drawPieChart(elementId, title, data, colors, options = {}) {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) return;

    const parentBox = chartElement.parentElement;
    const existingLegend = parentBox.querySelector('.custom-legend-wrapper');
    if (existingLegend) {
        parentBox.removeChild(existingLegend);
    }

    const header = data[0];
    const body = data.slice(1);
    const realTotal = body.reduce((sum, row) => sum + row[1], 0);

    chartElement.innerHTML = '';

    if (realTotal === 0) {
        chartElement.innerHTML = `<div class="chart-title" style="text-align:center;font-weight:bold;color:#666;padding-top:20px;">${title}</div><div class="no-data-text" style="text-align:center;padding-top:50px;color:#999;">データがありません</div>`;
        return;
    }

    // --- 1. 半円グラフ描画ロジックを復活 ---
    const chartDataForDrawing = [header, ...body.map(row => [row[0], row[1]])];
    chartDataForDrawing.push(['', realTotal]); // 半円用のダミーデータ

    const dataTable = google.visualization.arrayToDataTable(chartDataForDrawing);
    const dummySliceIndex = chartDataForDrawing.length - 2;
    
    const chartOptions = {
        title,
        pieHole: 0.4, // 太さを戻す
        colors,
        legend: 'none',
        pieStartAngle: -90, // 半円にする
        width: '100%',
        height: '100%',
        chartArea: { left: '5%', top: '10%', width: '90%', height: '80%' }, // 上に少し寄せる
        tooltip: { trigger: 'none' },
        pieSliceText: 'percentage',
        pieSliceTextStyle: { color: 'white', fontSize: 12 },
        slices: { [dummySliceIndex]: { color: 'transparent' } } // ダミーを透明に
    };
    new google.visualization.PieChart(chartElement).draw(dataTable, chartOptions);


    const legendWrapper = document.createElement('div');
    legendWrapper.className = 'custom-legend-wrapper';

    const legendList = document.createElement('ul');
    legendList.className = 'legend-list';
    
    body.forEach((row, index) => {
        const [label, value, stats] = row;
        const color = colors[index % colors.length];
        const listItem = document.createElement('li');
        listItem.className = 'legend-item';

        const valueText = (options.useFractionalLegend && stats)
            ? `${stats.count}/${stats.total}`
            : `${Number.isInteger(value) ? value : value.toFixed(1)}`;
        
        listItem.innerHTML = `
            <span class="legend-marker" style="background-color: ${color};"></span>
            <span class="legend-label">${label.replace(/\n/g, ' ')}</span>
            <span class="legend-value">${valueText}</span>
        `;
        legendList.appendChild(listItem);
    });
    legendWrapper.appendChild(legendList);

    if (options.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'legend-description';
        descriptionElement.textContent = options.description;
        legendWrapper.appendChild(descriptionElement);
    }
    
    parentBox.appendChild(legendWrapper);
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
    
    if (stats.getAndLostPoint) { const { get, lost, total } = stats.getAndLostPoint; drawPieChart('get_lost_point_chart', translate('GetPoint and LostPoint') + ` (${total})`, [['Result', 'Points'], [translate('Get\nPoint'), get], [translate('Lost\nPoint'), lost]], [colors.me, colors.opponent], { description: getChartExplanation('get_lost_point_chart') }); }
    if (stats.pointRateBySvOrRtn) {
        const { service, return: ret } = stats.pointRateBySvOrRtn;
        drawPieChart('point_rate_sv_rtn_chart', translate('PointRate By ServiceGame or RetrunGame'),
            [['Type', 'Rate'], [translate('Service\nGame'), service.rate, service], [translate('Return\nGame'), ret.rate, ret]],
            [colors.me, colors.partner], { useFractionalLegend: true, description: getChartExplanation('point_rate_sv_rtn_chart') }
        );
    }
    if (stats.pointRateByServiceSide) {
        const { adv, duce } = stats.pointRateByServiceSide;
        drawPieChart('point_rate_service_side_chart', translate('Point acquisition rate\nby service side'), [['Side', 'Rate'], [translate('Advantage\nSide'), adv.rate, adv], [translate('Duce\nSide'), duce.rate, duce]], [colors.me, colors.info], { useFractionalLegend: true, description: getChartExplanation('point_rate_service_side_chart') });
    }
    if (stats.pointRateByReturnSide) {
        const { adv, duce } = stats.pointRateByReturnSide;
        drawPieChart('point_rate_return_side_chart', translate('Point acquisition rate\nby return side'), [['Side', 'Rate'], [translate('Advantage\nSide'), adv.rate, adv], [translate('Duce\nSide'), duce.rate, duce]], [colors.me, colors.info], { useFractionalLegend: true, description: getChartExplanation('point_rate_return_side_chart') });
    }
    if (stats.getAndLostGame) { const { get, lost, total } = stats.getAndLostGame; drawPieChart('get_lost_game_chart', translate('GetGame\n and LostGame') + ` (${total}G)`, [['Result', 'Games'], [translate('Get\nGame'), get], [translate("Couldn't\nGet"), lost]], [colors.success, colors.danger], { description: getChartExplanation('get_lost_game_chart') }); }
    if (stats.breakAndServiceDown) {
        const { break: brk, serviceDown: sDown } = stats.breakAndServiceDown;
        drawPieChart('break_service_down_chart', translate('Break and\n Service Down'),
            [['Type', 'Rate'], [translate('Break\nRate'), brk.rate, brk], [translate('Service\nDown'), sDown.rate, sDown]],
            [colors.success, colors.danger], { useFractionalLegend: true, description: getChartExplanation('break_service_down_chart') }
        );
    }
}

export function drawAdvanceCharts() {
    const stats = CURRENT_STATS;
    if (!stats || Object.keys(stats).length === 0) { document.getElementById('advance-data').innerHTML = `<h2>${translate('AdvanceData')}</h2><p>表示するデータがありません</p>`; return; }
    const isDoubles = ALL_DATA.matchData[0]?.matchFormat === 'doubles';
    const colors = { me: getCssVariable('--my-winner'), partner: getCssVariable('--par-winner'), opponent: getCssVariable('--opp-winner'), myMiss: getCssVariable('--my-miss'), parMiss: getCssVariable('--par-miss'), oppMiss: getCssVariable('--opp-miss')};
    const clearAndAppend = (groupId, elements) => { const group = document.getElementById(groupId); if (group) { group.innerHTML = ''; group.append(...elements.filter(Boolean)); } };
    clearAndAppend('winning-rate-group', [
        stats.myWinningRate && createBarChartRow(translate('MySelf'), stats.myWinningRate, colors.me),
        isDoubles && stats.partnersWinningRate && createBarChartRow(translate('Partner'), stats.partnersWinningRate, colors.partner),
        stats.opponentsWinningRate && createBarChartRow(translate('Opponent'), stats.opponentsWinningRate, colors.opponent)
    ]);
    
    if (isDoubles) {
        if (stats.breakDownOfGetPointDbls) { const { myWinner, partnerWinner, opponentMiss } = stats.breakDownOfGetPointDbls; drawPieChart('get_point_breakdown_chart', translate('breakdown of getPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Partners\nWinner'), partnerWinner], [translate('Opponent\nMiss'), opponentMiss]], [colors.me, colors.partner, colors.oppMiss], { description: getChartExplanation('get_point_breakdown_chart') }); }
        if (stats.breakDownOfLostPointDbls) { const { myMiss, partnerMiss, opponentWinner } = stats.breakDownOfLostPointDbls; drawPieChart('lost_point_breakdown_chart', translate('breakdown of lostPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Partners\nMiss'), partnerMiss], [translate('Opponent\nWinner'), opponentWinner]], [colors.myMiss, colors.parMiss, colors.opponent], { description: getChartExplanation('lost_point_breakdown_chart') }); }
        if (stats.breakDownOfWinnerPointDbls) { const { myWinner, partnerWinner, opponentWinner } = stats.breakDownOfWinnerPointDbls; drawPieChart('winner_point_breakdown_chart', translate('breakdown of winnerPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Partners\nWinner'), partnerWinner], [translate('Opponent\nWinner'), opponentWinner]], [colors.me, colors.partner, colors.opponent], { description: getChartExplanation('winner_point_breakdown_chart') }); }
        if (stats.breakDownOfMissPointDbls) { const { myMiss, partnerMiss, opponentMiss } = stats.breakDownOfMissPointDbls; drawPieChart('miss_point_breakdown_chart', translate('breakdown of missPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Partners\nMiss'), partnerMiss], [translate('Opponent\nMiss'), opponentMiss]], [colors.myMiss, colors.parMiss, colors.oppMiss], { description: getChartExplanation('miss_point_breakdown_chart') }); }
    } else {
        if (stats.breakDownOfGetPoint) { const { myWinner, opponentMiss } = stats.breakDownOfGetPoint; drawPieChart('get_point_breakdown_chart', translate('breakdown of getPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Opponent\nMiss'), opponentMiss]], [colors.me, colors.oppMiss], { description: getChartExplanation('get_point_breakdown_chart').replace('＋味方が決めた', '') }); }
        if (stats.breakDownOfLostPoint) { const { myMiss, opponentWinner } = stats.breakDownOfLostPoint; drawPieChart('lost_point_breakdown_chart', translate('breakdown of lostPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Opponent\nWinner'), opponentWinner]], [colors.myMiss, colors.opponent], { description: getChartExplanation('lost_point_breakdown_chart').replace('＋味方がミス', '') }); }
        if (stats.breakDownOfWinnerPoint) { const { myWinner, opponentWinner } = stats.breakDownOfWinnerPoint; drawPieChart('winner_point_breakdown_chart', translate('breakdown of winnerPoint'), [['Type', 'Points'], [translate('My\nWinner'), myWinner], [translate('Opponent\nWinner'), opponentWinner]], [colors.me, colors.opponent], { description: getChartExplanation('winner_point_breakdown_chart').replace('＋味方が決めた', '') }); }
        if (stats.breakDownOfMissPoint) { const { myMiss, opponentMiss } = stats.breakDownOfMissPoint; drawPieChart('miss_point_breakdown_chart', translate('breakdown of missPoint'), [['Type', 'Points'], [translate('My\nMiss'), myMiss], [translate('Opponent\nMiss'), opponentMiss]], [colors.myMiss, colors.oppMiss], { description: getChartExplanation('miss_point_breakdown_chart').replace('＋味方がミス', '') }); }
    }
}