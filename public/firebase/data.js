// firebase/data.js

import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

/**
 * 指定されたmatchIdに関連するすべてのコレクションデータを取得する
 * @param {object} db - Firestoreのデータベースインスタンス
 * @param {string} targetMatchId - 検索するmatchId
 * @returns {Promise<object>} 全てのデータを格納したオブジェクト
 */
export async function fetchAllGameData(db, targetMatchId) {
    const collections = ['matchData', 'setData', 'gameData', 'pointData'];
    const promises = collections.map(async (colName) => {
        const dataRef = collection(db, colName);
        const q = query(dataRef, where("matchId", "==", targetMatchId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        return { [colName]: data };
    });
    
    const results = await Promise.all(promises);
    const allData = Object.assign({}, ...results);
    console.log("取得した全データ:", allData);
    return allData;
}