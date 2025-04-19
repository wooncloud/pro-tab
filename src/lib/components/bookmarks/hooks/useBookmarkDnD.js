// 드래그 앤 드롭 상태 및 이벤트 커스텀 훅
// 한국어 주석, 내부 문자열은 영어로 작성
import { writable } from 'svelte/store';

export const draggedItemId = writable(null);
export const draggedItemType = writable(null); // 'folder' or 'bookmark'
export const draggedSourceFolderId = writable(null);
export const dragOverItemId = writable(null);
export const dragOverItemType = writable(null);
export const dragOverFolderId = writable(null);
export const dragOverPosition = writable('inside'); // 'before', 'inside', 'after'

// 드래그 시작 이벤트 핸들러
export function onDragStart(event, itemType, id, folderId) {
  draggedItemId.set(id);
  draggedItemType.set(itemType);
  draggedSourceFolderId.set(folderId);
  event.dataTransfer.effectAllowed = 'move';
}

// 드래그 오버 이벤트 핸들러
export function onDragOver(event, itemType, id, folderId, draggedType, draggedId) {
  if ((draggedType === itemType && draggedId === id) ||
      (draggedType === 'folder' && itemType === 'bookmark' && folderId === draggedId)) {
    return; // 자기 자신이나 자신이 속한 폴더면 무시
  }
  dragOverItemId.set(id);
  dragOverItemType.set(itemType);
  dragOverFolderId.set(folderId);
  // 마우스 위치 계산
  const rect = event.currentTarget.getBoundingClientRect();
  const mouseY = event.clientY;
  const relativeY = mouseY - rect.top;
  const height = rect.height;
  if (itemType === 'folder') {
    if (relativeY < height * 0.25) {
      dragOverPosition.set('before');
    } else if (relativeY > height * 0.75) {
      dragOverPosition.set('after');
    } else {
      dragOverPosition.set('inside');
    }
  } else {
    dragOverPosition.set(relativeY < height / 2 ? 'before' : 'after');
  }
  event.dataTransfer.dropEffect = 'move';
}

// 드래그 떠남 이벤트 핸들러
export function onDragLeave() {
  dragOverItemId.set(null);
  dragOverItemType.set(null);
  dragOverFolderId.set(null);
}

// 드롭 이벤트 핸들러
export function onDrop(event, itemType, id, folderId, draggedType, draggedId, draggedSourceId, position, handleDropCallback) {
  event.preventDefault();
  if ((draggedType === itemType && draggedId === id) ||
      (draggedType === 'folder' && itemType === 'bookmark' && folderId === draggedId)) {
    resetDragState();
    return;
  }
  handleDropCallback(); // 실제 북마크/폴더 이동 로직은 콜백으로 처리
  resetDragState();
}

// 드래그 상태 초기화
export function resetDragState() {
  draggedItemId.set(null);
  draggedItemType.set(null);
  draggedSourceFolderId.set(null);
  dragOverItemId.set(null);
  dragOverItemType.set(null);
  dragOverFolderId.set(null);
} 