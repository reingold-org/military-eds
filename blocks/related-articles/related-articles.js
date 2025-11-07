import ffetch from '../../scripts/ffetch.js';

const allentries = await ffetch('/news/query-index.json').all();

function filterItems(arr, query) {
  return arr.filter((el) => el.tags && el.tags.includes(query));
}

function getArticleTags() {
  const metas = document.querySelectorAll('meta[property="article:tag"]');
  return Array.from(metas).map((meta) => meta.content).filter(Boolean);
}

export default function decorate(block) {
  const list = document.createElement('ul');
  const currentTags = getArticleTags();
  const seen = new Set();
  let added = false;

  block.textContent = '';
  block.append(list);

  // get current URL path (strip origin, keep pathname)
  const currentPath = window.location.pathname;

  currentTags.forEach((tag) => {
    const matches = filterItems(allentries, tag);
    matches.forEach((entry) => {
      // skip if it's the current page
      if (entry.path === currentPath) return;

      // avoid duplicates
      if (!seen.has(entry.path)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = entry.path;
        a.textContent = entry.title;
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = entry.description;
        a.appendChild(description);
        li.appendChild(a);
        li.appendChild(description);
        list.appendChild(li);

        seen.add(entry.path);
        added = true;
      }
    });
  });

  if (!added) {
    const li = document.createElement('li');
    li.textContent = 'No related articles';
    list.appendChild(li);
  }
}
