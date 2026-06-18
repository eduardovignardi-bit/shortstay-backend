const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

console.log("================================");
console.log("FIREBASE ADMIN");
console.log("PROJECT ID:", serviceAccount.project_id);
console.log("CLIENT EMAIL:", serviceAccount.client_email);
console.log(
  "PRIVATE KEY EXISTS:",
  !!serviceAccount.private_key
);
console.log("================================");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };