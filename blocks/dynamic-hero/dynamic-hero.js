import { fetchNewsArticles } from '../../scripts/news-data.js';

function buildHeroContent(article) {
  // Create the hero structure matching the hero block CSS
  const heroHTML = `
    <picture>
      <source type="image/webp" srcset="${article.image}&format=webply&optimize=medium" media="(min-width: 600px)">
      <source type="image/webp" srcset="${article.image}&format=webply&optimize=medium">
      <source type="image/jpeg" srcset="${article.image}&format=pjpg&optimize=medium" media="(min-width: 600px)">
      <img loading="eager" alt="${article.title}" src="${article.image}&format=pjpg&optimize=medium" width="2000" height="1000">
    </picture>
    <div class="dynamic-hero-content">
      <h1>${article.title}</h1>
      <p>${article.description}</p>
      ${article.path ? `<p class="button-container"><a href="${article.path}" class="usa-button">Read More</a></p>` : ''}
    </div>
  `;

  return heroHTML;
}

export default async function decorate(block) {
  // Fetch the most recent featured article using shared utility
  const articles = await fetchNewsArticles({
    featured: true,
    limit: 1,
    sortBy: 'releaseDate',
  });

  if (!articles || articles.length === 0) {
    block.innerHTML = '<p>No featured article available</p>';
    return;
  }

  // Build and inject the hero content
  block.innerHTML = buildHeroContent(articles[0]);
}
