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
 * Format a tag for display (replace hyphens with spaces)
 * @param {string} tag - Raw tag value
 * @returns {string} Formatted tag
 */
function formatTagForDisplay(tag) {
  return tag.replace(/-/g, ' ');
}

/**
 * Format a tag for dropdown (title case, replace hyphens with spaces)
 * @param {string} tag - Raw tag value
 * @returns {string} Formatted tag in title case
 */
function formatTagTitleCase(tag) {
  return tag
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
    limit: 0, // 0 means no limit
    sortBy: 'date',
    pagination: 0, // 0 means no pagination
    facets: false, // Enable tag facet filter
    search: false, // Enable keyword search
  };
  const contentRows = [];
  const configKeys = ['source', 'limit', 'category', 'tag', 'filter', 'sortby', 'pagination', 'facets', 'search'];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (configKeys.includes(key)) {
        if (key === 'limit') {
          config.limit = parseInt(value, 10) || 0;
        } else if (key === 'pagination') {
          config.pagination = parseInt(value, 10) || 0;
        } else if (key === 'facets') {
          config.facets = value.toLowerCase() === 'true';
        } else if (key === 'search') {
          config.search = value.toLowerCase() === 'true';
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
      tagLi.textContent = formatTagForDisplay(tag);
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

/**
 * Extract unique tags from all items
 * @param {Array} items - Collection items
 * @returns {Array<string>} Sorted unique tags
 */
function extractUniqueTags(items) {
  const tagSet = new Set();

  items.forEach((item) => {
    const tags = parseTags(item.tags);
    tags.forEach((tag) => tagSet.add(tag));
  });

  return [...tagSet].sort((a, b) => a.localeCompare(b));
}

/**
 * Build filter bar with facet dropdown and search field
 * @param {Object} filterOptions - Filter configuration
 * @returns {HTMLElement}
 */
function buildFilterBar(filterOptions) {
  const {
    tags = [],
    selectedTag = '',
    searchQuery = '',
    showFacets = false,
    showSearch = false,
    onFilterChange,
    onSearchChange,
  } = filterOptions;

  const filterContainer = document.createElement('div');
  filterContainer.className = 'collection-filter';

  // Left side: Facet dropdown
  if (showFacets && tags.length > 0) {
    const facetGroup = document.createElement('div');
    facetGroup.className = 'collection-filter__facet';

    const label = document.createElement('label');
    label.className = 'collection-filter__label';
    label.setAttribute('for', 'collection-tag-filter');
    label.textContent = 'Filter by topic:';

    const select = document.createElement('select');
    select.className = 'collection-filter__select';
    select.id = 'collection-tag-filter';

    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    if (!selectedTag) allOption.selected = true;
    select.appendChild(allOption);

    // Add tag options
    tags.forEach((tag) => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = formatTagTitleCase(tag);
      if (tag === selectedTag) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      onFilterChange(e.target.value);
    });

    facetGroup.appendChild(label);
    facetGroup.appendChild(select);
    filterContainer.appendChild(facetGroup);
  }

  // Right side: Search field
  if (showSearch) {
    const searchGroup = document.createElement('div');
    searchGroup.className = 'collection-filter__search';

    const searchLabel = document.createElement('label');
    searchLabel.className = 'collection-filter__label';
    searchLabel.setAttribute('for', 'collection-search');
    searchLabel.textContent = 'Search:';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'collection-filter__input';
    searchInput.id = 'collection-search';
    searchInput.placeholder = 'Enter keywords...';
    searchInput.value = searchQuery;

    // Debounce search input
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onSearchChange(e.target.value);
      }, 300);
    });

    // Allow immediate search on Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(debounceTimer);
        onSearchChange(e.target.value);
      }
    });

    searchGroup.appendChild(searchLabel);
    searchGroup.appendChild(searchInput);
    filterContainer.appendChild(searchGroup);
  }

  return filterContainer;
}

/**
 * Filter items by tag
 * @param {Array} items - All items
 * @param {string} tag - Tag to filter by (empty = no filter)
 * @returns {Array} Filtered items
 */
function filterItemsByTag(items, tag) {
  if (!tag) return items;

  return items.filter((item) => {
    const itemTags = parseTags(item.tags);
    return itemTags.includes(tag);
  });
}

/**
 * Filter items by search query
 * @param {Array} items - All items
 * @param {string} query - Search query (empty = no filter)
 * @returns {Array} Filtered items
 */
function filterItemsBySearch(items, query) {
  if (!query || !query.trim()) return items;

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return items.filter((item) => {
    // Combine searchable text fields
    const searchableText = [
      item.title || '',
      item.description || '',
      item.author || '',
      ...(parseTags(item.tags).map((tag) => formatTagForDisplay(tag))),
    ].join(' ').toLowerCase();

    // All search terms must match
    return searchTerms.every((term) => searchableText.includes(term));
  });
}

/**
 * Create a single page item
 */
function createPageItem(pageNum, currentPage, onPageChange) {
  const li = document.createElement('li');
  li.className = 'usa-pagination__item usa-pagination__page-no';

  const link = document.createElement('a');
  link.href = '#';
  link.className = 'usa-pagination__button';
  link.textContent = pageNum;
  link.setAttribute('aria-label', `Page ${pageNum}`);

  if (pageNum === currentPage) {
    link.classList.add('usa-current');
    link.setAttribute('aria-current', 'page');
  }

  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (pageNum !== currentPage) {
      onPageChange(pageNum);
    }
  });

  li.appendChild(link);
  return li;
}

/**
 * Build pagination controls
 * @param {number} currentPage - Current page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @returns {HTMLElement}
 */
function buildPagination(currentPage, totalPages, onPageChange) {
  const nav = document.createElement('nav');
  nav.className = 'usa-pagination';
  nav.setAttribute('aria-label', 'Pagination');

  const ul = document.createElement('ul');
  ul.className = 'usa-pagination__list';

  // Previous button
  const prevLi = document.createElement('li');
  prevLi.className = 'usa-pagination__item usa-pagination__arrow';
  if (currentPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.className = 'usa-pagination__link usa-pagination__previous-page';
    prevLink.setAttribute('aria-label', 'Previous page');
    prevLink.innerHTML = '<span class="usa-pagination__link-text">Previous</span>';
    prevLink.addEventListener('click', (e) => {
      e.preventDefault();
      onPageChange(currentPage - 1);
    });
    prevLi.appendChild(prevLink);
  }
  ul.appendChild(prevLi);

  // Page numbers
  const maxVisiblePages = 7;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisiblePages) {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    startPage = Math.max(1, currentPage - halfVisible);
    endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }

  // First page and ellipsis
  if (startPage > 1) {
    ul.appendChild(createPageItem(1, currentPage, onPageChange));
    if (startPage > 2) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'usa-pagination__item usa-pagination__overflow';
      ellipsis.setAttribute('aria-hidden', 'true');
      ellipsis.innerHTML = '<span>…</span>';
      ul.appendChild(ellipsis);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i += 1) {
    ul.appendChild(createPageItem(i, currentPage, onPageChange));
  }

  // Last page and ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'usa-pagination__item usa-pagination__overflow';
      ellipsis.setAttribute('aria-hidden', 'true');
      ellipsis.innerHTML = '<span>…</span>';
      ul.appendChild(ellipsis);
    }
    ul.appendChild(createPageItem(totalPages, currentPage, onPageChange));
  }

  // Next button
  const nextLi = document.createElement('li');
  nextLi.className = 'usa-pagination__item usa-pagination__arrow';
  if (currentPage < totalPages) {
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.className = 'usa-pagination__link usa-pagination__next-page';
    nextLink.setAttribute('aria-label', 'Next page');
    nextLink.innerHTML = '<span class="usa-pagination__link-text">Next</span>';
    nextLink.addEventListener('click', (e) => {
      e.preventDefault();
      onPageChange(currentPage + 1);
    });
    nextLi.appendChild(nextLink);
  }
  ul.appendChild(nextLi);

  nav.appendChild(ul);
  return nav;
}

/**
 * Render collection with pagination, facet filter, and search support
 */
