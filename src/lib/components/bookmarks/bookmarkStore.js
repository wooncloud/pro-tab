import { writable } from 'svelte/store';

const STORAGE_KEY = 'protab_bookmarks';

// 북마크 데이터를 위한 writable 스토어
export const bookmarks = writable([]);

/**
 * Chrome 동기화 스토리지에서 북마크를 로드하여 스토어를 업데이트합니다.
 */
export async function loadBookmarks() {
  if (chrome && chrome.storage && chrome.storage.sync) {
    try {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.sync.get([STORAGE_KEY], (res) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve(res);
        });
      });
      
      const data = result[STORAGE_KEY];
      if (data && Array.isArray(data)) {
        bookmarks.set(data);
        console.log('Bookmarks loaded from storage:', data);
      } else {
        bookmarks.set([]); // 데이터가 없거나 형식이 잘못된 경우 빈 배열로 초기화
        console.log('No valid bookmarks found in storage, initializing with empty array.');
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      bookmarks.set([]); // 오류 발생 시 빈 배열로 초기화
    }
  } else {
    console.warn('Chrome storage.sync API is not available. Bookmarks will not be persisted.');
    // 개발 환경 등 chrome.storage.sync를 사용할 수 없는 경우 목업 데이터 또는 로컬 스토리지 대체 가능
    // 여기서는 빈 배열로 초기화합니다.
    bookmarks.set([]);
  }
}

/**
 * 현재 북마크 데이터를 Chrome 동기화 스토리지에 저장합니다.
 * @param {Array} currentBookmarks - 저장할 북마크 데이터
 */
export async function saveBookmarks(currentBookmarks) {
  if (chrome && chrome.storage && chrome.storage.sync) {
    try {
      await new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: currentBookmarks }, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });
      console.log('Bookmarks saved to storage:', currentBookmarks);
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  } else {
    // console.warn('Chrome storage.sync API is not available. Bookmarks will not be saved.');
  }
}

// 스토어의 변경 사항을 자동으로 감지하여 저장 (debounce 등을 적용하면 더 효율적)
// 여기서는 간단하게 subscribe하여 변경 시마다 저장합니다.
// 주의: 이 방식은 매우 빈번한 쓰기를 유발할 수 있으므로, 실제 프로덕션에서는
// 사용자의 특정 액션(추가, 삭제, 편집 완료 등) 이후에만 saveBookmarks를 명시적으로 호출하는 것이 좋습니다.
let firstRun = true;
bookmarks.subscribe(currentData => {
  if (firstRun) {
    firstRun = false;
    return;
  }
  saveBookmarks(currentData);
});

// 앱 시작 시 북마크 로드
if (typeof window !== 'undefined') { // 브라우저 환경에서만 실행
  loadBookmarks();
} 