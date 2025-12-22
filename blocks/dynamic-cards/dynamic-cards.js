import { fetchNewsArticles, buildArticleImage, getDisplayedArticlePaths } from '../../scripts/news-data.js';

/**
 * Creates a standard article card (default variant)
 */
function createArticleCard(article) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.classList.add('cards-card-image');
  imageDiv.innerHTML = buildArticleImage(article.image, article.title);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('cards-card-body');

  const title = document.createElement('h3');
  title.textContent = article.title;

  const description = document.createElement('p');
  description.textContent = article.description;

  bodyDiv.appendChild(title);
  bodyDiv.appendChild(description);

  if (article.path) {
    const link = document.createElement('p');
    link.classList.add('button-container');
    const anchor = document.createElement('a');
    anchor.href = article.path;
    anchor.textContent = 'Read More';
    anchor.classList.add('button', 'primary');
    link.appendChild(anchor);
    bodyDiv.appendChild(link);
  }

  li.appendChild(imageDiv);
  li.appendChild(bodyDiv);

  return li;
}

/**
 * Creates an image card with background image and overlay content (image variant)
 * @param {Object} article - Article data
 * @param {string} size - Card size: 'large', 'medium', or 'small'
 */
function createImageCard(article, size = 'small') {
  const card = document.createElement('article');
  card.classList.add('tile', `tile-${size}`);

  // Background image container
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('tile-background');
  imageContainer.innerHTML = buildArticleImage(article.image, article.title, size === 'large');

  // Gradient overlay
  const overlay = document.createElement('div');
  overlay.classList.add('tile-overlay');

  // Content container
  const content = document.createElement('div');
  content.classList.add('tile-content');

  // Title
  const title = document.createElement('h3');
  title.classList.add('tile-title');
  title.textContent = article.title;
  content.appendChild(title);

  // Description (only for large and medium cards)
  if (size === 'large' || size === 'medium') {
    const description = document.createElement('p');
    description.classList.add('tile-description');
    description.textContent = article.description || '';
    content.appendChild(description);
  }

  // Read More button (USWDS styled)
  const linkContainer = document.createElement('div');
  linkContainer.classList.add('tile-link');
  const link = document.createElement('a');
  link.href = article.path;
  link.classList.add('usa-button');
  link.textContent = 'Read More';
  linkContainer.appendChild(link);
  content.appendChild(linkContainer);

  card.appendChild(imageContainer);
  card.appendChild(overlay);
  card.appendChild(content);

  // Make entire card clickable
  card.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') {
      window.location.href = article.path;
    }
  });

  return card;
}

/**
 * Determines card size based on position in grid
 * Layout pattern:
 * - Position 0: large (full width)
 * - Position 1-2: medium (half width each)
 * - Position 3+: small (third width each)
 */
function getCardSize(index) {
  if (index === 0) return 'large';
  if (index <= 2) return 'medium';
  return 'small';
}

/**
 * Reads configuration from block cells
 * Expected format:
 * | limit | 6 |
 * | featured | true |
 * | category | news |
 */
function readBlockConfig(block) {
  const config = {
    limit: 6,
    featured: false,
    sortBy: 'releaseDate',
  };

  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (key === 'limit') {
        config.limit = parseInt(value, 10);
      } else if (key === 'featured') {
        config.featured = value.toLowerCase() === 'true';
      } else if (key === 'category') {
        config.category = value;
      } else if (key === 'tag') {
        config.tag = value;
      }
    }
  });

  return config;
}

/**
 * Renders the default card layout
 */
function renderDefaultLayout(block, articles) {
  const ul = document.createElement('ul');

  articles.forEach((article) => {
    const card = createArticleCard(article);
    ul.appendChild(card);
  });

  block.appendChild(ul);
}

/**
 * Renders the image card layout (1-2-3 grid pattern)
 */
function renderImageLayout(block, articles) {
  const grid = document.createElement('div');
  grid.classList.add('tiles-grid');

  articles.forEach((article, index) => {
    const size = getCardSize(index);
    const card = createImageCard(article, size);
    grid.appendChild(card);
  });

  block.appendChild(grid);
}

export default async function decorate(block) {
  // Check for tiles variant
  const isTilesVariant = block.classList.contains('tiles');

  // Read configuration from block
  const config = readBlockConfig(block);

  // Get already displayed article paths to avoid duplication
  const excludePaths = getDisplayedArticlePaths(block);
  if (excludePaths.length > 0) {
    config.excludePaths = excludePaths;
  }

  // Clear the block
  block.innerHTML = '';

  // Fetch articles (will exclude already displayed articles)
  const articles = await fetchNewsArticles(config);

  if (!articles || articles.length === 0) {
    block.innerHTML = '<p>No articles available</p>';
    return;
  }

  // Render based on variant
  if (isTilesVariant) {
    renderImageLayout(block, articles);
  } else {
    renderDefaultLayout(block, articles);
  }
}
