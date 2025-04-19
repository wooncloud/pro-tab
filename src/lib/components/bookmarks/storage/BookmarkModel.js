// 북마크/폴더 데이터 모델 관련 함수

import { generateUUID, getFaviconUrl } from './BookmarkUtils';

export const UNCATEGORIZED_FOLDER_NAME = "미분류";

export function createFolder(title, order = 0) {
  return {
    id: generateUUID(),
    title: title,
    expanded: true,
    order: order,
    createdAt: new Date().toISOString(),
    bookmarks: []
  };
}

export function createBookmark(title, url, order = 0) {
  const formattedUrl = url;
  return {
    id: generateUUID(),
    title: title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
    order: order,
    createdAt: new Date().toISOString()
  };
}

export function getOrCreateUncategorizedFolder(bookmarks) {
  let folder = bookmarks.find(f => f.title === UNCATEGORIZED_FOLDER_NAME);
  if (!folder) {
    const maxOrder = bookmarks.length ? Math.max(...bookmarks.map(b => b.order || 0)) + 1 : 0;
    folder = {
      id: generateUUID(),
      title: UNCATEGORIZED_FOLDER_NAME,
      expanded: true,
      order: maxOrder,
      createdAt: new Date().toISOString(),
      bookmarks: []
    };
    return {
      folder,
      updatedBookmarks: [...bookmarks, folder]
    };
  }
  return {
    folder,
    updatedBookmarks: bookmarks
  };
} 