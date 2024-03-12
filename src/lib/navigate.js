/**
 * URL parameter keys
 * @enum {string}
 */
export const UrlParam = {
  Tab: 'tab',
  Role: 'role',
  Node: 'node',
}

/**
 * Update the browser's URL without reloading the page
 * @param {string} name
 * @param {string} value 
 */
export function updateUrlParam(name, value) {
  const currentUrl = new URL(window.location);
  const searchParams = currentUrl.searchParams;

  searchParams.set(name, value);

  currentUrl.search = searchParams.toString();
  window.history.pushState({ path: currentUrl.toString() }, '', currentUrl.toString());
}