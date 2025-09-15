// Always inject the BUILT asset (dist/assets/content.js), never src/*.ts
export async function injectContent(tabId: number) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ['assets/content.js'] });
  // if Chrome complains about path, fall back to {files:[chrome.runtime.getURL('assets/content.js')]}
}