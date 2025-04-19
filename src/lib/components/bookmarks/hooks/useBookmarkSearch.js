// 북마크 검색 커스텀 훅
// 한국어 주석, 내부 문자열은 영어로 작성
import { writable } from 'svelte/store';
import { sortByOrder } from '../storage/BookmarkDnD';

// 검색 상태 스토어
export const searchQuery = writable("");
export const isSearchMode = writable(false);
export const searchResults = writable([]);

// 북마크 검색 함수
export function searchBookmarks(bookmarks, query) {
  if (!query.trim()) {
    clearSearch();
    return [];
  }
  const lowerQuery = query.toLowerCase().trim();
  let results = [];
  bookmarks.forEach(folder => {
    const matchingBookmarks = folder.bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery)
    );
    if (matchingBookmarks.length > 0) {
      results.push({
        ...folder,
        expanded: true, // 검색 결과가 있는 폴더는 자동으로 확장
        bookmarks: sortByOrder(matchingBookmarks)
      });
    }
  });
  searchResults.set(results);
  isSearchMode.set(true);
  return results;
}

// 검색 초기화 함수
export function clearSearch() {
  searchQuery.set("");
  isSearchMode.set(false);
  searchResults.set([]);
} 