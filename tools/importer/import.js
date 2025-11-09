/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const extractCfBody = (main, document) => {
  const contentfragment = document.querySelector('div.contentfragment');
  if (!contentfragment) return;
  const img = document.querySelector('.cf-feature-image');
  const cfBody = document.querySelector('.cmp-contentfragment__element--body .cmp-contentfragment__element-value').innerHTML.trim();
  console.log('cfBody:', cfBody);
  if (cfBody) {
    contentfragment.innerHTML = cfBody;
    contentfragment.prepend(img);
  }
};

const createMetadataBlock = (main, document) => {
  const meta = {};

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  // find the <meta property="og:description"> element
  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  // find the img element
  const img = document.querySelector('.cf-feature-image').cloneNode(true);
  if (img) {
    meta.Image = img;
  }

  // set the release date
  const releaseDate = document.querySelector('.cmp-contentfragment__element--releaseDate .cmp-contentfragment__element-value');
  if (releaseDate) {
    meta['Release Date'] = releaseDate.textContent.trim();
  }

  // set the dateline
  const dateline = document.querySelector('.cf-dateline');
  if (dateline) {
    meta.Dateline = dateline.textContent.split(' –')[0].trim();
  }

  // set the author
  const author = document.querySelector('.cmp-contentfragment__element--author .cmp-contentfragment__element-value');
  if (author) {
    meta.Author = author.textContent.split(': ')[1].trim();
  }

  // set the tags
  const tags = document.querySelectorAll('.cmp-contentfragment__element--topics .cmp-contentfragment__element-value ul.cf-topics li');
  if (tags.length > 0) {
    meta.Tags = Array.from(tags).map((tag) => tag.textContent.trim()).join(', ');
  }

  meta.template = 'article';

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

export default {
  /**
     * Apply DOM operations to the provided document and return
     * the root element to be then transformed to Markdown.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @returns {HTMLElement} The root element to be transformed
     */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;
    createMetadataBlock(main, document);
    extractCfBody(main, document);
    // attempt to remove non-content elements
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'nav',
      '.nav',
      'footer',
      '.footer',
      'iframe',
      'noscript',
      '.social-share',
      '.contentfragment h3',
      '.cf-dateline',
      'dl',
      'aside',
    ]);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    WebImporter.rules.convertIcons(main, document);

    return main;
  },

  /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @return {string} The path
     */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    let p = new URL(url).pathname;
    if (p.endsWith('/')) {
      p = `${p}index`;
    }
    return decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  },
};
