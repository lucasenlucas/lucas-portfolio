
import { renderMarkdown } from './js/md.js';
import { getSiteText, getProjects, getPosts, getResearches, saveSiteText, saveItem, deleteItem, signInEmailPassword, signOut, ensureAuth } from './js/data.js';

// view switching
document.querySelectorAll('.sidebar .btn[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-view');
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${target}`).style.display = 'grid';
  });
});

// auth
const email = document.getElementById('email');
const pass = document.getElementById('pass');
document.getElementById('loginBtn').addEventListener('click', async () => {
  try {
    await signInEmailPassword(email.value, pass.value);
    alert('Ingelogd!');
  } catch(e) {
    alert('Login mislukt. Is Firebase geconfigureerd? ' + e.message);
  }
});
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut();
  alert('Uitgelogd.');
});

// home/about
const homeMd = document.getElementById('homeMd');
const homePreview = document.getElementById('homePreview');
const aboutMd = document.getElementById('aboutMd');
const aboutPreview = document.getElementById('aboutPreview');
homeMd.addEventListener('input', () => homePreview.innerHTML = renderMarkdown(homeMd.value));
aboutMd.addEventListener('input', () => aboutPreview.innerHTML = renderMarkdown(aboutMd.value));

(async () => {
  homeMd.value = await getSiteText('home') || '# Hi, ik ben **Lucas** 👋';
  homePreview.innerHTML = renderMarkdown(homeMd.value);
  aboutMd.value = await getSiteText('about') || '## Over mij';
  aboutPreview.innerHTML = renderMarkdown(aboutMd.value);
})();

document.getElementById('saveHome').addEventListener('click', async () => {
  try { await ensureAuth(); await saveSiteText('home', homeMd.value); alert('Home opgeslagen!'); }
  catch (e) { alert('Opslaan mislukt: ' + e.message); }
});
document.getElementById('saveAbout').addEventListener('click', async () => {
  try { await ensureAuth(); await saveSiteText('about', aboutMd.value); alert('About opgeslagen!'); }
  catch (e) { alert('Opslaan mislukt: ' + e.message); }
});

// Projects
const pTitle = document.getElementById('pTitle');
const pType = document.getElementById('pType');
const pOrder = document.getElementById('pOrder');
const pTags = document.getElementById('pTags');
const pExcerpt = document.getElementById('pExcerpt');
const pMd = document.getElementById('pMd');
const pPreview = document.getElementById('pPreview');
const pItems = document.getElementById('pItems');
pMd.addEventListener('input', () => pPreview.innerHTML = renderMarkdown(pMd.value));

function tagsArr(input) { return input.split(',').map(x => x.trim()).filter(Boolean); }

async function refreshProjects() {
  const arr = await getProjects();
  pItems.innerHTML = arr.map(p => `
    <div class="item">
      <strong>${p.title}</strong><br>
      <span class="pill">${p.type||'Project'}</span>
      ${(p.tags||[]).map(t => `<span class="pill">${t}</span>`).join('')}
      <div class="notice">${(p.excerpt||'').slice(0,220)}</div>
      <div class="actions">
        <button class="btn danger" data-del="${p.id||''}">Verwijderen</button>
      </div>
    </div>
  `).join('');
  pItems.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      try { await ensureAuth(); await deleteItem('projects', id); alert('Verwijderd'); refreshProjects(); }
      catch (e) { alert('Verwijderen mislukt: ' + e.message); }
    });
  });
}
refreshProjects();

document.getElementById('pSave').addEventListener('click', async () => {
  try {
    await ensureAuth();
    const obj = {
      title: pTitle.value,
      type: pType.value || 'Project',
      order: parseInt(pOrder.value||'999', 10),
      tags: tagsArr(pTags.value),
      excerpt: (pExcerpt.value||'').slice(0,220),
      content: pMd.value,
      createdAt: Date.now()
    };
    await saveItem('projects', obj, null);
    alert('Project opgeslagen!');
    pTitle.value = pType.value = pOrder.value = pTags.value = pExcerpt.value = pMd.value = '';
    pPreview.innerHTML = '';
    refreshProjects();
  } catch (e) { alert('Opslaan mislukt: ' + e.message); }
});
document.getElementById('pClear').addEventListener('click', () => { pTitle.value = pType.value = pOrder.value = pTags.value = pExcerpt.value = pMd.value = ''; pPreview.innerHTML = ''; });

// Blog
const bTitle = document.getElementById('bTitle');
const bDate = document.getElementById('bDate');
const bTags = document.getElementById('bTags');
const bExcerpt = document.getElementById('bExcerpt');
const bMd = document.getElementById('bMd');
const bPreview = document.getElementById('bPreview');
const bItems = document.getElementById('bItems');
bMd.addEventListener('input', () => bPreview.innerHTML = renderMarkdown(bMd.value));

async function refreshPosts() {
  const arr = await getPosts();
  bItems.innerHTML = arr.map(p => `
    <div class="item">
      <strong>${p.title}</strong><br>
      <span class="pill">${(p.tags||[]).join(', ')}</span>
      <div class="notice">${(p.excerpt||'').slice(0,280)}</div>
      <div class="actions">
        <button class="btn danger" data-del="${p.id||''}">Verwijderen</button>
      </div>
    </div>
  `).join('');
  bItems.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      try { await ensureAuth(); await deleteItem('posts', id); alert('Verwijderd'); refreshPosts(); }
      catch (e) { alert('Verwijderen mislukt: ' + e.message); }
    });
  });
}
refreshPosts();

document.getElementById('bSave').addEventListener('click', async () => {
  try {
    await ensureAuth();
    const obj = {
      title: bTitle.value,
      date: bDate.value || new Date().toISOString().slice(0,10),
      tags: tagsArr(bTags.value),
      excerpt: bExcerpt.value,
      content: bMd.value,
      createdAt: Date.now()
    };
    await saveItem('posts', obj, null);
    alert('Post opgeslagen!');
    bTitle.value = bDate.value = bTags.value = bExcerpt.value = bMd.value = '';
    bPreview.innerHTML = '';
    refreshPosts();
  } catch (e) { alert('Opslaan mislukt: ' + e.message); }
});
document.getElementById('bClear').addEventListener('click', () => { bTitle.value = bDate.value = bTags.value = bExcerpt.value = bMd.value = ''; bPreview.innerHTML = ''; });

// Research
const rTitle = document.getElementById('rTitle');
const rDate = document.getElementById('rDate');
const rTags = document.getElementById('rTags');
const rExcerpt = document.getElementById('rExcerpt');
const rMd = document.getElementById('rMd');
const rPreview = document.getElementById('rPreview');
const rItems = document.getElementById('rItems');
rMd.addEventListener('input', () => rPreview.innerHTML = renderMarkdown(rMd.value));

async function refreshResearch() {
  const arr = await getResearches();
  rItems.innerHTML = arr.map(r => `
    <div class="item">
      <strong>${r.title}</strong><br>
      <span class="pill">${(r.tags||[]).join(', ')}</span>
      <div class="notice">${(r.excerpt||'').slice(0,320)}</div>
      <div class="actions">
        <button class="btn danger" data-del="${r.id||''}">Verwijderen</button>
      </div>
    </div>
  `).join('');
  rItems.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      try { await ensureAuth(); await deleteItem('research', id); alert('Verwijderd'); refreshResearch(); }
      catch (e) { alert('Verwijderen mislukt: ' + e.message); }
    });
  });
}
refreshResearch();

document.getElementById('rSave').addEventListener('click', async () => {
  try {
    await ensureAuth();
    const obj = {
      title: rTitle.value,
      date: rDate.value || new Date().toISOString().slice(0,10),
      tags: tagsArr(rTags.value),
      excerpt: rExcerpt.value,
      content: rMd.value,
      createdAt: Date.now()
    };
    await saveItem('research', obj, null);
    alert('Onderzoek opgeslagen!');
    rTitle.value = rDate.value = rTags.value = rExcerpt.value = rMd.value = '';
    rPreview.innerHTML = '';
    refreshResearch();
  } catch (e) { alert('Opslaan mislukt: ' + e.message); }
});
document.getElementById('rClear').addEventListener('click', () => { rTitle.value = rDate.value = rTags.value = rExcerpt.value = rMd.value = ''; rPreview.innerHTML = ''; });
