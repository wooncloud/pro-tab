import { writable } from 'svelte/store';

// 배경 이미지 상태를 관리하는 스토어
export const isBackgroundSelectorOpen = writable(false);
export const currentBackgroundImage = writable(null);

// 배경 이미지 셀렉터 토글 함수
export function toggleBackgroundSelector() {
  isBackgroundSelectorOpen.update(value => !value);
}

// 배경 이미지 셀렉터 열기
export function openBackgroundSelector() {
  isBackgroundSelectorOpen.set(true);
}

// 배경 이미지 셀렉터 닫기
export function closeBackgroundSelector() {
  isBackgroundSelectorOpen.set(false);
}

// Unsplash API 기본 URL
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Unsplash에서 이미지 검색
 * @param {string} query - 검색어
 * @param {number} page - 페이지 번호
 * @param {number} perPage - 페이지당 이미지 수
 * @returns {Promise<Object>} 검색 결과
 */
export async function searchUnsplashImages(query = 'nature', page = 1, perPage = 20) {
  try {
    const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error('Unsplash API 키가 설정되지 않았습니다.');
    }
    
    const url = `${UNSPLASH_API_URL}/search/photos?query=${query}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Unsplash 이미지 검색 중 오류 발생:', error);
    throw error;
  }
}

/**
 * Unsplash에서 인기 이미지 가져오기
 * @param {number} page - 페이지 번호
 * @param {number} perPage - 페이지당 이미지 수
 * @returns {Promise<Object>} 이미지 목록
 */
export async function getPopularUnsplashImages(page = 1, perPage = 20) {
  try {
    const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error('Unsplash API 키가 설정되지 않았습니다.');
    }
    
    const url = `${UNSPLASH_API_URL}/photos?order_by=popular&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Unsplash 인기 이미지 가져오기 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 배경 이미지 설정
 * @param {Object} image - 설정할 이미지 객체
 */
export function setBackgroundImage(image) {
  // 이미지 정보 저장
  currentBackgroundImage.set(image);
  
  // 로컬 스토리지에 저장
  try {
    localStorage.setItem('background-image', JSON.stringify(image));
  } catch (error) {
    console.error('배경 이미지 저장 중 오류 발생:', error);
  }
}

/**
 * 저장된 배경 이미지 불러오기
 * @returns {Object|null} 저장된 이미지 정보
 */
export function loadBackgroundImage() {
  try {
    const savedImage = localStorage.getItem('background-image');
    
    if (savedImage) {
      const image = JSON.parse(savedImage);
      currentBackgroundImage.set(image);
      return image;
    }
    
    return null;
  } catch (error) {
    console.error('배경 이미지 불러오기 중 오류 발생:', error);
    return null;
  }
} 