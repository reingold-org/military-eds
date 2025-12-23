export default function decorate(block) {
  const isSized = block.classList.contains('sized');
  let columnWidths = [];

  // Handle sized variant - first row contains column widths
  if (isSized && block.firstElementChild) {
    const firstRow = block.firstElementChild;
    const widthCells = [...firstRow.children];

    // Parse width values from first row
    columnWidths = widthCells.map((cell) => {
      const text = cell.textContent.trim();
      // Support plain numbers (treated as %), or explicit units like "70%" or "300px"
      if (/^\d+$/.test(text)) {
        return `${text}%`;
      }
      return text;
    });

    // Remove the width specification row from DOM
    firstRow.remove();
  }

  // Count columns from first content row
  const cols = block.firstElementChild ? [...block.firstElementChild.children] : [];
  block.classList.add(`columns-${cols.length}-cols`);

  // Apply custom widths via CSS custom properties
  if (isSized && columnWidths.length > 0) {
    columnWidths.forEach((width, index) => {
      block.style.setProperty(`--column-width-${index + 1}`, width);
    });
    block.style.setProperty('--column-count', columnWidths.length);
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, colIndex) => {
      // Apply width to each column in sized variant
      if (isSized && columnWidths[colIndex]) {
        col.style.flex = `0 0 ${columnWidths[colIndex]}`;
      }

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
