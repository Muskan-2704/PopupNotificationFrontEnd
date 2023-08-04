(async () => {
    const src = chrome.runtime.getURL('js/min.js');
    const contentScript = await import(src);
    await contentScript.app();
})();