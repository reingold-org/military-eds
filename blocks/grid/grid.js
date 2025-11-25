/**
 * Grid Block (USWDS)
 *
 * Creates USWDS grid layouts from Edge Delivery content.
 * Follows Edge Delivery's block pattern.
 *
 * Usage in content:
 * | Grid |
 * | --- |
 * | Left Column | Right Column |
 */

export default function decorate(block) {
  // Wrap block content in grid-container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  const gridRow = document.createElement('div');
  gridRow.className = 'grid-row grid-gap';

  // Get column configuration from block metadata
  // Default to equal columns
  const rows = block.querySelectorAll(':scope > div');

  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    const colCount = cells.length;

    // Calculate column width (12-column grid)
    const colWidth = 12 / colCount;

    // Check for custom column widths in first cell
    const firstCellText = cells[0]?.textContent?.trim();
    const widthMatch = firstCellText?.match(/(\d+)-(\d+)/);

    if (widthMatch) {
      // Custom widths specified (e.g., "8-4" for 8 and 4 column layout)
      cells.forEach((cell, index) => {
        const width = parseInt(widthMatch[index + 1], 10);
        const gridCol = document.createElement('div');
        gridCol.className = `grid-col-${width}`;
        gridCol.innerHTML = cell.innerHTML;
        gridRow.appendChild(gridCol);
      });
    } else {
      // Equal width columns
      cells.forEach((cell) => {
        const gridCol = document.createElement('div');
        gridCol.className = `tablet:grid-col-${colWidth}`;
        gridCol.innerHTML = cell.innerHTML;
        gridRow.appendChild(gridCol);
      });
    }
  });

  gridContainer.appendChild(gridRow);
  block.textContent = '';
  block.appendChild(gridContainer);
}
