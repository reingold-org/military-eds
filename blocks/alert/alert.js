/*
 * Alert Block
 * USWDS Alert component for Edge Delivery Services
 * https://designsystem.digital.gov/components/alert/
 */

// USWDS Alert icons as inline SVGs
const ALERT_ICONS = {
  info: `<svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  </svg>`,
  success: `<svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  </svg>`,
  warning: `<svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  </svg>`,
  error: `<svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  </svg>`,
  emergency: `<svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  </svg>`,
};

/**
 * Determines the alert type from block classes
 * @param {HTMLElement} block - The block element
 * @returns {string} - The alert type (info, success, warning, error, emergency)
 */
function getAlertType(block) {
  const types = ['success', 'warning', 'error', 'emergency'];
  const foundType = types.find((type) => block.classList.contains(type));
  return foundType || 'info';
}

/**
 * Determines if the alert should be slim
 * @param {HTMLElement} block - The block element
 * @returns {boolean}
 */
function isSlim(block) {
  return block.classList.contains('slim');
}

/**
 * Determines if the alert should hide the icon
 * @param {HTMLElement} block - The block element
 * @returns {boolean}
 */
function shouldHideIcon(block) {
  return block.classList.contains('no-icon');
}

export default function decorate(block) {
  const alertType = getAlertType(block);
  const slim = isSlim(block);
  const hideIcon = shouldHideIcon(block);

  // Get content from the block rows
  const rows = [...block.children];

  // First row is typically the heading, second row is the body text
  // For slim alerts, there may only be one row with just text
  let heading = '';
  let bodyContent = '';

  if (rows.length === 1) {
    // Single row - use as body content
    bodyContent = rows[0].innerHTML;
  } else if (rows.length >= 2) {
    // First row is heading, rest is body content
    const headingEl = rows[0].querySelector('p, h1, h2, h3, h4, h5, h6');
    heading = headingEl ? headingEl.textContent : rows[0].textContent;

    // Combine remaining rows for body content
    bodyContent = rows
      .slice(1)
      .map((row) => row.innerHTML)
      .join('');
  }

  // Build CSS classes
  const alertClasses = ['usa-alert', `usa-alert--${alertType}`];
  if (slim) alertClasses.push('usa-alert--slim');
  if (hideIcon) alertClasses.push('usa-alert--no-icon');

  // Build the alert HTML structure
  const alertHTML = `
    <div class="${alertClasses.join(' ')}" role="alert">
      <div class="usa-alert__body">
        ${!hideIcon ? `<div class="usa-alert__icon">${ALERT_ICONS[alertType]}</div>` : ''}
        <div class="usa-alert__content">
          ${heading && !slim ? `<h4 class="usa-alert__heading">${heading}</h4>` : ''}
          <div class="usa-alert__text">${bodyContent}</div>
        </div>
      </div>
    </div>
  `;

  block.innerHTML = alertHTML;
}
