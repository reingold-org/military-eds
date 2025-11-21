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
  const maxArticles = 4;
  let count = 0;

  block.textContent = '';
  block.append(list);

  // get current URL path (strip origin, keep pathname)
  const currentPath = window.location.pathname;

  currentTags.forEach((tag) => {
    if (count >= maxArticles) return;

    const matches = filterItems(allentries, tag);
    matches.forEach((entry) => {
      if (count >= maxArticles) return;

      // skip if it's the current page
      if (entry.path === currentPath) return;

      // avoid duplicates
      if (!seen.has(entry.path)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = entry.path;

        const title = document.createElement('span');
        title.className = 'title';
        title.textContent = entry.title;

        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = entry.description;

        a.appendChild(title);
        a.appendChild(description);
        li.appendChild(a);
        list.appendChild(li);

        seen.add(entry.path);
        added = true;
        count += 1;
      }
    });
  });

  if (!added) {
    const li = document.createElement('li');
    li.textContent = 'No related articles';
    list.appendChild(li);
  }
}
