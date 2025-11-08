
import { ALL_DATA } from '../state.js';
import { normalizeTimestamp } from '../main.js';
import { translate } from '../i18n.js';

function formatText(text) {
    if (!text) return translate('no_data_to_display');
    return text.replace(/\n/g, '<br>');
}

function createSection(titleKey, content) {
    if (!content) return '';
    return `
        <section class="analysis-section">
            <header class="section-header"><h3>${translate(titleKey)}</h3></header>
            <div class="analysis-content">
                <p>${formatText(content)}</p>
            </div>
        </section>
    `;
}

export function renderAiAnalysis() {
    const container = document.getElementById('ai-analysis');
    if (!container) return;

    const geminiAnalyses = (ALL_DATA.geminiData || []).sort((a, b) => {
        const dateA = normalizeTimestamp(a.created);
        const dateB = normalizeTimestamp(b.created);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
    });

    const analysis = geminiAnalyses[0];
    const match = ALL_DATA.matchData[0];
    const isDoubles = match?.matchFormat === 'doubles';

    if (!analysis) {
        container.innerHTML = `<h2>${translate('ai_title')}</h2><p style="text-align: center; padding: 2rem;">${translate('no_data_to_display')}</p>`;
        return;
    }

    let opponentSection = '';
    if (isDoubles) {
        opponentSection = createSection('ai_about_partner', analysis.aboutPartner) +
                          createSection('ai_about_opposing_team', analysis.aboutOpposingTeam);
    } else {
        opponentSection = createSection('ai_about_opponent', analysis.aboutOpponent);
    }

    container.innerHTML = `
        <h2 data-i18n-key="ai_title">${translate('ai_title')}</h2>
        ${createSection('ai_summary', analysis.summary)}
        ${createSection('ai_good_points', analysis.goodPoints)}
        ${createSection('ai_bad_points', analysis.badPoints)}
        ${opponentSection}
        ${createSection('ai_future_challenges', analysis.futureChallenges)}
        ${createSection('ai_practice_menu', analysis.practiceMenu)}
    `;
}