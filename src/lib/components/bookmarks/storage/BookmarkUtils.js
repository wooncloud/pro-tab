// 북마크 유틸리티 함수 모음

export function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export function extractDomain(url) {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch (e) {
    return '';
  }
}

export function getFaviconUrl(url) {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-./?=&%#_]*)?$/;

export function isValidUrl(url) {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  return urlPattern.test(url);
}

export function formatUrl(url) {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`;
  }
  return url;
} 