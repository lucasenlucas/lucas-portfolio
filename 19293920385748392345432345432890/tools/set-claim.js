// tools/set-claim.js
const admin = require('firebase-admin');
const sa = require('./serviceAccount.json'); // download uit Firebase: Service accounts
admin.initializeApp({ credential: admin.credential.cert(sa) });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jij@example.com';

(async () => {
  const u = await admin.auth().getUserByEmail(ADMIN_EMAIL);
  await admin.auth().setCustomUserClaims(u.uid, { admin: true });
  console.log('✅ Admin claim gezet voor', ADMIN_EMAIL);
})().catch(e => { console.error(e); process.exit(1); });
