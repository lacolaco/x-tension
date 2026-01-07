export default defineBackground(() => {
  browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
    const url = new URL(details.url);
    browser.tabs.sendMessage(details.tabId, { type: 'navigate', pathname: url.pathname }).catch(() => {
      // Content script not ready, ignore
    });
  });
});
