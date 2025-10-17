// 1. 必要な機能をすべてインポートする
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// --- グローバル変数 ---
// 各データを格納するための変数を定義
let matchData;
let setDatas;
let gameDatas;
let pointDatas;

// --- メイン処理 ---
// アプリケーション全体を非同期関数で囲み、初期化が完了してから処理を開始する
async function main() {
  try {
    // 2. Firebase Hostingの予約済みURLから設定情報を動的に取得
    const response = await fetch('/__/firebase/init.json');
    const firebaseConfig = await response.json();
    
    // 3. 取得した設定情報でFirebase App と Firestore を初期化
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 4. ローカル開発時はエミュレータに接続
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("ローカルのFirestoreエミュレータに接続しました。");
    }

    // 5. URLからmatchIdを取得して、データ取得処理を開始
    const url = new URL(window.location.href);
    const matchId = url.searchParams.get("matchId");

    if (matchId) {
      // dbインスタンスを引数として渡すように変更
      await fetchAllGameData(db, matchId);

      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      // データ取得後の処理（例：画面への描画など）は、この行以降に書くと安全です
      console.log("すべてのデータ取得が完了しました。");
      // renderUI(); // 例えば、ここでUIを更新する関数を呼び出す
      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    } else {
      console.error("URLにmatchIdが指定されていません。");
    }

  } catch (error) {
    console.error("アプリケーションの初期化または実行中にエラーが発生しました:", error);
  }
}

/**
 * 指定されたmatchIdの試合関連データをすべて取得する関数
 * @param {object} db - Firestoreのデータベースインスタンス
 * @param {string} targetMatchId - 検索するmatchId
 */
async function fetchAllGameData(db, targetMatchId) {
  // --- matchDataの取得処理 ---
  try {
    console.log(`matchDataを検索しています...`);
    const matchDataRef = collection(db, "matchData");
    const qMatch = query(matchDataRef, where("matchId", "==", targetMatchId));
    const matchSnapshot = await getDocs(qMatch);

    if (!matchSnapshot.empty) {
      matchData = matchSnapshot.docs[0].data();
      console.log(`matchData:`, matchData);
    } else {
      console.log("matchDataが見つかりませんでした。");
    }
  } catch (error) {
    console.error("matchDataの取得に失敗しました:", error);
  }

  // --- setDataの取得処理 ---
  try {
    console.log(`setDataを検索しています...`);
    const setDataRef = collection(db, "setData");
    const qSet = query(setDataRef, where("matchId", "==", targetMatchId));
    const setSnapshot = await getDocs(qSet);
    
    const sets = [];
    setSnapshot.forEach((doc) => {
      sets.push(doc.data());
    });
    setDatas = sets;
    console.log(`setDataの配列:`, setDatas);
  } catch (error) {
    console.error("setDataの取得に失敗しました:", error);
  }

  // --- gameDataの取得処理 ---
  try {
    console.log(`gameDataを検索しています...`);
    const gameDataRef = collection(db, "gameData");
    const qGame = query(gameDataRef, where("matchId", "==", targetMatchId));
    const gameSnapshot = await getDocs(qGame);
    
    const games = [];
    gameSnapshot.forEach((doc) => {
      games.push(doc.data());
    });
    gameDatas = games;
    console.log(`gameDataの配列:`, gameDatas);
  } catch (error) {
    console.error("gameDataの取得に失敗しました:", error);
  }
  
  // --- pointDataの取得処理 ---
  try {
    console.log(`pointDataを検索しています...`);
    const pointDataRef = collection(db, "pointData");
    const qPoint = query(pointDataRef, where("matchId", "==", targetMatchId));
    const pointsSnapshot = await getDocs(qPoint);
    
    const points = [];
    pointsSnapshot.forEach((doc) => {
      points.push(doc.data());
    });

    pointDatas = points;
    console.log(`pointDataの配列:`, pointDatas);
  } catch (error) {
    console.error("pointaDataの取得に失敗しました:", error);
  }
}

// --- アプリケーションの実行を開始 ---
main();