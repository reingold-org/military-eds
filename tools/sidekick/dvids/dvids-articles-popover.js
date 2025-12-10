/**
 * DVIDS Article Import - Sidekick Plugin
 * Searches DVIDS for news articles and formats them for pasting into Word
 */

const API_BASE_SEARCH = 'https://api.dvidshub.net/search';
const API_BASE_ASSET = 'https://api.dvidshub.net/asset';
const API_KEY = 'key-6911edd214ab0'; // consider a proxy for production
const MAX_RESULTS = 15;

let page = 1;

const els = {
  q: document.getElementById('q'),
  branch: document.getElementById('branch'),
  sort: document.getElementById('sort'),
  sortdir: document.getElementById('sortdir'),
  search: document.getElementById('search'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  articles: document.getElementById('articles'),
  status: document.getElementById('status'),
};

function setStatus(text) {
  els.status.textContent = text;
  console.log('[STATUS]', text);
}

/**
 * Build search URL for DVIDS news articles
 */
function buildSearchUrl(params) {
  const u = new URL(API_BASE_SEARCH);
  const p = new URLSearchParams();
  p.set('api_key', API_KEY);
  p.set('type[]', 'news'); // Only news articles
  if (params.q) p.set('q', params.q);
  if (params.branch) p.set('branch', params.branch);
  p.set('sort', params.sort || 'date');
  p.set('sortdir', params.sortdir || 'desc');
  p.set('page', params.page || 1);
  p.set('max_results', String(MAX_RESULTS));
  u.search = p.toString();
  return u.toString();
}

/**
 * Format date for display and metadata
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for metadata (MM/DD/YYYY format that EDS expects)
 */
function formatDateForMeta(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Search for articles
 */
async function search(pageOverride) {
  page = typeof pageOverride === 'number' ? pageOverride : page;
  const params = {
    q: els.q.value.trim(),
    branch: els.branch.value,
    sort: els.sort.value,
    sortdir: els.sortdir.value,
    page,
  };

  if (!params.q) {
    setStatus('Please enter a search term');
    return;
  }

  setStatus('Searching DVIDS…');
  
  try {
    const url = buildSearchUrl(params);
    console.log('[SEARCH URL]', url);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    console.log('[SEARCH RESULTS]', results.length, 'articles');
    renderArticleList(results);
    
    const totalPages = data.page_count || 1;
    setStatus(`Page ${page} of ${totalPages} — ${data.total_results || results.length} total articles`);
  } catch (e) {
    console.error('[SEARCH ERROR]', e);
    setStatus(`Error: ${e.message}`);
  }
}

/**
 * Render the list of articles
 */
function renderArticleList(items) {
  els.articles.innerHTML = '';
  
  if (items.length === 0) {
    els.articles.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No articles found. Try different search terms.</p>';
    return;
  }
  
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    // Thumbnail
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = item.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect fill="%23333" width="120" height="80"/><text x="60" y="45" fill="%23666" text-anchor="middle" font-size="12">No Image</text></svg>';
    img.alt = item.title || '';
    
    // Info container
    const info = document.createElement('div');
    info.className = 'info';
    
    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = item.title || 'Untitled';
    
    const meta = document.createElement('p');
    meta.className = 'meta';
    const datePart = formatDate(item.date);
    const branchPart = item.branch || '';
    meta.textContent = [datePart, branchPart].filter(Boolean).join(' • ');
    
    info.appendChild(title);
    info.appendChild(meta);
    
    card.appendChild(img);
    card.appendChild(info);
    
    card.addEventListener('click', () => onSelectArticle(item, card));
    els.articles.appendChild(card);
  });
}

/**
 * Handle article selection - fetch full details and show preview
 */
