// i18n.js

const translations = {
  en: {
    // General
    loading: "Loading match data...",
    no_match_id: "Match ID not specified.",
    error_loading: "Failed to load data. Please check access permissions.",
    error_generic: "An error occurred: ",
    no_data_to_display: "No data to display",
    all_sets: "All",
    set_x: "Set {number}", // {number} will be replaced
    // Tabs
    tab_basic_data: "Basic Data",
    tab_advance_data: "Advanced Data",
    tab_point_history: "Point History",
    tab_ai_analysis: "AI Analysis",
    // Match Format & Type
    singles: "Singles",
    doubles: "Doubles",
    pointGame: "Point Game",
    setMatch: "Set Match",
    tieBreak: "Tie Break",
    // Basic Data Headers
    header_first_serve_prob: "1st Serve %",
    header_second_serve_prob: "2nd Serve %",
    header_double_fault_rate: "Double Fault %",
    header_win_rate_on_1st_serve: "Win % on 1st Serve",
    header_win_rate_on_2nd_serve: "Win % on 2nd Serve",
    header_win_rate_on_1st_return: "Win % on 1st Return",
    header_win_rate_on_2nd_return: "Win % on 2nd Return",
    header_game_win_rate: "Game Win Rate",
    // Bar Chart Labels
    label_keep_rate: "Keep Rate",
    label_break_rate: "Break Rate",
    // Advanced Data Headers
    header_one_point_match_rate: "Win % on Deciding Point",
    header_winning_rate: "Winning Rate (Winner / (Winner + Miss))",
    label_service_game: "Service Game",
    label_return_game: "Return Game",
    // Point History
    point_history_title: "Full Point History",
    ph_position: "Position",
    ph_point: "Point",
    ph_get_lost: "Get/Lost",
    ph_service: "Service",
    ph_shot: "Shot",
    ph_whose: "Whose",
    ph_get: "Get",
    ph_lost: "Lost",
    ph_df_opponent: "DF (Opp.)",
    ph_df_you: "DF",
    ph_1st: "1st",
    ph_2nd: "2nd",
    ph_game_x: "Game {number}",
    ph_tie_break: "Tie-break",
    ph_keep: "Keep",
    ph_break: "Break",
    ph_service_down: "Broken",
    ph_kept_by_opponent: "Kept",
    ph_server: "Server",
    // AI Analysis
    ai_title: "AI Match Analysis",
    ai_summary: "Match Summary",
    ai_good_points: "Good Points",
    ai_bad_points: "Areas for Improvement",
    ai_about_partner: "About Partner",
    ai_about_opposing_team: "About Opposing Team",
    ai_about_opponent: "About Opponent",
    ai_future_challenges: "Future Challenges",
    ai_practice_menu: "Recommended Practice Menu",
    // ▼▼▼ ここから追加 ▼▼▼
    // Positions
    server: "Server",
    returner: "Returner",
    volleyer: "Volleyer",
    // ▲▲▲ 追加ここまで ▲▲▲
    // Player Roles (for charts & history)
    player_my_self: "You",
    player_partner: "Partner",
    player_opponent: "Opponent",
    // Pie Chart Titles & Labels
    pie_get_lost_point: "Total Points Won vs Lost",
    pie_get_point: "Won",
    pie_lost_point: "Lost",
    pie_point_rate_sv_rtn: "Point Win % by Game Type",
    pie_service_game: "Service Game",
    pie_return_game: "Return Game",
    pie_point_rate_service_side: "Point Win % by Service Side",
    pie_adv_side: "Ad Side",
    pie_duce_side: "Deuce Side",
    pie_point_rate_return_side: "Point Win % by Return Side",
    pie_get_lost_game: "Total Games Won vs Lost",
    pie_get_game: "Won",
    pie_lost_game: "Lost",
    pie_break_service_down: "Break vs Broken %",
    pie_break_rate: "Break %",
    pie_service_down: "Broken %",
    pie_get_point_breakdown: "Breakdown of Points Won",
    pie_lost_point_breakdown: "Breakdown of Points Lost",
    pie_winner_breakdown: "Breakdown of Winners",
    pie_miss_breakdown: "Breakdown of Misses",
    pie_my_winner: "My Winner",
    pie_partner_winner: "Partner's Winner",
    pie_opponent_winner: "Opponent's Winner",
    pie_my_miss: "My Miss",
    pie_partner_miss: "Partner's Miss",
    pie_opponent_miss: "Opponent's Miss",
  },
  ja: {
    // General
    loading: "試合データを読み込み中...",
    no_match_id: "試合IDが指定されていません",
    error_loading: "データの読み込みに失敗しました。アクセス権限を確認してください。",
    error_generic: "エラーが発生しました: ",
    no_data_to_display: "表示するデータがありません",
    all_sets: "全体",
    set_x: "第{number}セット",
    // Tabs
    tab_basic_data: "試合データ",
    tab_advance_data: "アドバンスデータ",
    tab_point_history: "ポイント履歴",
    tab_ai_analysis: "AIで分析",
    // Match Format & Type
    singles: "シングルス",
    doubles: "ダブルス",
    pointGame: "ポイントゲーム",
    setMatch: "セットマッチ",
    tieBreak: "タイブレーク",
    // Basic Data Headers
    header_first_serve_prob: "ファーストサーブの確率",
    header_second_serve_prob: "セカンドサーブの確率",
    header_double_fault_rate: "ダブルフォルト率",
    header_win_rate_on_1st_serve: "ファーストサーブ時のポイント取得率",
    header_win_rate_on_2nd_serve: "セカンドサーブ時のポイント取得率",
    header_win_rate_on_1st_return: "ファーストリターン時のポイント取得率",
    header_win_rate_on_2nd_return: "セカンドリターン時のポイント取得率",
    header_game_win_rate: "ゲーム取得率",
    // Bar Chart Labels
    label_keep_rate: "キープ率",
    label_break_rate: "ブレーク率",
    // Advanced Data Headers
    header_one_point_match_rate: "一本勝負時のポイント取得率",
    header_winning_rate: "ウィニングレート（決めた / ( 決めた + ミス ))",
    label_service_game: "サービスゲーム",
    label_return_game: "リターンゲーム",
    // Point History
    point_history_title: "全ポイント履歴",
    ph_position: "ポジション",
    ph_point: "ポイント",
    ph_get_lost: "Get/Lost",
    ph_service: "サービス",
    ph_shot: "ショット",
    ph_whose: "誰が",
    ph_get: "Get",
    ph_lost: "Lost",
    ph_df_opponent: "DF (相手)",
    ph_df_you: "DF",
    ph_1st: "1st",
    ph_2nd: "2nd",
    ph_game_x: "第{number}ゲーム",
    ph_tie_break: "タイブレーク",
    ph_keep: "キープ",
    ph_break: "ブレーク",
    ph_service_down: "サービスダウン",
    ph_kept_by_opponent: "キープされました",
    ph_server: "サーバー",
    // AI Analysis
    ai_title: "AIによる試合分析",
    ai_summary: "試合の総括",
    ai_good_points: "良かった点",
    ai_bad_points: "改善点",
    ai_about_partner: "パートナーについて",
    ai_about_opposing_team: "相手チームについて",
    ai_about_opponent: "相手選手について",
    ai_future_challenges: "今後の課題",
    ai_practice_menu: "おすすめの練習メニュー",
    // ▼▼▼ ここから追加 ▼▼▼
    // Positions
    server: "サーバー",
    returner: "リターナー",
    volleyer: "ボレーヤー",
    // ▲▲▲ 追加ここまで ▲▲▲
    // Player Roles
    player_my_self: "自分",
    player_partner: "パートナー",
    player_opponent: "相手",
    // Pie Chart Titles & Labels
    pie_get_lost_point: "取ったポイントと取られたポイント",
    pie_get_point: "取ったポイント",
    pie_lost_point: "取られたポイント",
    pie_point_rate_sv_rtn: "サービス/リターンゲームのポイント取得率",
    pie_service_game: "サービスゲーム",
    pie_return_game: "リターンゲーム",
    pie_point_rate_service_side: "サービスサイド別ポイント取得率",
    pie_adv_side: "アドサイド",
    pie_duce_side: "デュースサイド",
    pie_point_rate_return_side: "リターンサイド別ポイント取得率",
    pie_get_lost_game: "取ったゲームと取れなかったゲーム",
    pie_get_game: "取ったゲーム",
    pie_lost_game: "取れなかったゲーム",
    pie_break_service_down: "ブレーク率とサービスダウン率",
    pie_break_rate: "ブレーク率",
    pie_service_down: "サービスダウン率",
    pie_get_point_breakdown: "取ったポイントの内訳",
    pie_lost_point_breakdown: "取られたポイントの内訳",
    pie_winner_breakdown: "決めたポイントの内訳",
    pie_miss_breakdown: "ミスしたポイントの内訳",
    pie_my_winner: "自分が決めた",
    pie_partner_winner: "味方が決めた",
    pie_opponent_winner: "相手が決めた",
    pie_my_miss: "自分がミス",
    pie_partner_miss: "味方がミス",
    pie_opponent_miss: "相手がミス",
  }
};

let currentLanguage;

export function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('preferredLanguage', lang);
}

export function getLanguage() {
    return currentLanguage;
}

export function initI18n() {
  const savedLang = localStorage.getItem('preferredLanguage');
  const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
  currentLanguage = savedLang || browserLang;
}

export function translate(key, replacements = {}) {
  let translation = translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
  Object.keys(replacements).forEach(rKey => {
      const regex = new RegExp(`{${rKey}}`, 'g');
      translation = translation.replace(regex, replacements[rKey]);
  });
  return translation;
}