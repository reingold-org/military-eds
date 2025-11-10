// dvids-action.js

(() => {
  const API_BASE_SEARCH = 'https://api.dvidshub.net/search';
  const API_BASE_ASSET = 'https://api.dvidshub.net/asset';
  const API_KEY = 'key-6911edd214ab0';
  const MAX_RESULTS = 20;

  window.hlx.sidekick.add({
    id: 'dvids-search',
    button: {
      text: 'DVIDS',
    },
    async action(sidekick) {
      // Build overlay UI
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '10%';
      overlay.style.left = '50%';
      overlay.style.transform = 'translateX(-50%)';
      overlay.style.width = '640px';
      overlay.style.height = '520px';
      overlay.style.background = '#222';
      overlay.style.color = '#fff';
      overlay.style.padding = '12px';
      overlay.style.borderRadius = '8px';
      overlay.style.zIndex = '9999';
      overlay.style.overflow = 'auto';

      overlay.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <input id="dvids-q" type="text" placeholder="Search images" style="flex:1;padding:6px;" />
          <button id="dvids-search-btn">Search</button>
          <button id="dvids-close-btn">Close</button>
        </div>
        <div id="dvids-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;"></div>
        <div id="dvids-status" style="margin-top:10px;font-size:12px;opacity:0.85;">Idle</div>
      `;

      document.body.appendChild(overlay);

      const els = {
        q: overlay.querySelector('#dvids-q'),
        searchBtn: overlay.querySelector('#dvids-search-btn'),
        closeBtn: overlay.querySelector('#dvids-close-btn'),
        grid: overlay.querySelector('#dvids-grid'),
        status: overlay.querySelector('#dvids-status'),
      };

      function setStatus(msg) {
        els.status.textContent = msg;
      }

      function buildSearchUrl(q) {
        const u = new URL(API_BASE_SEARCH);
        const p = new URLSearchParams();
        p.set('api_key', API_KEY);
        p.set('type[]', 'image');
        p.set('q', q);
        p.set('page', '1');
        p.set('max_results', String(MAX_RESULTS));
        p.set('thumb_width', '256');
        p.set('thumb_quality', '80');
        u.search = p.toString();
        return u.toString();
      }

      async function search() {
        const q = els.q.value.trim();
        if (!q) return;
        setStatus('Searching…');
        try {
          const url = buildSearchUrl(q);
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(`Search failed: ${res.status}`);
          const data = await res.json();
          const results = Array.isArray(data.results) ? data.results : [];
          renderGrid(results);
          setStatus(`Found ${results.length} results`);
        } catch (err) {
          console.error(err);
          setStatus(`Error: ${err.message}`);
        }
      }

      function renderGrid(items) {
        els.grid.innerHTML = '';
        items.forEach((item) => {
          const card = document.createElement('div');
          card.style.cursor = 'pointer';
          card.style.position = 'relative';
          card.style.background = '#111';
          card.style.borderRadius = '6px';
          card.style.overflow = 'hidden';

          const img = document.createElement('img');
          img.src = item.thumbnail;
          img.alt = item.title || '';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';

          const meta = document.createElement('div');
          meta.textContent = item.title || '';
          meta.style.position = 'absolute';
          meta.style.bottom = '0';
          meta.style.left = '0';
          meta.style.right = '0';
          meta.style.fontSize = '11px';
          meta.style.background = 'linear-gradient(transparent, rgba(0,0,0,0.7))';
          meta.style.color = '#fff';
          meta.style.padding = '4px';

          card.append(img, meta);
          card.addEventListener('click', () => onSelect(item));
          els.grid.appendChild(card);
        });
      }

      async function onSelect(item) {
        setStatus('Fetching full asset…');
        try {
          const assetUrl = `${API_BASE_ASSET}?id=${encodeURIComponent(item.id)}&api_key=${API_KEY}`;
          const res = await fetch(assetUrl, { headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(`Asset API failed: ${res.status}`);
          const data = await res.json();
          const fullImageUrl = data.results?.image;
          if (!fullImageUrl) throw new Error('No full image URL found');

          // Load into <img>
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = fullImageUrl;
          await img.decode();

          // Draw into canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);

          // Convert to blob
          const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));

          // Copy to clipboard (now in top document context)
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);

          setStatus('✅ Image copied to clipboard');
        } catch (err) {
          console.error(err);
          setStatus(`❌ Copy failed: ${err.message}`);
        }
      }

      // Wire UI
      els.searchBtn.addEventListener('click', search);
      els.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
      els.closeBtn.addEventListener('click', () => overlay.remove());
    },
  });
})();
