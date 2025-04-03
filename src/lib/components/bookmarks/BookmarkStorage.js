// 북마크 스토리지 관리를 위한 유틸리티 함수들

// 스토리지 키 상수
export const STORAGE_KEY = "protabs_bookmarks";
export const UNCATEGORIZED_FOLDER_NAME = "미분류";

// URL 유효성 검사 정규식
// URL 패턴: 프로토콜(선택), 도메인, TLD, 경로(선택), 쿼리(선택), 해시(선택)
export const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-./?=&%#_]*)?$/;

// 스토리지에서 북마크 데이터 로드
export async function loadBookmarks() {
  try {
    // Chrome API 사용 가능 여부 확인
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Promise로 Chrome 스토리지 API 래핑
      return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          if (result[STORAGE_KEY]) {
            resolve(JSON.parse(result[STORAGE_KEY]));
          } else {
            // 초기 데이터가 없으면 기본 미분류 폴더 생성
            const defaultBookmarks = [
              {
                id: 1,
                title: UNCATEGORIZED_FOLDER_NAME,
                expanded: true,
                bookmarks: []
              }
            ];
            saveBookmarks(defaultBookmarks);
            resolve(defaultBookmarks);
          }
        });
      });
    } else {
      // 개발 환경 또는 Chrome API를 사용할 수 없는 경우 로컬 스토리지 사용
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        // 초기 데이터가 없으면 기본 미분류 폴더 생성
        const defaultBookmarks = [
          {
            id: 1,
            title: UNCATEGORIZED_FOLDER_NAME,
            expanded: true,
            bookmarks: []
          }
        ];
        saveBookmarks(defaultBookmarks);
        return defaultBookmarks;
      }
    }
  } catch (error) {
    console.error("북마크 로드 중 오류:", error);
    
    // 오류 발생 시 기본 데이터 사용
    return [
      {
        id: 1,
        title: UNCATEGORIZED_FOLDER_NAME,
        expanded: true,
        bookmarks: []
      }
    ];
  }
}

// 북마크 데이터 저장
export function saveBookmarks(bookmarks) {
  try {
    const bookmarksJson = JSON.stringify(bookmarks);
    
    // Chrome API 사용 가능 여부 확인
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Chrome 스토리지에 데이터 저장
      chrome.storage.sync.set({ [STORAGE_KEY]: bookmarksJson });
    } else {
      // 개발 환경 또는 Chrome API를 사용할 수 없는 경우 로컬 스토리지 사용
      localStorage.setItem(STORAGE_KEY, bookmarksJson);
    }
    return true;
  } catch (error) {
    console.error("북마크 저장 중 오류:", error);
    return false;
  }
}

// URL 유효성 검사 함수
export function isValidUrl(url) {
  // 기본적인 형식 검사
  url = url.trim();
  
  // 프로토콜이 없다면 "http://"를 임시로 추가하여 검사
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  
  return urlPattern.test(url);
}

// URL 형식 처리 함수
export function formatUrl(url) {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`;
  }
  return url;
}

// 미분류 폴더 가져오기 또는 생성
export function getOrCreateUncategorizedFolder(bookmarks) {
  // 이미 존재하는 미분류 폴더 찾기
  let uncategorizedFolder = bookmarks.find(folder => folder.title === UNCATEGORIZED_FOLDER_NAME);
  
  // 없으면 새로 생성
  if (!uncategorizedFolder) {
    const id = bookmarks.length ? Math.max(0, ...bookmarks.map(b => b.id)) + 1 : 1;
    uncategorizedFolder = { 
      id, 
      title: UNCATEGORIZED_FOLDER_NAME, 
      expanded: true, 
      bookmarks: [] 
    };
    bookmarks = [...bookmarks, uncategorizedFolder];
  }
  
  return {
    folder: uncategorizedFolder,
    updatedBookmarks: bookmarks
  };
} 