function renderCollection(block, allItems, options, renderConfig) {
  const {
    showThumbnail,
    showCalendar,
    headingsOnly,
    condensed,
  } = options;

  const {
    itemsPerPage,
    currentPage = 1,
    showFacets = false,
    showSearch = false,
    selectedTag = '',
    searchQuery = '',
    allTags = [],
  } = renderConfig;

  // Filter items by selected tag and search query
  let filteredItems = filterItemsByTag(allItems, selectedTag);
  filteredItems = filterItemsBySearch(filteredItems, searchQuery);

  // Calculate pagination
  const totalItems = filteredItems.length;
  const totalPages = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startIndex = itemsPerPage > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = itemsPerPage > 0 ? startIndex + itemsPerPage : totalItems;
  const pageItems = filteredItems.slice(startIndex, endIndex);

  // Save focus state before clearing
  const searchInput = block.querySelector('#collection-search');
  const wasSearchFocused = searchInput && document.activeElement === searchInput;
  const cursorPosition = wasSearchFocused ? searchInput.selectionStart : 0;

  // Clear block
  block.innerHTML = '';

  // Add filter bar (facets and/or search)
  const showFilterBar = showFacets || showSearch;
  if (showFilterBar) {
    const filterBar = buildFilterBar({
      tags: allTags,
      selectedTag,
      searchQuery,
      showFacets: showFacets && allTags.length > 0,
      showSearch,
      onFilterChange: (newTag) => {
        renderCollection(block, allItems, options, {
          itemsPerPage,
          currentPage: 1, // Reset to page 1 when filter changes
          showFacets,
          showSearch,
          selectedTag: newTag,
          searchQuery,
          allTags,
        });
      },
      onSearchChange: (newQuery) => {
        renderCollection(block, allItems, options, {
          itemsPerPage,
          currentPage: 1, // Reset to page 1 when search changes
          showFacets,
          showSearch,
          selectedTag,
          searchQuery: newQuery,
          allTags,
        });
      },
    });
    block.appendChild(filterBar);

    // Restore focus to search input if it was focused before
    if (wasSearchFocused) {
      const newSearchInput = block.querySelector('#collection-search');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }

  if (pageItems.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'usa-collection__empty';
    if (searchQuery && selectedTag) {
      emptyMsg.textContent = `No items found matching "${searchQuery}" with tag "${formatTagTitleCase(selectedTag)}".`;
    } else if (searchQuery) {
      emptyMsg.textContent = `No items found matching "${searchQuery}".`;
    } else if (selectedTag) {
      emptyMsg.textContent = `No items found with tag "${formatTagTitleCase(selectedTag)}".`;
    } else {
      emptyMsg.textContent = 'No items available.';
    }
    block.appendChild(emptyMsg);
    return;
  }

  // Build collection list
  const ul = document.createElement('ul');
  ul.className = 'usa-collection';
  if (condensed) ul.classList.add('usa-collection--condensed');

  pageItems.forEach((item) => {
    const li = buildCollectionItem(item, {
      showThumbnail,
      showCalendar,
      headingsOnly,
    });
    ul.appendChild(li);
  });

  block.appendChild(ul);

  // Add pagination if needed
  if (itemsPerPage > 0 && totalPages > 1) {
    const pagination = buildPagination(currentPage, totalPages, (newPage) => {
      renderCollection(block, allItems, options, {
        itemsPerPage,
        currentPage: newPage,
        showFacets,
        showSearch,
        selectedTag,
        searchQuery,
        allTags,
      });
      // Scroll to top of block
      block.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    block.appendChild(pagination);
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

  // Clear block and render collection
  block.innerHTML = '';

  if (items.length === 0) {
    block.innerHTML = '<p class="usa-collection__empty">No items available.</p>';
    return;
  }

  // Extract unique tags for facet filter
  const allTags = config.facets ? extractUniqueTags(items) : [];

  // Render with pagination and facet support
  renderCollection(block, items, {
    showThumbnail,
    showCalendar,
    headingsOnly,
    condensed,
  }, {
    itemsPerPage: config.pagination,
    currentPage: 1,
    showFacets: config.facets,
    showSearch: config.search,
    selectedTag: '',
    allTags,
  });
}
