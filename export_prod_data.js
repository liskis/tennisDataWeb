const admin = require('firebase-admin');
const fs = require('fs'); // ファイル操作のためのモジュール

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function exportAllCollections() {
  const collectionsToCopy = [
    'matchData', 'setData', 'gameData', 'pointData', 'geminiData'
  ];
  const backupData = {};

  console.log('--- 本番DBからデータのエクスポートを開始します ---');

  for (const collectionName of collectionsToCopy) {
    console.log(`[${collectionName}] を読み取り中...`);
    const snapshot = await db.collection(collectionName).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    backupData[collectionName] = docs;
    console.log(` -> ${docs.length} 件のドキュメントを取得しました。`);
  }

  // 取得した全データを backup.json というファイルに書き出す
  fs.writeFileSync('backup.json', JSON.stringify(backupData, null, 2));

  console.log('\n✅ エクスポート完了！ `backup.json` ファイルが作成されました。');
}

exportAllCollections().catch(error => {
  console.error("❌ エクスポート中にエラーが発生しました:", error);
});