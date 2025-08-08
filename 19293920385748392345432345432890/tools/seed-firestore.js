// tools/seed-firestore.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const sa = require('./serviceAccount.json');

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function upsert(ref, data) { await ref.set(data, { merge: true }); }

async function run() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) { console.log('Geen data/ map gevonden; skip seed.'); return; }

  const site = JSON.parse(fs.readFileSync(path.join(dataDir, 'site.json'), 'utf-8'));
  await upsert(db.collection('site').doc('home'), { markdown: site.home || '' });
  await upsert(db.collection('site').doc('about'), { markdown: site.about || '' });

  const putAll = async (name) => {
    const p = path.join(dataDir, `${name}.json`);
    if (!fs.existsSync(p)) return;
    const arr = JSON.parse(fs.readFileSync(p, 'utf-8'));
    for (const item of arr) {
      const ref = db.collection(name).doc(item.id || undefined);
      await upsert(ref, { ...item, createdAt: item.createdAt || Date.now() });
    }
    console.log(`Seeded ${name}: ${arr.length}`);
  };

  await putAll('projects');
  await putAll('posts');
  await putAll('research');

  console.log('✅ Seed klaar');
}

run().catch(e => { console.error(e); process.exit(1); });
