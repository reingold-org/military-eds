import {
  buildBlock,
  getMetadata,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  toClassName,
  decorateBlock,
  loadBlock,
} from './aem.js';

import decorateArticle from '../templates/article/article.js';

/**
 * Decorates paragraphs with multiple links as button groups.
 * @param {Element} element container element
 */
function decorateButtonGroups(element) {
  element.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a');
    // Check if paragraph has multiple links and no images
    if (links.length > 1 && !p.querySelector('img')) {
      // Verify links are direct children or wrapped in strong/em
      const validLinks = [...links].filter((a) => {
        const parent = a.parentElement;
        return parent === p || ((parent.tagName === 'STRONG' || parent.tagName === 'EM') && parent.parentElement === p);
      });

      if (validLinks.length > 1) {
        p.classList.add('button-group');
        validLinks.forEach((a) => {
          a.title = a.title || a.textContent;
          const parent = a.parentElement;
          // Check if wrapped in strong (primary) or em (secondary)
          if (parent.tagName === 'STRONG') {
            a.className = 'button primary';
          } else if (parent.tagName === 'EM') {
            a.className = 'button secondary';
            // Remove em wrapper, move link to paragraph
            parent.replaceWith(a);
          } else {
            a.className = 'button';
          }
        });
      }
    }
  });
}

/**
 * Adds USWDS button class to decorated buttons for USWDS styling.
 * @param {Element} element container element
 */
function decorateUSWDSButtons(element) {
  element.querySelectorAll('a.button').forEach((button) => {
    button.classList.add('usa-button');
    // Add outline style for secondary buttons (italicized links)
    if (button.classList.contains('secondary')) {
      button.classList.add('usa-button--outline');
      // Remove em wrapper if present
      const parent = button.parentElement;
      if (parent && parent.tagName === 'EM') {
        parent.replaceWith(button);
      }
    }
  });
}

/**
 * Sa11y Accessibility Checker - Sidekick Toggle Plugin
 * Injects/removes Sa11y when the Accessibility button is clicked.
 * https://sa11y.netlify.app/
 */
