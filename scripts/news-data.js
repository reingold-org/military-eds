/**
 * Resolve a relative URL to an absolute URL using a base origin
 * @param {string} url - URL to resolve (may be relative or absolute)
 * @param {string} baseOrigin - Origin to use for relative URLs (e.g., 'https://other-site.mil')
 * @returns {string} Absolute URL
 */
function resolveUrl(url, baseOrigin) {
  if (!url) return url;
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative URL - prefix with base origin
  return `${baseOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Fetch articles from a single source
 * @param {string} source - URL to fetch from
 * @returns {Promise<Array>} Array of articles or empty array on error
 */
async function fetchFromSource(source) {
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${source}: ${response.status}`);
    }
    const data = await response.json();
    let articles = data.data || [];

    // Check if source is external (different origin)
    const sourceUrl = new URL(source, window.location.origin);
    const isExternal = sourceUrl.origin !== window.location.origin;

    // Resolve relative URLs for external sources
    if (isExternal) {
      articles = articles.map((article) => ({
        ...article,
        path: resolveUrl(article.path, sourceUrl.origin),
        image: resolveUrl(article.image, sourceUrl.origin),
      }));
    }

    return articles;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching from ${source}:`, error);
    return [];
  }
}

/**
 * Shared utility for fetching and filtering news articles
 * @param {Object} filterOptions - Options for filtering articles
 * @param {boolean} filterOptions.featured - Filter for featured articles only
 * @param {number} filterOptions.limit - Limit the number of articles returned
 * @param {string} filterOptions.sortBy - Sort field (e.g., 'releaseDate')
 * @param {string} filterOptions.category - Filter by category
 * @param {string} filterOptions.tag - Filter by tag
 * @param {Array<string>} filterOptions.excludePaths - Array of article paths to exclude
 * @param {Array<string>} filterOptions.sources - Array of source URLs to fetch from
 * @returns {Promise<Array>} Array of article objects
 */
export async function fetchNewsArticles(filterOptions = {}) {
  try {
    // Determine sources to fetch from
    const sources = filterOptions.sources && filterOptions.sources.length > 0
      ? filterOptions.sources
      : ['/news/query-index.json'];

    // Fetch from all sources in parallel
    const results = await Promise.all(sources.map((source) => fetchFromSource(source)));

    // Merge all results into single array
    let articles = results.flat();

    // Apply filters
    if (filterOptions.featured) {
      articles = articles.filter((article) => article.feature === 'true');
    }

    if (filterOptions.category) {
      articles = articles.filter((article) => article.category === filterOptions.category);
    }

    if (filterOptions.tag) {
      articles = articles.filter(
        (article) => article.tags && article.tags.includes(filterOptions.tag),
      );
    }

    // Exclude specific article paths (for deduplication)
    if (filterOptions.excludePaths && filterOptions.excludePaths.length > 0) {
      articles = articles.filter((article) => !filterOptions.excludePaths.includes(article.path));
    }

    // Apply sorting
    if (filterOptions.sortBy === 'releaseDate') {
      articles = articles.sort((a, b) => parseInt(b.releaseDate, 10) - parseInt(a.releaseDate, 10));
    }

    // Apply limit
    if (filterOptions.limit && filterOptions.limit > 0) {
      articles = articles.slice(0, filterOptions.limit);
    }

    return articles;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching news articles:', error);
    return [];
  }
}

/**
 * Build an optimized picture element for an article image
 * @param {string} imageSrc - Source URL of the image
 * @param {string} alt - Alt text for the image
 * @param {boolean} eager - Whether to load eagerly (default: false)
 * @returns {string} HTML string for picture element
 */
export function buildArticleImage(imageSrc, alt, eager = false) {
  const loading = eager ? 'eager' : 'lazy';
  return `
    <picture>
      <source type="image/webp" srcset="${imageSrc}?format=webply&optimize=medium" media="(min-width: 600px)">
      <source type="image/webp" srcset="${imageSrc}?format=webply&optimize=medium">
      <source type="image/jpeg" srcset="${imageSrc}?format=pjpg&optimize=medium" media="(min-width: 600px)">
      <img loading="${loading}" alt="${alt}" src="${imageSrc}?format=pjpg&optimize=medium" width="750" height="375">
    </picture>
  `;
}

/**
 * Format a date for display
 * @param {string|number} releaseDate - Release date timestamp or string
 * @returns {string} Formatted date string
 */
export function formatArticleDate(releaseDate) {
  const date = new Date(parseInt(releaseDate, 10));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get article paths that are already displayed on the page
 * Checks for dynamic-hero and any other dynamic blocks that have been rendered
 * @param {HTMLElement} currentBlock - The current block element (to exclude from search)
 * @returns {Array<string>} Array of article paths already displayed
 */
export function getDisplayedArticlePaths(currentBlock) {
  const displayedPaths = [];

  // Check for dynamic-hero blocks
  const heroBlocks = document.querySelectorAll('.dynamic-hero');
  heroBlocks.forEach((hero) => {
    // Get the link from the hero block
    const link = hero.querySelector('a[href*="/news/"]');
    if (link) {
      displayedPaths.push(link.getAttribute('href'));
    }
  });

  // Check for other dynamic blocks that have been rendered (excluding current block)
  const dynamicBlocks = document.querySelectorAll('.dynamic-carousel, .dynamic-cards');
  dynamicBlocks.forEach((block) => {
    // Skip the current block being decorated
    if (block === currentBlock) return;

    // Get all article links
    const links = block.querySelectorAll('a[href*="/news/"]');
    links.forEach((link) => {
      displayedPaths.push(link.getAttribute('href'));
    });
  });

  // Remove duplicates
  return [...new Set(displayedPaths)];
}
