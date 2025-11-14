const API_BASE_SEARCH = 'https://api.dvidshub.net/search';
const API_BASE_ASSET = 'https://api.dvidshub.net/asset';
const API_KEY = 'key-6911edd214ab0'; // keep secret; consider a proxy for production.
const MAX_RESULTS = 20;

let page = 1;

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
  console.log('[STATUS]', text);
}

function buildSearchUrl(params) {
  const u = new URL(API_BASE_SEARCH);
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
  p.set('thumb_width', '256');
  p.set('thumb_quality', '80');
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

  setStatus('Searching…');
  try {
    const url = buildSearchUrl(params);
    console.log('[SEARCH URL]', url);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    console.log('[SEARCH RESULTS]', results);
    renderGrid(results);
    setStatus(`Page ${page} — ${results.length} results`);
  } catch (e) {
    console.error('[SEARCH ERROR]', e);
    setStatus(`Error: ${e.message}`);
  }
}

function renderGrid(items) {
  els.grid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.thumbnail;
    img.alt = item.title || '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = item.title || '';
    card.append(img, meta);
    card.addEventListener('click', () => onSelect(item, card));
    els.grid.appendChild(card);
  });
}

function showCopiedOverlay(card) {
  const overlay = document.createElement('div');
  overlay.className = 'copied-overlay';
  overlay.textContent = '✅ Image copied';
  card.appendChild(overlay);

  setTimeout(() => overlay.remove(), 1500);
}

function onSelect(item, card) {
  console.log('[CLICK]', item.id, 'document.hasFocus=', document.hasFocus());
  window.focus();
  console.log('[AFTER window.focus] document.hasFocus=', document.hasFocus());

  setStatus('Fetching full asset…');

  (async () => {
    try {
      const assetUrl = `${API_BASE_ASSET}?id=${encodeURIComponent(item.id)}&api_key=${API_KEY}`;
      console.log('[ASSET URL]', assetUrl);
      const res = await fetch(assetUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Asset API failed: ${res.status}`);
      const data = await res.json();
      console.log('[ASSET DATA]', data);
      const fullImageUrl = data.results?.image;
      if (!fullImageUrl) throw new Error('No full image URL found');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullImageUrl;
      await img.decode();
      console.log('[IMAGE LOADED]', fullImageUrl, img.naturalWidth, img.naturalHeight);

      // Calculate target dimensions to stay under clipboard size limits
      // Clipboard typically supports ~2-4 MB for PNG
      const MAX_BLOB_SIZE = 4 * 1024 * 1024; // 4 MB to be safe
      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;
      let attempt = 0;
      let blob;

      // Start with reasonable max dimension based on original size
      let maxDimension = Math.max(targetWidth, targetHeight) > 4096 ? 4096 : Math.max(targetWidth, targetHeight);
      
      while (attempt < 5) {
        attempt++;
        
        // Calculate scaled dimensions
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
          targetWidth = Math.floor(img.naturalWidth * ratio);
          targetHeight = Math.floor(img.naturalHeight * ratio);
        }
        
        console.log(`[ATTEMPT ${attempt}]`, `${targetWidth}x${targetHeight} (max: ${maxDimension})`);
        setStatus(`Processing image ${targetWidth}x${targetHeight}...`);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpg'));
        const sizeMB = blob.size / 1024 / 1024;
        console.log(`[BLOB SIZE]`, `${sizeMB.toFixed(2)} MB`);
        
        if (blob.size <= MAX_BLOB_SIZE || maxDimension <= 512) {
          // Success or we've scaled down as much as reasonable
          break;
        }
        
        // Reduce dimensions by 30% for next attempt
        maxDimension = Math.floor(maxDimension * 0.7);
        targetWidth = img.naturalWidth;
        targetHeight = img.naturalHeight;
      }

      const finalSizeMB = (blob.size / 1024 / 1024).toFixed(2);
      console.log('[FINAL]', `${targetWidth}x${targetHeight}, ${finalSizeMB} MB`);

      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        console.log('[CLIPBOARD WRITE SUCCESS]', `${finalSizeMB} MB written`);
        const sizeMsg = img.naturalWidth !== targetWidth ? ` (resized from ${img.naturalWidth}x${img.naturalHeight})` : '';
        setStatus(`✅ Image copied: ${targetWidth}x${targetHeight}, ${finalSizeMB} MB${sizeMsg}`);
        showCopiedOverlay(card);
        // Show alt text dialog
        showAltTextDialog(item.id, data.results);
      } catch (err) {
        console.error('[CLIPBOARD WRITE ERROR]', err);
        setStatus(`❌ Copy failed: ${err.message}`);
      }
    } catch (err) {
      console.error('[COPY ERROR]', err);
      setStatus(`❌ Copy failed: ${err.message}`);
    }
  })();
}

// Wire UI
els.search.addEventListener('click', () => search(1));
els.next.addEventListener('click', () => search(page + 1));
els.prev.addEventListener('click', () => search(Math.max(1, page - 1)));
els.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(1); });

function showAltTextDialog(assetId, assetData) {
  // Extract alt text from asset data (check multiple possible fields)
  const altText = assetData?.description || 
                  assetData?.caption || 
                  assetData?.title || 
                  assetData?.alt_text ||
                  'No description available';
  
  console.log('[ALT TEXT]', altText);
  
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.className = 'alt-text-dialog-overlay';
  overlay.innerHTML = `
    <div class="alt-text-dialog">
      <div class="alt-text-dialog-header">
        <h3>DVIDS Image Alt Text</h3>
        <button class="alt-text-dialog-close" aria-label="Close">×</button>
      </div>
      <div class="alt-text-dialog-body">
        <p class="alt-text-label">Alt text / Description:</p>
        <textarea class="alt-text-content" readonly>${altText}</textarea>
        ${assetData?.id ? `<p class="alt-text-meta">Asset ID: ${assetData.id}</p>` : ''}
      </div>
      <div class="alt-text-dialog-footer">
        <button class="alt-text-copy-btn">Copy Alt Text</button>
        <button class="alt-text-close-btn">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Close handlers
  const closeDialog = () => overlay.remove();
  overlay.querySelector('.alt-text-dialog-close').addEventListener('click', closeDialog);
  overlay.querySelector('.alt-text-close-btn').addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
  
  // Copy button handler
  overlay.querySelector('.alt-text-copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(altText);
      const copyBtn = overlay.querySelector('.alt-text-copy-btn');
      copyBtn.textContent = '✅ Copied!';
      copyBtn.disabled = true;
      console.log('[ALT TEXT COPIED]', altText.substring(0, 100));
      setStatus('✅ Alt text copied to clipboard');
      
      // Close modal, reset search, and close palette
      setTimeout(() => {
        // Close the modal overlay
        closeDialog();
        
        // Reset the search form
        els.q.value = '';
        els.aspect.value = '';
        els.branch.value = '';
        els.sort.value = 'date';
        els.sortdir.value = 'desc';
        els.grid.innerHTML = '';
        page = 1;
        setStatus('Idle');
        
        // Close the entire DVIDS palette
        chrome.runtime.sendMessage('igkmdomcgoebiipaifhmpfjhbjccggml', {
          id: 'dvids-search',
          action: 'closePalette',
        });
      }, 500);
    } catch (err) {
      console.error('[COPY ALT TEXT ERROR]', err);
      setStatus(`❌ Failed to copy alt text: ${err.message}`);
    }
  });
  
  // Escape key to close
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Initial focus
setTimeout(() => {
  els.q.focus();
  window.focus();
  console.log('[INIT] document.hasFocus=', document.hasFocus());
}, 50);
