// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * この関数を呼び出した認証済みユーザーに「writer」ロールを付与します。
 * iOSアプリからログイン直後に呼び出すことを想定しています。
 */
exports.grantWriterRole = functions.https.onCall(async (data, context) => {
  // 呼び出し元が認証済みユーザーでなければエラーを返す
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "This function must be called by an authenticated user.",
    );
  }

  const uid = context.auth.uid;

  // ユーザーにカスタムクレームを設定する
  try {
    await admin.auth().setCustomUserClaims(uid, {writer: true});
    return {
      status: "success",
      message: `Custom claim 'writer: true' has been set for user ${uid}.`,
    };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to set custom claims.",
    );
  }
});
