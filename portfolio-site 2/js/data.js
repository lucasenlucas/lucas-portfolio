
// Data layer: Firebase (if configured) or JSON fallback — v12.1.0
export let useFirebase = false;
let app, db, auth;
let firebaseMod = {};

async function tryInitFirebase() {
  try {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg) return false;

    const appMod = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
    const dbMod = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');

    app = appMod.initializeApp(cfg);
    auth = authMod.getAuth(app);
    db = dbMod.getFirestore(app);

    firebaseMod = { authMod, dbMod };
    useFirebase = true;
    console.log('[data] Firebase v12.1.0 ready');
    return true;
  } catch (e) {
    console.warn('[data] Firebase init failed or not configured. Fallback to JSON.', e);
    useFirebase = false;
    return false;
  }
}

export async function getSiteText(key) {
  if (useFirebase || await tryInitFirebase()) {
    const { dbMod } = firebaseMod;
    const ref = dbMod.doc(db, 'site', key);
    const snap = await dbMod.getDoc(ref);
    return snap.exists() ? snap.data().markdown || '' : '';
  } else {
    const res = await fetch('data/site.json'); const json = await res.json(); return json[key] || '';
  }
}
export async function getProjects() {
  if (useFirebase || await tryInitFirebase()) {
    const { dbMod } = firebaseMod;
    const col = dbMod.collection(db, 'projects');
    const q = dbMod.query(col, dbMod.orderBy('order', 'asc'));
    const snap = await dbMod.getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else { const res = await fetch('data/projects.json'); return await res.json(); }
}
export async function getPosts() {
  if (useFirebase || await tryInitFirebase()) {
    const { dbMod } = firebaseMod;
    const col = dbMod.collection(db, 'posts');
    const q = dbMod.query(col, dbMod.orderBy('date', 'desc'));
    const snap = await dbMod.getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else { const res = await fetch('data/posts.json'); return await res.json(); }
}
export async function getResearches() {
  if (useFirebase || await tryInitFirebase()) {
    const { dbMod } = firebaseMod;
    const col = dbMod.collection(db, 'research');
    const q = dbMod.query(col, dbMod.orderBy('date', 'desc'));
    const snap = await dbMod.getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else { const res = await fetch('data/research.json'); return await res.json(); }
}

// Admin-only writes are not used in site repo.
export async function ensureAuth(){ throw new Error('No writes in site repo'); }
export async function signInEmailPassword(){ throw new Error('No writes in site repo'); }
export async function signOut(){}
export async function saveSiteText(){ throw new Error('No writes in site repo'); }
export async function saveItem(){ throw new Error('No writes in site repo'); }
export async function deleteItem(){ throw new Error('No writes in site repo'); }
