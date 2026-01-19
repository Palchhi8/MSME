const admin = require('firebase-admin');
const env = require('./env');

const serviceAccount = {
  projectId: env.firebase.projectId,
  clientEmail: env.firebase.clientEmail,
  privateKey: env.firebase.privateKey
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const firestore = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  firestore,
  auth
};
