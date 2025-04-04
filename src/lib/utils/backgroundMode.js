import { writable } from 'svelte/store';

// 배경 모드 상태를 관리하는 스토어
export const isBackgroundMode = writable(false);

// 배경 모드 토글 함수
export function toggleBackgroundMode() {
  isBackgroundMode.update(value => !value);
}

// 배경 모드 설정 함수
export function setBackgroundMode(value) {
  isBackgroundMode.set(value);
} 