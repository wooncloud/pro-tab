// 북마크/폴더 드래그 앤 드롭 관련 함수
import { createFolder, UNCATEGORIZED_FOLDER_NAME } from './BookmarkModel';

// order 값 기준 정렬
export function sortByOrder(items) {
  return [...items].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });
}

// 폴더 이동 처리
function moveFolder(folders, sourceId, targetId, position) {
  // 폴더 인덱스 찾기
  const updatedFolders = [...folders];
  const fromIdx = updatedFolders.findIndex(f => f.id === sourceId);
  const toIdx = updatedFolders.findIndex(f => f.id === targetId);
  if (fromIdx === -1 || toIdx === -1 || sourceId === targetId) return folders;
  const [moved] = updatedFolders.splice(fromIdx, 1);
  const insertIdx = position === 'before' ? toIdx : toIdx + 1;
  updatedFolders.splice(insertIdx, 0, moved);
  // order 재정렬
  updatedFolders.forEach((folder, idx) => { folder.order = idx; });
  return updatedFolders;
}

// 북마크를 폴더에 추가
function addBookmarkToFolder(folder, bookmark, position = 'inside', targetBookmarkId = null) {
  const bookmarks = [...folder.bookmarks];
  if (position === 'inside' || targetBookmarkId === null) {
    bookmarks.push(bookmark);
  } else {
    const idx = bookmarks.findIndex(b => b.id === targetBookmarkId);
    if (idx === -1) {
      bookmarks.push(bookmark);
    } else {
      const insertIdx = position === 'before' ? idx : idx + 1;
      bookmarks.splice(insertIdx, 0, bookmark);
    }
  }
  // order 재정렬
  bookmarks.forEach((b, i) => { b.order = i; });
  return { ...folder, bookmarks };
}

// 북마크 이동 처리
function moveBookmark(folders, sourceId, sourceFolderId, targetType, targetId, targetFolderId, position) {
  const updatedFolders = [...folders];
  const fromFolderIdx = updatedFolders.findIndex(f => f.id === sourceFolderId);
  if (fromFolderIdx === -1) return folders;
  const fromFolder = updatedFolders[fromFolderIdx];
  const bookmarkIdx = fromFolder.bookmarks.findIndex(b => b.id === sourceId);
  if (bookmarkIdx === -1) return folders;
  const [movedBookmark] = fromFolder.bookmarks.splice(bookmarkIdx, 1);

  if (targetType === 'folder') {
    const toFolderIdx = updatedFolders.findIndex(f => f.id === targetId);
    if (toFolderIdx === -1) return folders;
    if (position === 'inside') {
      // 폴더 내부로 이동
      updatedFolders[toFolderIdx] = addBookmarkToFolder(updatedFolders[toFolderIdx], movedBookmark);
    } else {
      // 폴더 사이에 새 폴더 생성
      if (fromFolder.bookmarks.length === 0 && fromFolder.title !== UNCATEGORIZED_FOLDER_NAME) {
        updatedFolders.splice(fromFolderIdx, 1);
      }
      const newFolder = createFolder(movedBookmark.title);
      newFolder.bookmarks = [movedBookmark];
      const insertIdx = position === 'before' ? toFolderIdx : toFolderIdx + 1;
      updatedFolders.splice(insertIdx, 0, newFolder);
    }
  } else if (targetType === 'bookmark') {
    const toFolderIdx = updatedFolders.findIndex(f => f.id === targetFolderId);
    if (toFolderIdx === -1) return folders;
    const toFolder = updatedFolders[toFolderIdx];
    const targetBookmarkIdx = toFolder.bookmarks.findIndex(b => b.id === targetId);
    if (targetBookmarkIdx === -1) return folders;
    // 같은 폴더 내 이동
    if (sourceFolderId === targetFolderId) {
      updatedFolders[toFolderIdx] = addBookmarkToFolder(toFolder, movedBookmark, position, targetId);
    } else {
      updatedFolders[toFolderIdx] = addBookmarkToFolder(toFolder, movedBookmark, position, targetId);
      // 원본 폴더가 비었으면 삭제
      if (fromFolder.bookmarks.length === 0 && fromFolder.title !== UNCATEGORIZED_FOLDER_NAME) {
        const idx = updatedFolders.findIndex(f => f.id === sourceFolderId);
        if (idx !== -1) updatedFolders.splice(idx, 1);
      }
    }
  }
  // order 재정렬
  updatedFolders.forEach((folder, idx) => { folder.order = idx; });
  return updatedFolders;
}

// 메인 드래그 앤 드롭 핸들러
export function handleDragDrop(folders, sourceType, sourceId, sourceFolderId, targetType, targetId, targetFolderId, position) {
  // 폴더 이동
  if (sourceType === 'folder') {
    if (targetType === 'folder' || targetType === 'bookmark') {
      return moveFolder(folders, sourceId, targetType === 'folder' ? targetId : targetFolderId, position);
    }
  }
  // 북마크 이동
  else if (sourceType === 'bookmark') {
    return moveBookmark(folders, sourceId, sourceFolderId, targetType, targetId, targetFolderId, position);
  }
  // 그 외는 변경 없음
  return folders;
} 