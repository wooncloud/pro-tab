import { writable } from 'svelte/store';

// 현재 열려있는 컨텍스트 메뉴의 ID를 저장하는 스토어
// null이면 열려있는 메뉴가 없음을 의미
export const activeContextMenuId = writable(null); 