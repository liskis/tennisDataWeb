// public/ui/chartRenderer.js

import { ALL_DATA, CURRENT_STATS, PLAYER_NAMES } from '../state.js';
import { getCssVariable } from './utils.js';
import { translate } from '../i18n.js';
import { createBarChartRow } from './components/barChart.js';
import { drawPieChart } from './components/pieChart.js';

export function drawBasicCharts() {
    const stats = CURRENT_STATS;
    const container = document.getElementById('basic-data');
    if (!stats || Object.keys(stats).length === 0) {
        container.innerHTML = `<h2>${translate('tab_basic_data')}</h2><p>${translate('no_data_to_display')}</p>`;
        return;
    }
    const isDoubles = ALL_DATA.matchData[0]?.matchFormat === 'doubles';
    const colors = { me: getCssVariable('--my-color'), partner: getCssVariable('--partner-color'), opponent: getCssVariable('--opponent-color'), info: getCssVariable('--info-color'), success: getCssVariable('--success-color'), danger: getCssVariable('--danger-color') };
    const clearAndAppend = (groupId, elements) => { const group = document.getElementById(groupId); if(group) { group.innerHTML = ''; group.append(...elements.filter(Boolean)); } };
    
    clearAndAppend('first-serve-group', [stats.firstSvIn && createBarChartRow(PLAYER_NAMES.mySelf, stats.firstSvIn, colors.me), isDoubles && stats.firstSvInPartner && createBarChartRow(PLAYER_NAMES.partner, stats.firstSvInPartner, colors.partner), stats.firstSvInOpponent && createBarChartRow(PLAYER_NAMES.opponentTeam, stats.firstSvInOpponent, colors.opponent)]);
    clearAndAppend('second-serve-group', [stats.secondSvIn && createBarChartRow(PLAYER_NAMES.mySelf, stats.secondSvIn, colors.me), isDoubles && stats.secondSvInPartner && createBarChartRow(PLAYER_NAMES.partner, stats.secondSvInPartner, colors.partner), stats.secondSvInOpponent && createBarChartRow(PLAYER_NAMES.opponentTeam, stats.secondSvInOpponent, colors.opponent)]);
    clearAndAppend('double-fault-group', [stats.doubleFault && createBarChartRow(PLAYER_NAMES.mySelf, stats.doubleFault, colors.me), isDoubles && stats.doubleFaultPartner && createBarChartRow(PLAYER_NAMES.partner, stats.doubleFaultPartner, colors.partner), stats.doubleFaultOpponent && createBarChartRow(PLAYER_NAMES.opponentTeam, stats.doubleFaultOpponent, colors.opponent)]);
    clearAndAppend('at-first-sv-group', [stats.atFirstSv && createBarChartRow(PLAYER_NAMES.mySelf, stats.atFirstSv, colors.me), isDoubles && stats.atFirstSvPartner && createBarChartRow(PLAYER_NAMES.partner, stats.atFirstSvPartner, colors.partner)]);
    clearAndAppend('at-second-sv-group', [stats.atSecondSv && createBarChartRow(PLAYER_NAMES.mySelf, stats.atSecondSv, colors.me), isDoubles && stats.atSecondSvPartner && createBarChartRow(PLAYER_NAMES.partner, stats.atSecondSvPartner, colors.partner)]);
    clearAndAppend('at-first-return-group', [stats.atFirstReturn && createBarChartRow(PLAYER_NAMES.mySelf, stats.atFirstReturn, colors.me), isDoubles && stats.atFirstReturnPartner && createBarChartRow(PLAYER_NAMES.partner, stats.atFirstReturnPartner, colors.partner)]);
    clearAndAppend('at-second-return-group', [stats.atSecondReturn && createBarChartRow(PLAYER_NAMES.mySelf, stats.atSecondReturn, colors.me), isDoubles && stats.atSecondReturnPartner && createBarChartRow(PLAYER_NAMES.partner, stats.atSecondReturnPartner, colors.partner)]);
    clearAndAppend('game-rate-group', [stats.keepRate && createBarChartRow(translate('label_keep_rate'), stats.keepRate, colors.success), stats.breakRate && createBarChartRow(translate('label_break_rate'), stats.breakRate, colors.danger)]);
    
    if (stats.getAndLostPoint) { const { get, lost, total } = stats.getAndLostPoint; drawPieChart('get_lost_point_chart', `${translate('pie_get_lost_point')} (${total})`, [['Result', 'Points'], [translate('pie_get_point'), get], [translate('pie_lost_point'), lost]], [colors.me, colors.opponent], { description: translate('exp_get_lost_point') }); }
    if (stats.pointRateBySvOrRtn) { const { service, return: ret } = stats.pointRateBySvOrRtn; drawPieChart('point_rate_sv_rtn_chart', translate('pie_point_rate_sv_rtn'), [['Type', 'Rate'], [translate('pie_service_game'), service.rate, service], [translate('pie_return_game'), ret.rate, ret]], [colors.me, colors.partner], { useFractionalLegend: true, description: translate('exp_point_rate_sv_rtn') }); }
    if (stats.pointRateByServiceSide) { const { adv, duce } = stats.pointRateByServiceSide; drawPieChart('point_rate_service_side_chart', translate('pie_point_rate_service_side'), [['Side', 'Rate'], [translate('pie_adv_side'), adv.rate, adv], [translate('pie_duce_side'), duce.rate, duce]], [colors.me, colors.info], { useFractionalLegend: true, description: translate('exp_point_rate_service_side') }); }
    if (stats.pointRateByReturnSide) { const { adv, duce } = stats.pointRateByReturnSide; drawPieChart('point_rate_return_side_chart', translate('pie_point_rate_return_side'), [['Side', 'Rate'], [translate('pie_adv_side'), adv.rate, adv], [translate('pie_duce_side'), duce.rate, duce]], [colors.me, colors.info], { useFractionalLegend: true, description: translate('exp_point_rate_return_side') }); }
    if (stats.getAndLostGame) { const { get, lost, total } = stats.getAndLostGame; drawPieChart('get_lost_game_chart', `${translate('pie_get_lost_game')} (${total}G)`, [['Result', 'Games'], [translate('pie_get_game'), get], [translate('pie_lost_game'), lost]], [colors.success, colors.danger], { description: translate('exp_get_lost_game') }); }
    if (stats.breakAndServiceDown) { const { break: brk, serviceDown: sDown } = stats.breakAndServiceDown; drawPieChart('break_service_down_chart', translate('pie_break_service_down'), [['Type', 'Rate'], [translate('pie_break_rate'), brk.rate, brk], [translate('pie_service_down'), sDown.rate, sDown]], [colors.success, colors.danger], { useFractionalLegend: true, description: translate('exp_break_service_down') }); }
}

