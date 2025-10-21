export function getCssVariable(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export function translate(key) {
    const map = {
        "Get\nPoint": "取ったポイント", "Lost\nPoint": "取られたポイント",
        "Get\nGame": "取ったゲーム", "Couldn't\nGet": "取れなかったゲーム",
        "Server": "サーバー", "Volleyer": "ボレーヤー", "Returner": "リターナー",
        "server": "サーバー", "volleyer": "ボレーヤー", "returner": "リターナー",
        "Advantage\nSide": "アドサイド", "Duce\nSide": "デュースサイド",
        "Service\nGame": "サービスゲーム", "Return\nGame": "リターンゲーム",
        "My\nWinner": "自分が決めた", "Partners\nWinner": "味方が決めた", "Opponent\nWinner": "相手が決めた",
        "My\nMiss": "自分がミス", "Partners\nMiss": "味方がミス", "Opponent\nMiss": "相手がミス",
        "Break\nRate": "ブレーク率", "Service\nDown": "サービスダウン率",
        "MySelf": "自分", "Partner": "パートナー", "Opponent": "対戦相手",
        "1stServeIn": "ファーストサーブ", "2ndServeIn": "セカンドサーブ", "Doublefault": "ダブルフォールト",
        "Point acquisition rate\non first serve": "ファーストサーブ時のポイント取得率",
        "Point acquisition rate\non second serve": "セカンドサーブ時のポイント取得率",
        "Point acquisition rate\nat first return": "ファーストリターン時のポイント取得率",
        "Point acquisition rate\nat second return": "セカンドリターン時のポイント取得率",
        "Keep rate": "キープ率", "Break rate": "ブレーク率",
        "GetPoint and LostPoint": "取ったポイントと取られたポイント",
        "PointRate By ServiceGame or RetrunGame": "サービスゲームとリターンゲームのポイント取得率",
        "Point acquisition rate\nby service side": "サービスサイド別ポイント取得率",
        "Point acquisition rate\nby return side": "リターンサイド別ポイント取得率",
        "GetGame\n and LostGame": "取ったゲームと取れなかったゲーム",
        "Break and\n Service Down": "ブレーク率とサービスダウン率",
        "Winning rate": "ウィニングレート",
        "breakdown of getPoint": "取ったポイントの内訳", "breakdown of lostPoint": "取られたポイントの内訳",
        "breakdown of winnerPoint": "決めたポイントの内訳", "breakdown of missPoint": "ミスしたポイントの内訳",
        "AdvanceData": "アドバンスデータ"
    };
    return map[key] || key.replace(/\n/g, ' ');
}