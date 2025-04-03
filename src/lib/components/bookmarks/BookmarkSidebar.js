import { writable } from 'svelte/store';

// 북마크 사이드바가 이미 마운트되었는지 추적하는 스토어
export const isBookmarkSidebarMounted = writable(false);

// 북마크 데이터를 전역적으로 공유하기 위한 스토어
export const bookmarksStore = writable([]);

// 북마크 사이드바가 이미 마운트되었는지 확인하는 함수
export function checkAndSetMounted() {
    let isMounted = false;
    
    isBookmarkSidebarMounted.update(current => {
        if (current) {
            isMounted = true;
            return current;
        }
        return true;
    });
    
    return !isMounted; // 이미 마운트되어 있으면 false, 아니면 true 반환
}

// 북마크 사이드바가 언마운트될 때 호출할 함수
export function setUnmounted() {
    isBookmarkSidebarMounted.set(false);
} 