export function drawAdvanceCharts() {
    const stats = CURRENT_STATS;
    const container = document.getElementById('advance-data');
    if (!stats || Object.keys(stats).length === 0) { container.innerHTML = `<h2>${translate('tab_advance_data')}</h2><p>${translate('no_data_to_display')}</p>`; return; }
    const isDoubles = ALL_DATA.matchData[0]?.matchFormat === 'doubles';
    
    const colors = { me: getCssVariable('--my-winner'), partner: getCssVariable('--par-winner'), opponent: getCssVariable('--opp-winner'), myMiss: getCssVariable('--my-miss'), parMiss: getCssVariable('--par-miss'), oppMiss: getCssVariable('--opp-miss'), success: getCssVariable('--success-color'), danger: getCssVariable('--danger-color') };
    const clearAndAppend = (groupId, elements) => { const group = document.getElementById(groupId); if (group) { group.innerHTML = ''; group.append(...elements.filter(Boolean)); } };
    
    clearAndAppend('one-point-match-rate-group', [
        stats.onePointMatchRateAtServ && createBarChartRow(translate('label_service_game'), stats.onePointMatchRateAtServ, colors.success),
        stats.onePointMatchRateAtRetn && createBarChartRow(translate('label_return_game'), stats.onePointMatchRateAtRetn, colors.danger)
    ]);

    clearAndAppend('winning-rate-group', [
        stats.myWinningRate && createBarChartRow(PLAYER_NAMES.mySelf, stats.myWinningRate, colors.me),
        isDoubles && stats.partnersWinningRate && createBarChartRow(PLAYER_NAMES.partner, stats.partnersWinningRate, colors.partner),
        stats.opponentsWinningRate && createBarChartRow(PLAYER_NAMES.opponentTeam, stats.opponentsWinningRate, colors.opponent)
    ]);
    
    if (isDoubles) {
        if (stats.breakDownOfGetPointDbls) { const { myWinner, partnerWinner, opponentMiss } = stats.breakDownOfGetPointDbls; drawPieChart('get_point_breakdown_chart', translate('pie_get_point_breakdown'), [['Type', 'Points'], [translate('pie_my_winner'), myWinner], [translate('pie_partner_winner'), partnerWinner], [translate('pie_opponent_miss'), opponentMiss]], [colors.me, colors.partner, colors.oppMiss], { description: translate('exp_get_point_breakdown_dbl') }); }
        if (stats.breakDownOfLostPointDbls) { const { myMiss, partnerMiss, opponentWinner } = stats.breakDownOfLostPointDbls; drawPieChart('lost_point_breakdown_chart', translate('pie_lost_point_breakdown'), [['Type', 'Points'], [translate('pie_my_miss'), myMiss], [translate('pie_partner_miss'), partnerMiss], [translate('pie_opponent_winner'), opponentWinner]], [colors.myMiss, colors.parMiss, colors.opponent], { description: translate('exp_lost_point_breakdown_dbl') }); }
        if (stats.breakDownOfWinnerPointDbls) { const { myWinner, partnerWinner, opponentWinner } = stats.breakDownOfWinnerPointDbls; drawPieChart('winner_point_breakdown_chart', translate('pie_winner_breakdown'), [['Type', 'Points'], [translate('pie_my_winner'), myWinner], [translate('pie_partner_winner'), partnerWinner], [translate('pie_opponent_winner'), opponentWinner]], [colors.me, colors.partner, colors.opponent], { description: translate('exp_winner_breakdown_dbl') }); }
        if (stats.breakDownOfMissPointDbls) { const { myMiss, partnerMiss, opponentMiss } = stats.breakDownOfMissPointDbls; drawPieChart('miss_point_breakdown_chart', translate('pie_miss_breakdown'), [['Type', 'Points'], [translate('pie_my_miss'), myMiss], [translate('pie_partner_miss'), partnerMiss], [translate('pie_opponent_miss'), opponentMiss]], [colors.myMiss, colors.parMiss, colors.oppMiss], { description: translate('exp_miss_breakdown_dbl') }); }
    } else {
        if (stats.breakDownOfGetPoint) { const { myWinner, opponentMiss } = stats.breakDownOfGetPoint; drawPieChart('get_point_breakdown_chart', translate('pie_get_point_breakdown'), [['Type', 'Points'], [translate('pie_my_winner'), myWinner], [translate('pie_opponent_miss'), opponentMiss]], [colors.me, colors.oppMiss], { description: translate('exp_get_point_breakdown_sgl') }); }
        if (stats.breakDownOfLostPoint) { const { myMiss, opponentWinner } = stats.breakDownOfLostPoint; drawPieChart('lost_point_breakdown_chart', translate('pie_lost_point_breakdown'), [['Type', 'Points'], [translate('pie_my_miss'), myMiss], [translate('pie_opponent_winner'), opponentWinner]], [colors.myMiss, colors.opponent], { description: translate('exp_lost_point_breakdown_sgl') }); }
        if (stats.breakDownOfWinnerPoint) { const { myWinner, opponentWinner } = stats.breakDownOfWinnerPoint; drawPieChart('winner_point_breakdown_chart', translate('pie_winner_breakdown'), [['Type', 'Points'], [translate('pie_my_winner'), myWinner], [translate('pie_opponent_winner'), opponentWinner]], [colors.me, colors.opponent], { description: translate('exp_winner_breakdown_sgl') }); }
        if (stats.breakDownOfMissPoint) { const { myMiss, opponentMiss } = stats.breakDownOfMissPoint; drawPieChart('miss_point_breakdown_chart', translate('pie_miss_breakdown'), [['Type', 'Points'], [translate('pie_my_miss'), myMiss], [translate('pie_opponent_miss'), opponentMiss]], [colors.myMiss, colors.oppMiss], { description: translate('exp_miss_breakdown_sgl') }); }
    }
}