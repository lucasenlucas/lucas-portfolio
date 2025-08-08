
import { renderMarkdown } from './md.js';
import { getSiteText, getProjects, getPosts, getResearches } from './data.js';

// Tabs etc from v1
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const urlSpan = document.getElementById('url');
const yearSpan = document.getElementById('year');
const themeToggle = document.getElementById('themeToggle');

function openPanel(id) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === id));
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  urlSpan.textContent = `lucas.${id}`;
  const activeTab = [...tabs].find(t => t.dataset.target === id);
  tabs.forEach(t => t.setAttribute('aria-selected', t === activeTab ? 'true' : 'false'));
  const panel = document.getElementById(id);
  if (panel) panel.focus();
  history.replaceState(null, '', `#${id}`);
}

tabs.forEach(tab => tab.addEventListener('click', () => openPanel(tab.dataset.target)));
document.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openPanel(el.getAttribute('data-open'))));

// Keyboard: 1..6
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const map = ['home','projects','about','blog','research','contact'];
  const idx = parseInt(e.key, 10) - 1;
  if (idx >= 0 && idx < map.length) openPanel(map[idx]);
});

const hash = location.hash.replace('#','');
if (hash) openPanel(hash);
yearSpan.textContent = new Date().getFullYear();

// Theme
const root = document.documentElement;
const saved = localStorage.getItem('theme') || 'dark';
if (saved === 'light') root.classList.add('light');
themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// In-view animation
const iv = new IntersectionObserver((entries) => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
}, { threshold: 0.2 });
document.querySelectorAll('.in-view').forEach(el => iv.observe(el));

// Parallax hero
const hero = document.querySelector('.hero-art img');
document.addEventListener('mousemove', (e) => {
  if (!hero) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 6;
  const y = (e.clientY / window.innerHeight - 0.5) * 6;
  hero.style.transform = `translate(${x}px, ${y}px)`;
});

// ===== Load site text (markdown) =====
(async () => {
  const homeMd = await getSiteText('home'); // markdown
  const aboutMd = await getSiteText('about');
  const homeDiv = document.getElementById('homeContent');
  const aboutDiv = document.getElementById('aboutContent');
  if (homeDiv) homeDiv.innerHTML = renderMarkdown(homeMd || '# Hi, ik ben **Lucas** 👋\nWebdev • Ethical hacker • Maker. Ik bouw speelse, snelle webapps en leer anderen hoe AI werkt.');
  if (aboutDiv) aboutDiv.innerHTML = renderMarkdown(aboutMd || '## Over mij\n- Focus: webdev, AI-educatie, security\n- Skills: HTML/CSS/JS, Firebase, Node, Python basics\n- Plus: UX/animaties, workshops geven');
})();

// ===== Dynamic Projects with modal =====
const grid = document.getElementById('projectsGrid');
const searchBox = document.getElementById('projectSearch');
const tagFilters = document.getElementById('tagFilters');
const modal = document.getElementById('projectModal');
const modalClose = modal?.querySelector('.modal-close');
const modalBackdrop = modal?.querySelector('.modal-backdrop');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalMd = document.getElementById('modalMd');

let PROJECTS = [];
let activeTags = new Set();

function openModal() { modal?.classList.add('show'); }
function closeModal() { modal?.classList.remove('show'); }
modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function renderProjects() {
  if (!grid) return;
  const q = (searchBox?.value || '').toLowerCase().trim();
  const results = PROJECTS.filter(p => {
    const matchesQ = !q || p.title?.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q) || (p.tags||[]).join(' ').toLowerCase().includes(q);
    const matchesTags = activeTags.size === 0 || [...activeTags].every(t => (p.tags||[]).includes(t));
    return matchesQ && matchesTags;
  });

  grid.innerHTML = results.map(p => {
    const short = (p.excerpt || p.desc || '').slice(0, 220) + ((p.excerpt || p.desc || '').length > 220 ? '…' : '');
    return `
    <article class="card link hover-pop" data-id="${p.id||''}" tabindex="0">
      <h3>${p.title||'Onbenoemd'}</h3>
      <p>${short || ''}</p>
      <div class="tags">${(p.tags||[]).map(t => `<span>${t}</span>`).join('')}</div>
    </article>`;
  }).join('') || `<div class="card"><p>Geen resultaten. Probeer een andere zoekterm of filter.</p></div>`;

  grid.querySelectorAll('.card.link').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const p = PROJECTS.find(x => (x.id||'') === id || x.title === card.querySelector('h3')?.textContent);
      if (!p) return;
      modalTitle.textContent = p.title || '';
      modalMeta.textContent = `${(p.type||'Project')} — ${(p.tags||[]).join(', ')}`;
      modalMd.innerHTML = renderMarkdown(p.content || p.desc || '');
      openModal();
    });
    card.addEventListener('keypress', (e) => { if (e.key === 'Enter') card.click(); });
  });
}

