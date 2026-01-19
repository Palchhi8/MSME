const { firestore, admin } = require('../config/firebase');

const getSalesCollection = (uid) => firestore.collection('users').doc(uid).collection('sales');

const normalizeDateField = (data) => {
  if (data.date) {
    return data.date;
  }
  if (data.dateTimestamp?.toDate) {
    return data.dateTimestamp.toDate().toISOString();
  }
  return new Date().toISOString();
};

const toDomainSale = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    productName: data.productName,
    quantity: data.quantity,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    date: normalizeDateField(data)
  };
};

const BATCH_LIMIT = 400; // stay under Firestore's 500 write limit

const saveSalesBatch = async (uid, salesRows) => {
  const collectionRef = getSalesCollection(uid);

  for (let i = 0; i < salesRows.length; i += BATCH_LIMIT) {
    const batch = firestore.batch();
    const chunk = salesRows.slice(i, i + BATCH_LIMIT);

    chunk.forEach((row) => {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        ...row,
        ownerId: uid,
        dateTimestamp: admin.firestore.Timestamp.fromDate(new Date(row.date)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
  }
};

const fetchSales = async (uid) => {
  const collectionRef = getSalesCollection(uid);
  const snapshot = await collectionRef.orderBy('dateTimestamp', 'desc').get();
  return snapshot.docs.map(toDomainSale);
};

module.exports = {
  getSalesCollection,
  saveSalesBatch,
  fetchSales
};
