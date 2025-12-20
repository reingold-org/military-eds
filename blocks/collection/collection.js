/*
 * Collection Block
 * USWDS Collection component for Edge Delivery Services
 * https://designsystem.digital.gov/components/collection/
 *
 * Supports two modes:
 * 1. Static: Author provides fixed list of links directly in the block
 * 2. Dynamic: Author provides a query source URL to fetch content
 */

import ffetch from '../../scripts/ffetch.js';

/**
 * Format a date for display
 * @param {string|number} timestamp - Unix timestamp or date string
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for calendar display (MMM DD format)
 * @param {string|number} timestamp - Unix timestamp or date string
 * @returns {{ month: string, day: string }}
 */
function formatCalendarDate(timestamp) {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp);
  if (Number.isNaN(date.getTime())) return { month: '', day: '' };
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString(),
  };
}

/**
 * Parse tags from a comma-separated string, JSON array string, or array
 * @param {string|Array} tags - Tags as string or array
 * @returns {Array<string>}
 */
function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;

  // Handle JSON array string like '["tag1", "tag2"]'
  const trimmed = tags.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch (e) {
      // Not valid JSON, fall through to manual parsing
      // Remove brackets and split
      const withoutBrackets = trimmed.slice(1, -1);
      return withoutBrackets.split(',').map((tag) => tag.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }

  // Handle comma-separated string
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
}

/**
 * Read configuration from block rows (key-value pairs)
 * @param {HTMLElement} block - The block element
 * @returns {{ config: Object, contentRows: Array }}
 */
function parseBlockContent(block) {
  const config = {
    limit: 6,
    sortBy: 'date',
  };
  const contentRows = [];
  const configKeys = ['source', 'limit', 'category', 'tag', 'filter', 'sortby'];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (configKeys.includes(key)) {
        if (key === 'limit') {
          config.limit = parseInt(value, 10) || 6;
        } else if (key === 'sortby') {
          config.sortBy = value;
        } else if (key === 'source') {
          // Check if it's a link or plain text
          const link = cells[1].querySelector('a');
          config.source = link ? link.href : value;
        } else {
          config[key] = value;
        }
      } else {
        // Not a config row, treat as content
        contentRows.push(row);
      }
    } else {
      // Not a key-value pair, treat as content
      contentRows.push(row);
    }
  });

  return { config, contentRows };
}

/**
 * Parse a static content row into a collection item
 * @param {HTMLElement} row - The row element
 * @returns {Object} Collection item data
 */
function parseStaticRow(row) {
  const item = {};

  // Look for link in first cell (title/heading)
  const link = row.querySelector('a');
  if (link) {
    item.path = link.href;
    item.title = link.textContent.trim();
  }

  // Look for image
  const img = row.querySelector('img');
  if (img) {
    item.image = img.src;
    item.imageAlt = img.alt || item.title || '';
  }

  // Look for description (paragraph that's not the link)
  const paragraphs = row.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (!p.querySelector('a') && !p.querySelector('picture')) {
      const text = p.textContent.trim();
      if (text && text !== item.title) {
        item.description = text;
      }
    }
  });

  // Look for metadata (em, strong, or specific patterns)
  const meta = row.querySelector('em');
  if (meta) {
    item.author = meta.textContent.trim();
  }

  return item;
}

/**
 * Build a collection item element
 * @param {Object} item - The item data
 * @param {Object} options - Display options
 * @returns {HTMLElement}
 */
