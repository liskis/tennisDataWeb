// 1. 必要な機能をすべてインポートする
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// 2. Firebaseプロジェクトの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyBYVzDxNLSFbNuePIl0VfPwv0CE1Yd1Sv0",
  authDomain: "tennisdata-4ec3f.firebaseapp.com",
  projectId: "tennisdata-4ec3f",
  storageBucket: "tennisdata-4ec3f.firebasestorage.app",
  messagingSenderId: "49198809576",
  appId: "1:49198809576:web:f5b7242ee2318096e6a45d",
  measurementId: "G-YJHQ8QT20X"
};

// 3. Firebase App と Firestore を初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ←★ここが重要な変更点！

// もしページがローカルホストで実行されていたら、エミュレータに接続する
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  // Firestoreエミュレータはポート8080で動いている
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log("ローカルのFirestoreエミュレータに接続しました。");
}

// 4. Firestoreからデータを取得して表示する関数を定義
async function fetchMatchData() {
  try {
    // collection() と getDocs() を使ってデータを取得する（最新の書き方）
    const querySnapshot = await getDocs(collection(db, "matchData"));
    
    const dataList = document.getElementById('data-list');
    
    // 中身を一度空にする（更新時にデータが重複しないように）
    dataList.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // まずはコンソールにデータが出力されるか確認
      console.log(`ドキュメントID: ${doc.id}`, data);

      // HTMLのリスト要素を作成して追加
      const listItem = document.createElement('li');
      listItem.textContent = `ID: ${data.matchId}, 形式: ${data.matchFormat}, 開始日: ${data.matchStartDate}`;
      dataList.appendChild(listItem);
    });

  } catch (error) {
    // エラーが発生したらコンソールに表示
    console.error("データの取得に失敗しました:", error);
  }
}

// 5. 定義した関数を実行
fetchMatchData();