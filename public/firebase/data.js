// public/firebase/data.js

export async function fetchAllGameData(db, targetMatchId) {
    const matchRelatedCollections = ['matchData', 'setData', 'gameData', 'pointData', 'geminiData'];
    const matchPromises = matchRelatedCollections.map(async (colName) => {
        const dataRef = db.collection(colName); 
        const q = dataRef.where("matchId", "==", targetMatchId);
        const snapshot = await q.get();
        const data = snapshot.docs.map(doc => doc.data());
        return { [colName]: data };
    });

    const usersRef = db.collection("userData");
    const usersPromise = usersRef.get().then(snapshot => {
        const data = snapshot.docs.map(doc => doc.data());
        return { userData: data };
    });

    const results = await Promise.all([...matchPromises, usersPromise]);
    const allData = Object.assign({}, ...results);
    
    console.log("取得した全データ:", allData);
    return allData;
}