function buildCollectionItem(item, options = {}) {
  const {
    showThumbnail = false,
    showCalendar = false,
    headingsOnly = false,
  } = options;

  const li = document.createElement('li');
  li.className = 'usa-collection__item';

  // Calendar display
  if (showCalendar && item.date) {
    const calDate = formatCalendarDate(item.date);
    const calendarDiv = document.createElement('div');
    calendarDiv.className = 'usa-collection__calendar-date';
    calendarDiv.innerHTML = `
      <time datetime="${new Date(parseInt(item.date, 10)).toISOString().split('T')[0]}">
        <span class="usa-collection__calendar-date-month">${calDate.month}</span>
        <span class="usa-collection__calendar-date-day">${calDate.day}</span>
      </time>
    `;
    li.appendChild(calendarDiv);
  }

  // Thumbnail image
  if (showThumbnail && item.image) {
    const imgDiv = document.createElement('div');
    imgDiv.className = 'usa-collection__img';
    imgDiv.innerHTML = `<img src="${item.image}" alt="${item.imageAlt || item.title || ''}" loading="lazy">`;
    li.appendChild(imgDiv);
  }

  // Body
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'usa-collection__body';

  // Heading with link
  const heading = document.createElement('h4');
  heading.className = 'usa-collection__heading';
  if (item.path) {
    const link = document.createElement('a');
    link.className = 'usa-link';
    link.href = item.path;
    link.textContent = item.title || 'Untitled';

    // Add external link indicator if needed
    if (item.path.startsWith('http') && !item.path.includes(window.location.hostname)) {
      link.classList.add('usa-link--external');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    heading.appendChild(link);
  } else {
    heading.textContent = item.title || 'Untitled';
  }
  bodyDiv.appendChild(heading);

  // Description (skip for headings-only variant)
  if (!headingsOnly && item.description) {
    const desc = document.createElement('p');
    desc.className = 'usa-collection__description';
    desc.textContent = item.description;
    bodyDiv.appendChild(desc);
  }

  // Meta information (skip for headings-only and calendar variants)
  if (!headingsOnly && !showCalendar) {
    const metaList = document.createElement('ul');
    metaList.className = 'usa-collection__meta';
    metaList.setAttribute('aria-label', 'More information');

    // Author
    if (item.author) {
      const authorLi = document.createElement('li');
      authorLi.className = 'usa-collection__meta-item';
      authorLi.innerHTML = `<span>By ${item.author}</span>`;
      metaList.appendChild(authorLi);
    }

    // Date
    if (item.date) {
      const dateLi = document.createElement('li');
      dateLi.className = 'usa-collection__meta-item';
      const formattedDate = formatDate(item.date);
      dateLi.innerHTML = `<time datetime="${new Date(parseInt(item.date, 10)).toISOString().split('T')[0]}">${formattedDate}</time>`;
      metaList.appendChild(dateLi);
    }

    // Tags
    const tags = parseTags(item.tags);
    tags.forEach((tag) => {
      const tagLi = document.createElement('li');
      tagLi.className = 'usa-collection__meta-item usa-tag';
      tagLi.textContent = tag;
      metaList.appendChild(tagLi);
    });

    // Source (for external links or headings-only with source)
    if (headingsOnly && item.source) {
      const sourceLi = document.createElement('li');
      sourceLi.className = 'usa-collection__meta-item';
      sourceLi.textContent = item.source;
      metaList.appendChild(sourceLi);
    }

    if (metaList.children.length > 0) {
      bodyDiv.appendChild(metaList);
    }
  }

  li.appendChild(bodyDiv);
  return li;
}

/**
 * Fetch items from a query source
 * @param {string} source - The query index URL
 * @param {Object} config - Filter configuration
 * @returns {Promise<Array>}
 */
async function fetchDynamicItems(source, config) {
  try {
    let items = await ffetch(source).all();

    // Apply filters
    if (config.category) {
      items = items.filter((item) => item.category === config.category);
    }

    if (config.tag) {
      items = items.filter((item) => item.tags && item.tags.includes(config.tag));
    }

    if (config.filter) {
      // Generic filter: field:value format
      const [field, value] = config.filter.split(':').map((s) => s.trim());
      if (field && value) {
        items = items.filter((item) => item[field] === value);
      }
    }

    // Sort
    if (config.sortBy === 'date' || config.sortBy === 'releaseDate') {
      items.sort((a, b) => {
        const dateA = parseInt(a.releaseDate || a.date || a.lastModified || 0, 10);
        const dateB = parseInt(b.releaseDate || b.date || b.lastModified || 0, 10);
        return dateB - dateA;
      });
    } else if (config.sortBy === 'title') {
      items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    // Limit
    if (config.limit > 0) {
      items = items.slice(0, config.limit);
    }

    // Normalize item structure
    return items.map((item) => ({
      path: item.path,
      title: item.title,
      description: item.description,
      image: item.image,
      imageAlt: item.imageAlt || item.title,
      date: item.releaseDate || item.date || item.lastModified,
      author: item.author,
      tags: item.tags,
      source: item.source,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching collection items:', error);
    return [];
  }
}

export default async function decorate(block) {
  // Determine variant from block classes
  const showThumbnail = block.classList.contains('thumbnail') || block.classList.contains('media');
  const showCalendar = block.classList.contains('calendar');
  const headingsOnly = block.classList.contains('headings-only');
  const condensed = block.classList.contains('condensed');

  // Parse block content
  const { config, contentRows } = parseBlockContent(block);

  let items = [];

  if (config.source) {
    // Dynamic mode: fetch from query index
    items = await fetchDynamicItems(config.source, config);
  } else if (contentRows.length > 0) {
    // Static mode: parse content rows
    items = contentRows.map(parseStaticRow).filter((item) => item.title || item.path);
  }

  // Clear block and build collection
  block.innerHTML = '';

  if (items.length === 0) {
    block.innerHTML = '<p class="usa-collection__empty">No items available.</p>';
    return;
  }

  // Build collection list
  const ul = document.createElement('ul');
  ul.className = 'usa-collection';
  if (condensed) ul.classList.add('usa-collection--condensed');

  items.forEach((item) => {
    const li = buildCollectionItem(item, {
      showThumbnail,
      showCalendar,
      headingsOnly,
    });
    ul.appendChild(li);
  });

  block.appendChild(ul);
}
