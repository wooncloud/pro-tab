// 북마크 데이터 관리 커스텀 훅
// 한국어 주석, 내부 문자열은 영어로 작성
import { writable } from 'svelte/store';
import { loadBookmarks, saveBookmarks } from '../storage/BookmarkPersistence';

// 북마크 스토어 생성
export const bookmarksStore = writable([]);

// 북마크 데이터 로드 함수
export async function fetchBookmarks() {
  try {
    const bookmarks = await loadBookmarks();
    bookmarksStore.set(bookmarks);
    return bookmarks;
  } catch (error) {
    // 에러는 상위에서 처리
    throw error;
  }
}

// 북마크 데이터 저장 함수
export function persistBookmarks(bookmarks) {
  saveBookmarks(bookmarks);
  bookmarksStore.set(bookmarks);
}

// 북마크 스토어 구독 해제 유틸
export function subscribeBookmarks(callback) {
  const unsubscribe = bookmarksStore.subscribe(callback);
  return unsubscribe;
} 