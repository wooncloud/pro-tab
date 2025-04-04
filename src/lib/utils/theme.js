// 테마 관련 상수
export const THEME_KEY = 'pro-tabs-theme';
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';
export const THEME_SYSTEM = 'system';

/**
 * 현재 시스템 테마를 감지합니다.
 * @returns {string} 감지된 테마 ('light' 또는 'dark')
 */
export function detectSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? THEME_DARK 
    : THEME_LIGHT;
}

/**
 * 테마를 크롬 스토리지에 저장합니다.
 * @param {string} theme - 저장할 테마 ('light', 'dark', 'system')
 * @returns {Promise<void>}
 */
export async function saveTheme(theme) {
  try {
    // 크롬 확장프로그램 환경인 경우
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [THEME_KEY]: theme }, resolve);
      });
    } 
    // 일반 환경인 경우
    else {
      localStorage.setItem(THEME_KEY, theme);
    }
  } catch (error) {
    console.error('테마 저장 중 오류 발생:', error);
    // 로컬 스토리지를 폴백으로 사용
    localStorage.setItem(THEME_KEY, theme);
  }
}

/**
 * 저장된 테마를 불러옵니다.
 * @returns {Promise<string>} 저장된 테마 또는 기본값
 */
export async function loadTheme() {
  try {
    // 크롬 확장프로그램 환경인 경우
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([THEME_KEY], (result) => {
          const theme = result[THEME_KEY] || THEME_SYSTEM;
          resolve(theme);
        });
      });
    } 
    // 일반 환경인 경우
    else {
      return localStorage.getItem(THEME_KEY) || THEME_SYSTEM;
    }
  } catch (error) {
    console.error('테마 불러오기 중 오류 발생:', error);
    // 로컬 스토리지를 폴백으로 사용
    return localStorage.getItem(THEME_KEY) || THEME_SYSTEM;
  }
}

/**
 * 테마를 적용합니다.
 * @param {string} theme - 적용할 테마 ('light', 'dark', 'system')
 */
export function applyTheme(theme) {
  // 시스템 테마를 따르는 경우 실제 테마 감지
  const actualTheme = theme === THEME_SYSTEM ? detectSystemTheme() : theme;
  
  // document.documentElement에 클래스를 추가하거나 제거
  if (actualTheme === THEME_DARK) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * 시스템 테마 변경을 감지하여 자동으로 테마를 변경합니다.
 * @param {string} currentTheme - 현재 설정된 테마
 */
export function setupThemeListener(currentTheme) {
  // 시스템 테마를 따르는 경우에만 리스너 설정
  if (currentTheme === THEME_SYSTEM) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 테마 변경 이벤트 리스너
    const handleThemeChange = (e) => {
      applyTheme(THEME_SYSTEM); // 시스템 설정 반영
    };
    
    // 이벤트 리스너 등록
    mediaQuery.addEventListener('change', handleThemeChange);
    
    // 클린업 함수 반환
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }
  
  // 시스템 테마를 따르지 않는 경우에는 클린업 함수 필요 없음
  return () => {};
} 