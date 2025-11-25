import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { fetchNewsArticles, buildArticleImage, getDisplayedArticlePaths } from '../../scripts/news-data.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.dynamic-carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createArticleSlide(article, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  const imageDiv = document.createElement('div');
  imageDiv.classList.add('carousel-slide-image');
  imageDiv.innerHTML = buildArticleImage(article.image, article.title);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('carousel-slide-content');

  const title = document.createElement('h3');
  title.textContent = article.title;
  title.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}-title`);

  const description = document.createElement('p');
  description.textContent = article.description;

  const buttonContainer = document.createElement('p');
  buttonContainer.classList.add('button-container');

  if (article.path) {
    const link = document.createElement('a');
    link.href = article.path;
    link.textContent = 'Read More';
    link.classList.add('usa-button');
    buttonContainer.appendChild(link);
  }

  contentDiv.appendChild(title);
  contentDiv.appendChild(description);
  if (article.path) {
    contentDiv.appendChild(buttonContainer);
  }

  slide.appendChild(imageDiv);
  slide.appendChild(contentDiv);
  slide.setAttribute('aria-labelledby', title.getAttribute('id'));

  return slide;
}

let carouselId = 0;

/**
 * Reads configuration from block cells
 * Expected format:
 * | limit | 5 |
 * | featured | true |
 * | category | news |
 */
function readBlockConfig(block) {
  const config = {
    limit: 5,
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

export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);

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

  const isSingleSlide = articles.length < 2;
  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  articles.forEach((article, idx) => {
    const slide = createArticleSlide(article, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${articles.length}"></button>`;
      slideIndicators.append(indicator);
    }
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
