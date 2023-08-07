(async () => {
    const src = chrome.runtime.getURL('js/main.js');
    const contentScript = await import(src);
    await contentScript.app();
})();
