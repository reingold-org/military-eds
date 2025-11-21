import { buildBlock, decorateBlock, getMetadata } from '../../scripts/aem.js';

/**
 * Converts a tag from lowercase-with-dashes to Title Case with spaces
 * @param {string} tag - tag in format "humanitarian-missions"
 * @returns {string} tag in format "Humanitarian Missions"
 */
function formatTagForDisplay(tag) {
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Collects all article:tag meta values from <head>
 * @returns {string[]} array of tag values
 */
function getArticleTags() {
  const metas = document.querySelectorAll('meta[property="article:tag"]');
  return Array.from(metas).map((meta) => meta.content).filter(Boolean);
}

/**
 * Decorates an article page into a two-column layout
 * @param {HTMLElement} main - the <main> element from the payload
 */
function decorateArticle(main) {
  if (!main) return;
  const primary = main.querySelector('div');
  const h1 = main.querySelector('h1');
  if (!h1) return;
  main.prepend(h1);

  const share = document.createElement('div');
  share.classList.add('section');
  share.append(buildBlock('social-share', ''));
  decorateBlock(share.querySelector('.social-share'));
  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = getMetadata('description') || '';
  primary.prepend(share, description);

  const image = primary.querySelector('p:has(picture)');
  image?.classList.add('article-hero-image');
  const firstParagraph = primary.querySelector('p:not(:has(picture), .description)');
  const dateline = document.createElement('span');
  dateline.className = 'dateline';
  const datelineText = getMetadata('dateline') || '';
  dateline.textContent = `${datelineText} —`;
  firstParagraph.prepend(dateline, ' ');
  const byline = document.createElement('p');
  byline.className = 'byline';
  const author = getMetadata('author') || 'Unknown Author';
  const publishDate = getMetadata('release-date') || '';
  byline.textContent = publishDate ? `By ${author} | ${publishDate}` : `By ${author}`;

  // Insert after image if it exists, otherwise after h1
  if (image) {
    image.after(byline, primary.children[3]);
  } else if (h1) {
    h1.after(byline, primary.children[3]);
  }

  // Create the <aside> element
  const aside = document.createElement('aside');
  aside.classList.add('article-aside');
  aside.innerHTML = '<h2>Related Articles</h2>';
  const section = document.createElement('div');
  section.className = 'section';
  section.append(buildBlock('related-articles', ''));
  decorateBlock(section.querySelector('.related-articles'));
  aside.append(section);

  main.appendChild(aside);
  main.classList.add('loaded');

  // --- Add tags list at the bottom of the primary content ---
  const tags = getArticleTags();
  if (tags.length > 0) {
    const tagSection = document.createElement('div');
    const ul = document.createElement('ul');
    ul.className = 'article-tags';
    tags.forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = formatTagForDisplay(tag);
      ul.appendChild(li);
    });
    tagSection.appendChild(ul);

    primary.appendChild(tagSection);
  }
}

export default decorateArticle;
