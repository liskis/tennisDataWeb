const admin = require('firebase-admin');
const fs = require('fs');

// ★★★★★ ここからが変更点 ★★★★★
// エミュレータに接続する場合でも、どのプロジェクトか教える必要があるため、
// serviceAccountKey.json からプロジェクトIDを読み込む
const serviceAccount = require('./serviceAccountKey.json');
const projectId = serviceAccount.project_id;

// FIRESTORE_EMULATOR_HOST 環境変数があれば、通信は自動でエミュレータに向かう
admin.initializeApp({
  projectId: projectId, // ★★★ プロジェクトIDを明示的に指定 ★★★
});
// ★★★★★ ここまで ★★★★★

const db = admin.firestore();

async function importAllCollections() {
  console.log('--- `backup.json` からエミュレータへのインポートを開始します ---');

  const backupJson = fs.readFileSync('backup.json', 'utf8');
  const backupData = JSON.parse(backupJson);

  for (const collectionName in backupData) {
    const docs = backupData[collectionName];
    if (docs.length === 0) {
      console.log(`[${collectionName}] にはインポートするデータがありません。スキップします。`);
      continue;
    }
    
    console.log(`[${collectionName}] の ${docs.length} 件のドキュメントを書き込み中...`);
    const batch = db.batch();
    docs.forEach(doc => {
      const docRef = db.collection(collectionName).doc(doc.id);
      batch.set(docRef, doc.data);
    });
    await batch.commit();
    console.log(` -> ✅ [${collectionName}] のインポートが完了しました。`);
  }
  
  console.log('\n🎉 すべてのインポート処理が完了しました！');
  console.log('Emulator UI (http://localhost:4000/firestore) を確認してください。');
}

importAllCollections().catch(error => {
  console.error("❌ インポート中にエラーが発生しました:", error);
});