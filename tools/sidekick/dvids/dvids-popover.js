const API_BASE = 'https://api.dvidshub.net/search';
const API_KEY = 'key-REPLACE_WITH_YOUR_DVIDS_API_KEY'; // keep secret; consider a proxy for production.
const MAX_RESULTS = 50; // DVIDS max per page.

// State
let page = 1;
let lastQuery = '';
let lastParams = {};

const els = {
  q: document.getElementById('q'),
  aspect: document.getElementById('aspect'),
  branch: document.getElementById('branch'),
  sort: document.getElementById('sort'),
  sortdir: document.getElementById('sortdir'),
  search: document.getElementById('search'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  grid: document.getElementById('grid'),
  status: document.getElementById('status'),
};

function setStatus(text) {
  els.status.textContent = text;
}

function buildUrl(params) {
  const u = new URL(API_BASE);
  const p = new URLSearchParams();
  p.set('api_key', API_KEY);
  p.set('type[]', 'image');
  if (params.q) p.set('q', params.q);
  if (params.aspect_ratio) p.set('aspect_ratio', params.aspect_ratio);
  if (params.branch) p.set('branch', params.branch);
  p.set('sort', params.sort || 'date');
  p.set('sortdir', params.sortdir || 'desc');
  p.set('page', params.page || 1);
  p.set('max_results', String(MAX_RESULTS));
  // request higher-res thumbnails for the grid (fast + decent quality):
  p.set('thumb_width', '512');
  p.set('thumb_quality', '90');
  u.search = p.toString();
  return u.toString();
}

async function search(pageOverride) {
  page = typeof pageOverride === 'number' ? pageOverride : page;
  const params = {
    q: els.q.value.trim(),
    aspect_ratio: els.aspect.value,
    branch: els.branch.value,
    sort: els.sort.value,
    sortdir: els.sortdir.value,
    page,
  };
  lastParams = params;
  lastQuery = JSON.stringify(params);

  setStatus('Searching…');
  try {
    const url = buildUrl(params);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    renderGrid(results);
    const info = data.page_info || {};
    setStatus(`Page ${page} — ${results.length} results (per page: ${info.results_per_page || MAX_RESULTS})`);
  } catch (e) {
    console.error(e);
    setStatus(`Error: ${e.message}`);
  }
}

function renderGrid(items) {
  els.grid.innerHTML = '';
  items.forEach((item) => {
    // DVIDS fields: id (e.g., "image:9380327"), title, width, height, thumbnail, url, credit, etc.
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.thumbnail; // 512px thumb requested via params
    img.alt = item.title || '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = item.title || '';
    card.append(img, meta);
    card.addEventListener('click', () => onSelect(item));
    els.grid.appendChild(card);
  });
}

/**
 * Strategy to get "full-size" image:
 * 1) Try to obtain a large derivative via thumb_width near original width.
 * 2) If you require the true original, fetch item.url page and resolve its download image href.
 */
async function onSelect(item) {
  setStatus('Fetching image…');

  try {
    // Attempt large derivative (fast, robust, no page scraping)
    const largeUrl = await resolveLargeThumbnail(item);
    const blob = await fetchImageBlob(largeUrl);

    await copyImageToClipboard(blob);
    setStatus('Copied image to clipboard.');
  } catch (e1) {
    console.warn('Large derivative failed, attempting original resolution via page:', e1);
    try {
      const originalUrl = await resolveOriginalFromPage(item.url);
      const blob = await fetchImageBlob(originalUrl);
      await copyImageToClipboard(blob);
      setStatus('Copied original image to clipboard.');
    } catch (e2) {
      console.error(e2);
      setStatus('Failed to copy. Check API key/domain and try again.');
    }
  }
}

async function resolveLargeThumbnail(item) {
  // Use the Search API again, requesting a "near-original" thumb by width.
  // If the original width is known, request that; otherwise fallback to 2000 (API max).
  const targetWidth = Math.min(item.width || 2000, 2000);
  const u = new URL(API_BASE);
  const p = new URLSearchParams();
  p.set('api_key', API_KEY);
  p.set('type[]', 'image');
  p.set('id', item.id); // narrow to specific asset
  p.set('thumb_width', String(targetWidth));
  p.set('thumb_quality', '95');
  u.search = p.toString();

  const res = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to resolve large thumbnail: ${res.status}`);
  const data = await res.json();
  const result = Array.isArray(data.results) ? data.results[0] : null;
  if (!result || !result.thumbnail) throw new Error('No thumbnail in response.');
  return result.thumbnail;
}

async function resolveOriginalFromPage(assetUrl) {
  // Fetch the DVIDS asset page and attempt to find a direct image/download URL.
  const res = await fetch(assetUrl, { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`Failed to load asset page: ${res.status}`);

  const html = await res.text();
  // Heuristics: look for og:image or a download link.
  const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogMatch) return ogMatch[1];

  const dlMatch = html.match(/href=["'](https?:\/\/[^"']+\/download\/[^"']+)["']/i);
  if (dlMatch) return dlMatch[1];

  // Fallback: sometimes original image URLs are present as direct <img> sources.
  const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\/photos\/[^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  throw new Error('Original image URL not found on page.');
}

async function fetchImageBlob(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  return res.blob();
}

async function copyImageToClipboard(blob) {
  // Clipboard API requires secure context (https) and user gesture (click).
  const item = new ClipboardItem({ [blob.type || 'image/jpeg']: blob });
  await navigator.clipboard.write([item]);
}

// Wire UI
els.search.addEventListener('click', () => search(1));
els.next.addEventListener('click', () => search(page + 1));
els.prev.addEventListener('click', () => search(Math.max(1, page - 1)));
els.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(1); });

// Initial load focus
setTimeout(() => els.q.focus(), 50);
