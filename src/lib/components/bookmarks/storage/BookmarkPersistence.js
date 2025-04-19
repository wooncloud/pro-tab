// 북마크 저장/불러오기 관련 함수

export const STORAGE_KEY = "protabs_bookmarks";

export async function loadBookmarks() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          if (result[STORAGE_KEY]) {
            const bookmarks = JSON.parse(result[STORAGE_KEY]);
            resolve(bookmarks);
          } else {
            const defaultBookmarks = [];
            saveBookmarks(defaultBookmarks);
            resolve(defaultBookmarks);
          }
        });
      });
    } else {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const bookmarks = JSON.parse(storedData);
        return bookmarks;
      } else {
        const defaultBookmarks = [];
        saveBookmarks(defaultBookmarks);
        return defaultBookmarks;
      }
    }
  } catch (error) {
    console.error("북마크 로드 중 오류:", error);
    return [];
  }
}

export function saveBookmarks(bookmarks) {
  try {
    const bookmarksJson = JSON.stringify(bookmarks);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ [STORAGE_KEY]: bookmarksJson });
    } else {
      localStorage.setItem(STORAGE_KEY, bookmarksJson);
    }
    return true;
  } catch (error) {
    console.error("북마크 저장 중 오류:", error);
    return false;
  }
} 