function buildTagButtons() {
  if (!tagFilters) return;
  const allTags = [...new Set(PROJECTS.flatMap(p => p.tags||[]))].sort();
  tagFilters.innerHTML = allTags.map(t => `<button class="tag-btn" data-tag="${t}">${t}</button>`).join('');
  tagFilters.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      if (activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
      btn.classList.toggle('active');
      renderProjects();
    });
  });
}

(async function loadProjects() {
  PROJECTS = await getProjects();
  renderProjects();
  buildTagButtons();
})();

searchBox?.addEventListener('input', renderProjects);
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault(); searchBox?.focus();
  }
});

// ===== Blog list & modal =====
const blogList = document.getElementById('blogList');
const postModal = document.getElementById('postModal');
const postClose = postModal?.querySelector('.modal-close');
const postBackdrop = postModal?.querySelector('.modal-backdrop');
const postTitle = document.getElementById('postTitle');
const postMeta = document.getElementById('postMeta');
const postMd = document.getElementById('postMd');
function closePost() { postModal?.classList.remove('show'); }
postClose?.addEventListener('click', closePost);
postBackdrop?.addEventListener('click', closePost);

(async function loadPosts() {
  if (!blogList) return;
  const posts = await getPosts();
  blogList.innerHTML = posts.map(p => `
    <article class="card link" data-id="${p.id||''}" tabindex="0">
      <h3>${p.title}</h3>
      <div class="meta">${p.date||''} — ${(p.tags||[]).join(', ')}</div>
      <p>${(p.excerpt||'').slice(0,280)}</p>
      <div class="tags">${(p.tags||[]).map(t => `<span>${t}</span>`).join('')}</div>
    </article>
  `).join('');

  blogList.querySelectorAll('.card.link').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const p = posts.find(x => (x.id||'') === id || x.title === card.querySelector('h3')?.textContent);
      if (!p) return;
      postTitle.textContent = p.title;
      postMeta.textContent = `${p.date||''} — ${(p.tags||[]).join(', ')}`;
      postMd.innerHTML = renderMarkdown(p.content || p.excerpt || '');
      postModal.classList.add('show');
    });
  });
})();

// ===== Research list =====
const researchList = document.getElementById('researchList');
(async function loadResearch() {
  if (!researchList) return;
  const items = await getResearches();
  researchList.innerHTML = items.map(r => `
    <article class="card link" data-id="${r.id||''}" tabindex="0">
      <h3>${r.title}</h3>
      <div class="meta">${r.date||''} — ${(r.tags||[]).join(', ')}</div>
      <p>${(r.excerpt||'').slice(0,320)}</p>
      <div class="tags">${(r.tags||[]).map(t => `<span>${t}</span>`).join('')}</div>
    </article>
  `).join('');

  // open in blog modal
  researchList.querySelectorAll('.card.link').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const r = items.find(x => (x.id||'') === id || x.title === card.querySelector('h3')?.textContent);
      if (!r) return;
      postTitle.textContent = r.title;
      postMeta.textContent = `${r.date||''} — ${(r.tags||[]).join(', ')}`;
      postMd.innerHTML = renderMarkdown(r.content || r.excerpt || '');
      postModal.classList.add('show');
    });
  });
})();
