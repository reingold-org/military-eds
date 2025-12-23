/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Determines the video source type from a link
 * @param {string} link - The video link URL
 * @returns {string} - 'youtube', 'vimeo', 'dvids', or 'video'
 */
function getVideoSource(link) {
  if (link.includes('youtube') || link.includes('youtu.be')) return 'youtube';
  if (link.includes('vimeo')) return 'vimeo';
  if (link.includes('dvidshub.net')) return 'dvids';
  return 'video';
}

/**
 * Gets a human-readable video type label
 * @param {string} source - The video source type ('youtube', 'vimeo', 'dvids', or 'video')
 * @returns {string} - Human-readable label
 */
function getVideoTypeLabel(source) {
  const labels = {
    youtube: 'YouTube video',
    vimeo: 'Vimeo video',
    dvids: 'DVIDS video',
    video: 'MP4 video',
  };
  return labels[source] || 'video';
}

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}"
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture"
        allowfullscreen=""
        scrolling="no"
        title="Content from Youtube"
        loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        title="Content from Vimeo"
        loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

/**
 * Extracts numeric video ID from various DVIDS ID formats
 * @param {string} idString - The ID string (e.g., "123456", "video:123456")
 * @returns {string} - The numeric video ID
 */
function extractDvidsId(idString) {
  if (!idString) return '';
  // Handle formats like "video:123456" -> extract just the number
  const colonMatch = idString.match(/:(\d+)$/);
  if (colonMatch) return colonMatch[1];
  // Handle plain numeric ID
  if (/^\d+$/.test(idString)) return idString;
  return idString;
}

/**
 * Embeds a DVIDS video
 * Supports URLs like:
 * - https://www.dvidshub.net/video/123456/video-title
 * - https://www.dvidshub.net/video/embed/123456
 * - https://www.dvidshub.net/video/video:123456
 * @param {URL} url - The DVIDS video URL
 * @param {boolean} autoplay - Whether to autoplay
 * @returns {HTMLElement} - The embed wrapper element
 */
function embedDvids(url, autoplay) {
  // Extract video ID from pathname
  // Formats: /video/123456/title, /video/embed/123456, /video/video:123456
  const pathParts = url.pathname.split('/').filter(Boolean);
  const [first, second, third] = pathParts;
  let videoId = '';

  if (first === 'video') {
    if (second === 'embed') {
      // /video/embed/123456
      videoId = extractDvidsId(third);
    } else {
      // /video/123456, /video/123456/title, or /video/video:123456
      videoId = extractDvidsId(second);
    }
  }

  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn('Could not extract DVIDS video ID from URL:', url.href);
    return null;
  }

  // Build embed URL with optional autoplay
  let embedUrl = `https://www.dvidshub.net/video/embed/${videoId}`;
  if (autoplay) {
    embedUrl += '?autoplay=true';
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${embedUrl}"
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowfullscreen
        allowtransparency
        title="Content from DVIDS"
        loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

function loadVideoEmbed(block, link, autoplay, background) {
  if (block.dataset.embedLoaded === 'true') return;

  const url = new URL(link);
  const source = getVideoSource(link);

  if (source === 'youtube') {
    const embedWrapper = embedYoutube(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (source === 'vimeo') {
    const embedWrapper = embedVimeo(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (source === 'dvids') {
    const embedWrapper = embedDvids(url, autoplay);
    if (embedWrapper) {
      block.append(embedWrapper);
      embedWrapper.querySelector('iframe').addEventListener('load', () => {
        block.dataset.embedLoaded = true;
      });
    }
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
}

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');

  // Try to get link from anchor tag first, then fall back to text content
  const anchor = block.querySelector('a');
  let link = '';

  if (anchor) {
    link = anchor.href;
  } else {
    // Look for a URL in the text content
    const textContent = block.textContent.trim();
    // Match URLs that look like video links
    const urlMatch = textContent.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      [link] = urlMatch;
    }
  }

  if (!link) {
    // eslint-disable-next-line no-console
    console.warn('Video block: No video URL found');
    return;
  }

  block.textContent = '';
  block.dataset.embedLoaded = false;

  const autoplay = block.classList.contains('autoplay');

  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.append(placeholder);

    if (!autoplay) {
      const source = getVideoSource(link);
      const videoType = getVideoTypeLabel(source);
      const ariaLabel = `Play ${videoType}`;

      wrapper.insertAdjacentHTML(
        'beforeend',
        `<div class="video-placeholder-play"><button type="button" title="${ariaLabel}" aria-label="${ariaLabel}"></button></div>`,
      );
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(block, link, true, false);
      });
    }
    block.append(wrapper);
  }

  if (!placeholder || autoplay) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = autoplay && !prefersReducedMotion.matches;
        loadVideoEmbed(block, link, playOnLoad, autoplay);
      }
    });
    observer.observe(block);
  }
}