async function onSelectArticle(item, card) {
  console.log('[SELECT]', item.id, item.title);
  
  // Visual feedback
  document.querySelectorAll('.article-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  
  setStatus('Fetching full article…');
  
  try {
    const assetUrl = `${API_BASE_ASSET}?id=${encodeURIComponent(item.id)}&api_key=${API_KEY}`;
    console.log('[ASSET URL]', assetUrl);
    const res = await fetch(assetUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Asset API failed: ${res.status}`);
    const data = await res.json();
    console.log('[ARTICLE DATA]', data);
    
    const article = data.results;
    if (!article) throw new Error('No article data returned');
    
    showPreviewDialog(article);
    setStatus('Article loaded - review and copy to clipboard');
  } catch (err) {
    console.error('[FETCH ERROR]', err);
    setStatus(`❌ Failed to load article: ${err.message}`);
  }
}

/**
 * Show preview dialog with article content
 */
function showPreviewDialog(article) {
  const overlay = document.createElement('div');
  overlay.className = 'preview-dialog-overlay';
  
  // Build preview content
  const bodyPreview = article.body 
    ? article.body.replace(/<[^>]*>/g, ' ').substring(0, 500) + '...'
    : 'No body content';
  
  overlay.innerHTML = `
    <div class="preview-dialog">
      <div class="preview-dialog-header">
        <h3>📄 Article Preview</h3>
        <button class="preview-dialog-close" aria-label="Close">×</button>
      </div>
      <div class="preview-dialog-body">
        <div class="preview-section">
          <div class="preview-section-label">Title</div>
          <p class="preview-title">${escapeHtml(article.title || 'Untitled')}</p>
        </div>
        
        <div class="preview-section">
          <div class="preview-section-label">Metadata</div>
          <div class="preview-meta">
            <strong>Date:</strong> ${formatDate(article.date)}<br>
            <strong>Branch:</strong> ${article.branch || 'N/A'}<br>
            <strong>Author:</strong> ${article.credit || 'N/A'}<br>
            <strong>Unit:</strong> ${article.unit_name || 'N/A'}
          </div>
        </div>
        
        ${article.image ? `
        <div class="preview-section">
          <div class="preview-section-label">Featured Image</div>
          <img class="preview-image" src="${article.image}" alt="${escapeHtml(article.title || '')}">
        </div>
        ` : ''}
        
        <div class="preview-section">
          <div class="preview-section-label">Body Preview</div>
          <div class="preview-body">${escapeHtml(bodyPreview)}</div>
        </div>
        
        <div class="preview-section">
          <div class="preview-section-label">Metadata Block (will be added)</div>
          <div class="preview-metadata">
            <table>
              <tr><td>Title</td><td>${escapeHtml(article.title || '')}</td></tr>
              <tr><td>Description</td><td>${escapeHtml((article.description || article.short_description || '').substring(0, 100))}...</td></tr>
              <tr><td>Release Date</td><td>${formatDateForMeta(article.date)}</td></tr>
              <tr><td>Author</td><td>${escapeHtml(article.credit || '')}</td></tr>
              <tr><td>Branch</td><td>${article.branch || ''}</td></tr>
              <tr><td>Category</td><td>news</td></tr>
              <tr><td>Template</td><td>article</td></tr>
            </table>
          </div>
        </div>
      </div>
      <div class="preview-dialog-footer">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-copy">📋 Copy Article to Clipboard</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Close handlers
  const closeDialog = () => overlay.remove();
  overlay.querySelector('.preview-dialog-close').addEventListener('click', closeDialog);
  overlay.querySelector('.btn-cancel').addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
  
  // Escape to close
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  // Copy button
  overlay.querySelector('.btn-copy').addEventListener('click', async () => {
    await copyArticleToClipboard(article, overlay);
  });
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/**
 * Format keywords/tags from various formats DVIDS might return
 */
function formatKeywords(keywords) {
  if (!keywords) return '';
  if (Array.isArray(keywords)) return keywords.join(', ');
  if (typeof keywords === 'string') return keywords;
  if (typeof keywords === 'object') {
    // Handle object with values
    return Object.values(keywords).join(', ');
  }
  return String(keywords);
}

/**
 * Generate the HTML content for clipboard (Word-compatible)
 */
function generateArticleHtml(article) {
  // Clean up body content - DVIDS returns HTML
  let bodyHtml = article.body || '';
  
  // Build the full article HTML structure for Word
  // This structure matches what EDS expects when imported
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(article.title || 'DVIDS Article')}</title>
</head>
<body>
  <!-- Hero Image -->
  ${article.image ? `<p><img src="${article.image}" alt="${escapeHtml(article.title || '')}"></p>` : ''}
  
  <!-- Article Body -->
  ${bodyHtml}
  
  <hr>
  
  <!-- Metadata Block - This becomes the metadata table in EDS -->
  <table>
    <tbody>
      <tr>
        <td colspan="2"><strong>Metadata</strong></td>
      </tr>
      <tr>
        <td>Title</td>
        <td>${escapeHtml(article.title || '')}</td>
      </tr>
      <tr>
        <td>Description</td>
        <td>${escapeHtml(article.description || article.short_description || '')}</td>
      </tr>
      <tr>
        <td>Image</td>
        <td>${article.image ? `<img src="${article.image}" alt="" width="200">` : ''}</td>
      </tr>
      <tr>
        <td>Release Date</td>
        <td>${formatDateForMeta(article.date)}</td>
      </tr>
      <tr>
        <td>Dateline</td>
        <td>${escapeHtml(article.location || '')}</td>
      </tr>
      <tr>
        <td>Author</td>
        <td>${escapeHtml(article.credit || '')}</td>
      </tr>
      <tr>
        <td>Tags</td>
        <td>${formatKeywords(article.keywords)}</td>
      </tr>
      <tr>
        <td>Branch</td>
        <td>${article.branch || ''}</td>
      </tr>
      <tr>
        <td>Category</td>
        <td>news</td>
      </tr>
      <tr>
        <td>Feature</td>
        <td></td>
      </tr>
      <tr>
        <td>template</td>
        <td>article</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;
  
  return html;
}

/**
 * Copy article to clipboard in HTML format
 */
async function copyArticleToClipboard(article, overlay) {
  const copyBtn = overlay.querySelector('.btn-copy');
  copyBtn.disabled = true;
  copyBtn.textContent = 'Copying…';
  
  try {
    const html = generateArticleHtml(article);
    console.log('[GENERATED HTML]', html.substring(0, 500) + '...');
    
    // Copy as both HTML and plain text for maximum compatibility
    const plainText = `${article.title}\n\n${(article.body || '').replace(/<[^>]*>/g, '')}\n\n---\nSource: DVIDS (${article.url || ''})`;
    
    // Use ClipboardItem for HTML content
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      }),
    ]);
    
    console.log('[CLIPBOARD SUCCESS]');
    copyBtn.textContent = '✅ Copied!';
    setStatus('✅ Article copied to clipboard! Paste into a blank Word document.');
    
    // Close after short delay
    setTimeout(() => {
      overlay.remove();
      
      // Reset search
      els.q.value = '';
      els.branch.value = '';
      els.sort.value = 'date';
      els.sortdir.value = 'desc';
      els.articles.innerHTML = '';
      page = 1;
      setStatus('Article copied! Open a blank Word document and paste (Ctrl+V / Cmd+V)');
      
      // Close the Sidekick palette
      try {
        chrome.runtime.sendMessage('igkmdomcgoebiipaifhmpfjhbjccggml', {
          id: 'dvids-articles',
          action: 'closePalette',
        });
      } catch (e) {
        console.log('[CLOSE PALETTE] Not in Sidekick context');
      }
    }, 1000);
    
  } catch (err) {
    console.error('[CLIPBOARD ERROR]', err);
    copyBtn.disabled = false;
    copyBtn.textContent = '📋 Copy Article to Clipboard';
    setStatus(`❌ Copy failed: ${err.message}`);
  }
}

// Wire up UI events
els.search.addEventListener('click', () => search(1));
els.next.addEventListener('click', () => search(page + 1));
els.prev.addEventListener('click', () => search(Math.max(1, page - 1)));
els.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(1); });

// Initial focus
setTimeout(() => {
  els.q.focus();
  window.focus();
}, 50);

