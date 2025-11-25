/**
 * Card Block (USWDS)
 *
 * Creates USWDS card components from Edge Delivery content.
 * Follows Edge Delivery's block pattern.
 *
 * Usage in content:
 * | Card |
 * | --- |
 * | Card Title |
 * | Card body content goes here. |
 * | [Action Button](https://example.com) |
 */

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');

  rows.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'usa-card';

    const cardContainer = document.createElement('div');
    cardContainer.className = 'usa-card__container';

    const children = Array.from(row.children);

    children.forEach((child, index) => {
      if (index === 0) {
        // First cell becomes card media (if it has an image)
        const img = child.querySelector('img');
        if (img) {
          const cardMedia = document.createElement('div');
          cardMedia.className = 'usa-card__media';
          const cardImg = document.createElement('div');
          cardImg.className = 'usa-card__img';
          cardImg.appendChild(img);
          cardMedia.appendChild(cardImg);
          card.insertBefore(cardMedia, cardContainer);
        } else {
          // Otherwise it's the header
          const cardHeader = document.createElement('header');
          cardHeader.className = 'usa-card__header';
          const heading = child.querySelector('h1, h2, h3, h4, h5, h6') || child;
          const cardHeading = document.createElement('h2');
          cardHeading.className = 'usa-card__heading';
          cardHeading.textContent = heading.textContent;
          cardHeader.appendChild(cardHeading);
          cardContainer.appendChild(cardHeader);
        }
      } else if (index === 1) {
        // Second cell becomes card body
        const cardBody = document.createElement('div');
        cardBody.className = 'usa-card__body';
        cardBody.innerHTML = child.innerHTML;
        cardContainer.appendChild(cardBody);
      } else if (index === 2) {
        // Third cell becomes card footer
        const cardFooter = document.createElement('div');
        cardFooter.className = 'usa-card__footer';
        cardFooter.innerHTML = child.innerHTML;
        cardContainer.appendChild(cardFooter);
      }
    });

    card.appendChild(cardContainer);
    row.replaceWith(card);
  });
}