const SA11Y_VERSION = '4';
const SA11Y_CSS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/css/sa11y.min.css`;
const SA11Y_LANG_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/lang/en.umd.js`;
const SA11Y_JS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/sa11y.umd.min.js`;

let sa11yActive = false;
let sa11yLoaded = false;

function injectCSS(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Failed to load Sa11y CSS'));
    document.head.appendChild(link);
  });
}

function injectScript(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Sa11y script'));
    document.head.appendChild(script);
  });
}

async function loadSa11y() {
  if (sa11yLoaded) return;

  await injectCSS(SA11Y_CSS_URL, 'sa11y-injected-styles');
  await injectScript(SA11Y_LANG_URL, 'sa11y-lang-script');
  await new Promise((r) => { setTimeout(r, 100); });
  await injectScript(SA11Y_JS_URL, 'sa11y-main-script');

  // Wait for Sa11y to be available
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      if (window.Sa11y && window.Sa11yLangEn) resolve();
      else if (attempts > 50) reject(new Error('Sa11y load timeout'));
      else setTimeout(check, 100);
    };
    check();
  });

  window.Sa11y.Lang.addI18n(window.Sa11yLangEn.strings);
  sa11yLoaded = true;
}

async function startSa11y() {
  if (sa11yActive) return;

  try {
    await loadSa11y();

    window.sa11yInstance = new window.Sa11y.Sa11y({
      checkRoot: 'main, [role="main"], .main-content, body',
      containerIgnore: '.sidekick-library, .hlx-sk, #hlx-sk, [data-aue-type], .aue-edit',
      showGoodLinkButton: true,
      showHinPageOutline: true,
      detectPageLanguage: true,
      panelPosition: 'left',
    });

    sa11yActive = true;
    // eslint-disable-next-line no-console
    console.log('[Sa11y] Started');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Sa11y] Error starting:', error);
  }
}

function stopSa11y() {
  if (!sa11yActive) return;

  try {
    if (window.sa11yInstance) {
      try { window.sa11yInstance.destroy(); } catch (e) { /* ignore */ }
      delete window.sa11yInstance;
    }

    // Remove Sa11y UI elements (keep scripts/styles loaded for re-use)
    [
      '#sa11y-container', '#sa11y-panel', '#sa11y-toast-container',
      '#sa11y-control-panel', '.sa11y-annotation', '.sa11y-instance',
    ].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        try { el.remove(); } catch (e) { /* ignore */ }
      });
    });

    // Remove Sa11y custom elements (web components with shadow DOM)
    [
      'sa11y-control-panel', 'sa11y-panel', 'sa11y-annotation',
      'sa11y-heading-label', 'sa11y-heading-anchor', 'sa11y-tooltips',
    ].forEach((tagName) => {
      document.querySelectorAll(tagName).forEach((el) => {
        try { el.remove(); } catch (e) { /* ignore */ }
      });
    });

    sa11yActive = false;
    // eslint-disable-next-line no-console
    console.log('[Sa11y] Stopped');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Sa11y] Error stopping:', error);
  }
}

function toggleSa11y() {
  if (sa11yActive) {
    stopSa11y();
  } else {
    startSa11y();
  }
}

// Listen for sidekick sa11y event
function initSa11ySidekick() {
  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    sk.addEventListener('custom:sa11y', toggleSa11y);
  } else {
    document.addEventListener('sidekick-ready', () => {
      document.querySelector('aem-sidekick')?.addEventListener('custom:sa11y', toggleSa11y);
    }, { once: true });
  }
}

initSa11ySidekick();

/**
 * Set template (page structure) and theme (page styles).
 */
function decorateTemplateAndTheme() {
  const addClasses = (element, classes) => {
    classes.split(',').forEach((c) => {
      element.classList.add(toClassName(c.trim()));
    });
  };
  const template = getMetadata('template');
  if (template) addClasses(document.body, template);
  const theme = getMetadata('theme');
  if (theme) addClasses(document.body, theme);
  if (template === 'article') {
    const main = document.querySelector('main');
    decorateArticle(main);
    loadCSS(`${window.hlx.codeBasePath}/templates/article/article.css`);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Checks if a URL is a supported video URL (YouTube, Vimeo, DVIDS)
 * @param {string} href - The URL to check
 * @returns {boolean} - True if it's a video URL
 */
function isVideoUrl(href) {
  if (!href) return false;
  return href.includes('youtube.com/watch')
    || href.includes('youtu.be/')
    || href.includes('vimeo.com/')
    || href.includes('dvidshub.net/video');
}

/**
 * Auto-blocks video URLs (DVIDS, YouTube, Vimeo) into video blocks
 * @param {Element} main - The main container element
 */
function autoblockVideos(main) {
  // Find all links that are video URLs and are the only content in their paragraph
  main.querySelectorAll('a[href]').forEach((link) => {
    if (!isVideoUrl(link.href)) return;

    // Check if link is the only content in its paragraph (standalone video link)
    const parent = link.parentElement;
    if (parent?.tagName !== 'P') return;

    // Check if the paragraph only contains this link (and maybe whitespace)
    const textContent = parent.textContent.trim();
    const linkText = link.textContent.trim();

    // If the paragraph text equals the link text (or href), it's a standalone video link
    if (textContent === linkText || textContent === link.href) {
      // Create video block
      const videoBlock = buildBlock('video', [[link.cloneNode(true)]]);
      parent.replaceWith(videoBlock);
    }
  });

  // Also check for plain text DVIDS URLs (not wrapped in anchor tags)
  main.querySelectorAll('p').forEach((p) => {
    // Skip if paragraph has children other than text nodes
    if (p.querySelector('a, img, picture')) return;

    const text = p.textContent.trim();
    // Match DVIDS video URLs
    const dvidsMatch = text.match(/^https?:\/\/(www\.)?dvidshub\.net\/video\/[^\s]+$/);
    if (dvidsMatch) {
      // Create a link element
      const link = document.createElement('a');
      link.href = text;
      link.textContent = text;

      // Create video block
      const videoBlock = buildBlock('video', [[link]]);
      p.replaceWith(videoBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // Auto-block video URLs (DVIDS, YouTube, Vimeo)
    autoblockVideos(main);

    // auto block `*/fragments/*` references
    const fragments = main.querySelectorAll('a[href*="/fragments/"]');
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(frag.firstElementChild);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateButtonGroups(main);
  decorateUSWDSButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Updates the page title to include slug from metadata
 */
function updatePageTitle() {
  const slug = getMetadata('slug');
  if (slug && document.title) {
    document.title = `${document.title} | ${slug}`;
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  updatePageTitle();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads the banner block into the header
 * @param {Element} header The header element
 */
async function loadBanner(header) {
  const bannerBlock = buildBlock('banner', '');
  header.prepend(bannerBlock);
  decorateBlock(bannerBlock);
  return loadBlock(bannerBlock);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const header = doc.querySelector('header');
  await loadBanner(header);
  loadHeader(header);
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
