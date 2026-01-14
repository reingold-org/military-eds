// add delayed functionality here

/**
 * AOS (Animate on Scroll) Integration
 * Loads AOS library for supported themes: Marines, Air Force
 * https://michalsnik.github.io/aos/
 */

const AOS_CSS_URL = 'https://unpkg.com/aos@2.3.4/dist/aos.css';
const AOS_JS_URL = 'https://unpkg.com/aos@2.3.4/dist/aos.js';

/**
 * Injects a CSS stylesheet
 * @param {string} url - The URL of the CSS file
 * @param {string} id - The ID for the link element
 */
function injectAOSCSS(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Failed to load AOS CSS'));
    document.head.appendChild(link);
  });
}

/**
 * Injects a JavaScript file
 * @param {string} url - The URL of the JS file
 * @param {string} id - The ID for the script element
 */
function injectAOSScript(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load AOS script'));
    document.head.appendChild(script);
  });
}

/**
 * Adds AOS data attributes to elements for animation
 * Called after AOS is loaded
 */
function decorateAOSElements() {
  // Animate sections
  document.querySelectorAll('main > .section').forEach((section, index) => {
    if (!section.hasAttribute('data-aos')) {
      section.setAttribute('data-aos', 'fade-up');
      section.setAttribute('data-aos-duration', '600');
      section.setAttribute('data-aos-delay', String(index * 50));
      section.setAttribute('data-aos-once', 'true');
    }
  });

  // Animate cards within sections
  document.querySelectorAll('.cards .cards-card-body').forEach((card, index) => {
    if (!card.hasAttribute('data-aos')) {
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-duration', '500');
      card.setAttribute('data-aos-delay', String(100 + (index % 4) * 100));
      card.setAttribute('data-aos-once', 'true');
    }
  });

  // Animate columns
  document.querySelectorAll('.columns > div > div').forEach((col, index) => {
    if (!col.hasAttribute('data-aos')) {
      col.setAttribute('data-aos', 'fade-up');
      col.setAttribute('data-aos-duration', '500');
      col.setAttribute('data-aos-delay', String(index * 100));
      col.setAttribute('data-aos-once', 'true');
    }
  });

  // Note: Hero animation is handled via CSS keyframes in hero.css
  // This ensures the animation triggers on page load, not on scroll
}

/**
 * Initializes AOS library for supported themes
 */
async function initAOS() {
  // Only load AOS for supported themes
  const isMarines = document.body.classList.contains('marines');
  const isAirforce = document.body.classList.contains('airforce');

  if (!isMarines && !isAirforce) {
    return;
  }

  const themeName = isMarines ? 'Marines' : 'Air Force';

  try {
    // Load CSS and JS
    await injectAOSCSS(AOS_CSS_URL, 'aos-styles');
    await injectAOSScript(AOS_JS_URL, 'aos-script');

    // Wait for AOS to be available
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        attempts += 1;
        if (window.AOS) {
          resolve();
        } else if (attempts > 50) {
          reject(new Error('AOS load timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

    // Decorate elements with AOS attributes
    decorateAOSElements();

    // Initialize AOS
    window.AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0,
    });

    // eslint-disable-next-line no-console
    console.log(`[AOS] Initialized for ${themeName} theme`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[AOS] Failed to initialize:', error);
  }
}

// Initialize AOS when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAOS);
} else {
  initAOS();
}

/**
 * Scroll handler for sticky header
 * Adds 'scrolled' class to body when page is scrolled
 * This triggers the header background to become more opaque
 * Supports: Marines, Air Force themes
 */
function initStickyHeaderScrollHandler() {
  const isMarines = document.body.classList.contains('marines');
  const isAirforce = document.body.classList.contains('airforce');

  if (!isMarines && !isAirforce) {
    return;
  }

  const scrollThreshold = 50;
  let ticking = false;

  function updateScrollState() {
    if (window.scrollY > scrollThreshold) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Check initial scroll position
  updateScrollState();
}

// Initialize scroll handler
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyHeaderScrollHandler);
} else {
  initStickyHeaderScrollHandler();
}
