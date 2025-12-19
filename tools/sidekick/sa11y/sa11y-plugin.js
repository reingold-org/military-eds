/**
 * Sa11y Accessibility Checker - Sidekick Popover Plugin
 * Injects Sa11y into the preview page for accessibility testing.
 * https://sa11y.netlify.app/
 */

const SA11Y_VERSION = '4';
const SA11Y_CSS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/css/sa11y.min.css`;
const SA11Y_LANG_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/lang/en.umd.js`;
const SA11Y_JS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/sa11y.umd.min.js`;

const els = {
  runBtn: document.getElementById('runBtn'),
  stopBtn: document.getElementById('stopBtn'),
  status: document.getElementById('status'),
};

let sa11yActive = false;

function setStatus(text) {
  els.status.textContent = text;
}

function getPreviewWindow() {
  try {
    if (window.parent && window.parent !== window) {
      let targetWindow = window.parent;
      while (targetWindow.parent && targetWindow.parent !== targetWindow) {
        targetWindow = targetWindow.parent;
      }
      return targetWindow;
    }
  } catch (e) {
    console.error('[Sa11y] Error:', e);
  }
  return null;
}

function isSa11yLoaded(targetWindow) {
  try {
    return targetWindow.document.getElementById('sa11y-injected-styles') !== null;
  } catch (e) {
    return false;
  }
}

function injectCSS(targetDoc, url, id) {
  return new Promise((resolve, reject) => {
    if (targetDoc.getElementById(id)) { resolve(); return; }
    const link = targetDoc.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Failed to load CSS'));
    targetDoc.head.appendChild(link);
  });
}

function injectScript(targetDoc, url, id) {
  return new Promise((resolve, reject) => {
    if (targetDoc.getElementById(id)) { resolve(); return; }
    const script = targetDoc.createElement('script');
    script.id = id;
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load script'));
    targetDoc.head.appendChild(script);
  });
}

async function runSa11y() {
  setStatus('Loading...');
  const targetWindow = getPreviewWindow();
  
  if (!targetWindow) {
    setStatus('Error: No preview page');
    return;
  }
  
  try {
    const targetDoc = targetWindow.document;
    
    if (isSa11yLoaded(targetWindow)) {
      setStatus('Already running');
      sa11yActive = true;
      updateButtons();
      return;
    }
    
    await injectCSS(targetDoc, SA11Y_CSS_URL, 'sa11y-injected-styles');
    await injectScript(targetDoc, SA11Y_LANG_URL, 'sa11y-lang-script');
    await new Promise(r => setTimeout(r, 100));
    await injectScript(targetDoc, SA11Y_JS_URL, 'sa11y-main-script');
    
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (targetWindow.Sa11y && targetWindow.Sa11yLangEn) resolve();
        else if (attempts > 50) reject(new Error('Timeout'));
        else setTimeout(check, 100);
      };
      check();
    });
    
    targetWindow.Sa11y.Lang.addI18n(targetWindow.Sa11yLangEn.strings);
    targetWindow.sa11yInstance = new targetWindow.Sa11y.Sa11y({
      checkRoot: 'main, [role="main"], .main-content, body',
      containerIgnore: '.sidekick-library, .hlx-sk, #hlx-sk, [data-aue-type], .aue-edit',
      showGoodLinkButton: true,
      showHinPageOutline: true,
      detectPageLanguage: true,
      panelPosition: 'left',
    });
    
    sa11yActive = true;
    setStatus('Running');
    updateButtons();
    
  } catch (error) {
    setStatus('Error: ' + error.message);
  }
}

function removeSa11y() {
  const targetWindow = getPreviewWindow();
  if (!targetWindow) {
    setStatus('Error');
    return;
  }
  
  try {
    const targetDoc = targetWindow.document;
    
    if (targetWindow.sa11yInstance) {
      try { targetWindow.sa11yInstance.destroy(); } catch (e) {}
      delete targetWindow.sa11yInstance;
    }
    
    ['#sa11y-injected-styles', '#sa11y-lang-script', '#sa11y-main-script',
     '#sa11y-container', '#sa11y-panel', '#sa11y-toast-container',
     '#sa11y-control-panel', '[id^="sa11y"]', '.sa11y-annotation', '.sa11y-instance'
    ].forEach(sel => {
      targetDoc.querySelectorAll(sel).forEach(el => { try { el.remove(); } catch (e) {} });
    });
    
    delete targetWindow.Sa11y;
    delete targetWindow.Sa11yLangEn;
    
    sa11yActive = false;
    setStatus('Stopped');
    updateButtons();
    
  } catch (error) {
    setStatus('Error');
  }
}

function updateButtons() {
  els.runBtn.classList.toggle('hidden', sa11yActive);
  els.stopBtn.classList.toggle('hidden', !sa11yActive);
}

function checkInitialState() {
  const targetWindow = getPreviewWindow();
  if (targetWindow && isSa11yLoaded(targetWindow)) {
    sa11yActive = true;
    setStatus('Running');
    updateButtons();
  }
}

els.runBtn.addEventListener('click', runSa11y);
els.stopBtn.addEventListener('click', removeSa11y);
setTimeout(checkInitialState, 300);
