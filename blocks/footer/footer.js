import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Apply classes to the three sections: brand, links, subfooter
  const classes = ['brand', 'links', 'subfooter'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  // Make brand logo link to home
  const footerBrand = footer.querySelector('.footer-brand');
  if (footerBrand) {
    const brandImg = footerBrand.querySelector('img');
    if (brandImg && !brandImg.closest('a')) {
      const link = document.createElement('a');
      link.href = '/';
      link.setAttribute('aria-label', 'Home');
      brandImg.parentNode.insertBefore(link, brandImg);
      link.appendChild(brandImg);
    }
  }

  block.append(footer);
}
