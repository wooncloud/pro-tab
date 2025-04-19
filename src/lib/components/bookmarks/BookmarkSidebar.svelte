<script>
  import { onMount, onDestroy } from 'svelte';
  import { 
    formatUrl, isValidUrl, getFaviconUrl, generateUUID
  } from './storage/BookmarkUtils';
  import { getOrCreateUncategorizedFolder, UNCATEGORIZED_FOLDER_NAME } from './storage/BookmarkModel';
  import { sortByOrder, handleDragDrop } from './storage/BookmarkDnD';
  import { checkAndSetMounted, setUnmounted } from './BookmarkSidebar.js';
  import { fetchBookmarks, persistBookmarks, bookmarksStore } from './hooks/useBookmarkStore.js';
  
  // 컴포넌트 임포트
  import BookmarkFolder from './BookmarkFolder.svelte';
  import BookmarkFolderList from './BookmarkFolderList.svelte';
  import EditDialog from './EditDialog.svelte';
  import BookmarkSidebarHeader from './BookmarkSidebarHeader.svelte';
  import BookmarkLoadingState from './BookmarkLoadingState.svelte';
  import BookmarkErrorState from './BookmarkErrorState.svelte';
  import BookmarkEmptyState from './BookmarkEmptyState.svelte';
  
  // 검색 관련 상태: 커스텀 훅 스토어로 대체
  import { searchQuery, isSearchMode, searchResults, searchBookmarks as doSearchBookmarks, clearSearch as doClearSearch } from './hooks/useBookmarkSearch.js';
  
  // 드래그 앤 드롭 관련 상태: 커스텀 훅 스토어로 대체
  import {
    draggedItemId, draggedItemType, draggedSourceFolderId,
    dragOverItemId, dragOverItemType, dragOverFolderId, dragOverPosition,
    onDragStart as dndOnDragStart, onDragOver as dndOnDragOver, onDrop as dndOnDrop, onDragLeave as dndOnDragLeave, resetDragState
  } from './hooks/useBookmarkDnD.js';
  
  // 싱글톤 체크 - 컴포넌트가 이미 있으면 비어있는 div 반환
  let shouldRender = true;
  let errorMessage = "";
  
  // 북마크 데이터 및 상태
  let bookmarks = [];
  let isLoading = true;
  let loadError = null;
  
  // 편집 관련 상태
  let isEditDialogOpen = false;
  let editingFolder = null;
  let editingBookmark = null;
  let editFolderName = "";
  let editBookmarkName = "";
  let editBookmarkUrl = "";
  
  // 정렬된 북마크 생성
  $: sortedBookmarks = sortByOrder(bookmarks);
  $: sortedSearchResults = $isSearchMode ? sortByOrder($searchResults) : [];
  
  // 컴포넌트 마운트 시 확인
  onMount(() => {
    shouldRender = checkAndSetMounted();
    
    if (!shouldRender) {
      errorMessage = "북마크 사이드바가 이미 열려 있습니다.";
      return;
    }
    
    // 북마크 데이터 로드
    loadData();
    
    // 북마크 스토어 구독하여 데이터 동기화
    const unsubscribe = bookmarksStore.subscribe(value => {
      // 스토어에 데이터가 있고 현재 로딩 중이 아니면 데이터 업데이트
      if (value && value.length > 0 && !isLoading) {
        bookmarks = value;
      }
    });
    
    return unsubscribe;
  });
  
  // 컴포넌트 언마운트 시 상태 초기화
  onDestroy(() => {
    setUnmounted();
  });
  
  // 북마크 데이터 로드
  async function loadData() {
    try {
      isLoading = true;
      loadError = null;
      
      // 북마크 로드
      bookmarks = await fetchBookmarks();
    } catch (error) {
      console.error("북마크 로드 중 오류:", error);
      loadError = error.message || "북마크 데이터를 불러오는 중 오류가 발생했습니다.";
    } finally {
      isLoading = false;
    }
  }
  
  // 북마크 데이터 새로고침
  function refreshData() {
    loadData();
  }
  
  // 상단 검색/추가 영역에서 사용할 이벤트 핸들러(임시)
  function handleSearch(query) {
    searchQuery.set(query);
    doSearchBookmarks(bookmarks, query);
  }
  function handleClearSearch() {
    doClearSearch();
  }
  function handleAddBookmark(folderId, name, url) {
    addBookmark(folderId, name, url);
  }
  function handleAddFolder(folderName) {
    addFolder(folderName);
  }
  
  // 폴더 토글 함수
  function toggleFolder(id) {
    bookmarks = bookmarks.map(folder => {
      if (folder.id === id) {
        return { ...folder, expanded: !folder.expanded };
      }
      return folder;
    });
    saveBookmarksAndUpdateStore(bookmarks);
  }
  
  // 새 폴더 추가
  function addFolder(folderName) {
    if (!folderName.trim()) return;
    
    // 미분류 이름으로 폴더를 추가하려고 하는 경우 체크
    if (folderName.trim() === UNCATEGORIZED_FOLDER_NAME) {
      if (!bookmarks.some(folder => folder.title === UNCATEGORIZED_FOLDER_NAME)) {
        // 미분류 폴더 생성
        const maxOrder = bookmarks.length ? Math.max(...bookmarks.map(b => b.order || 0)) + 1 : 0;
        const newFolder = {
          id: generateUUID(),
          title: UNCATEGORIZED_FOLDER_NAME,
          expanded: true,
          order: maxOrder,
          createdAt: new Date().toISOString(),
          bookmarks: []
        };
        bookmarks = [...bookmarks, newFolder];
        saveBookmarksAndUpdateStore(bookmarks);
      }
    } else {
      // 일반 폴더 생성
      const maxOrder = bookmarks.length ? Math.max(...bookmarks.map(b => b.order || 0)) + 1 : 0;
      const newFolder = {
        id: generateUUID(),
        title: folderName,
        expanded: true,
        order: maxOrder,
        createdAt: new Date().toISOString(),
        bookmarks: []
      };
      bookmarks = [...bookmarks, newFolder];
      saveBookmarksAndUpdateStore(bookmarks);
    }
  }
  
  // 북마크 추가
  function addBookmark(folderId, bookmarkName, bookmarkUrl) {
    if (!bookmarkName.trim() || !bookmarkUrl.trim() || !isValidUrl(bookmarkUrl)) return;
    
    const formattedUrl = formatUrl(bookmarkUrl);
    const faviconUrl = getFaviconUrl(formattedUrl);
    
    // 루트 선택 또는 선택된 폴더에 추가
    if (folderId === null) {
      // 미분류 폴더에 추가
      const { folder: uncategorizedFolder, updatedBookmarks } = getOrCreateUncategorizedFolder(bookmarks);
      bookmarks = updatedBookmarks;
      
      // 수정된 북마크 배열 생성
      bookmarks = bookmarks.map(folder => {
        if (folder.id === uncategorizedFolder.id) {
          const maxOrder = folder.bookmarks.length 
            ? Math.max(...folder.bookmarks.map(b => b.order || 0)) + 1 
            : 0;
            
          const newBookmark = {
            id: generateUUID(),
            title: bookmarkName,
            url: formattedUrl,
            faviconUrl: faviconUrl,
            order: maxOrder,
            createdAt: new Date().toISOString()
          };
          
          return {
            ...folder,
            expanded: true, // 자동으로 폴더 확장
            bookmarks: [...folder.bookmarks, newBookmark]
          };
        }
        return folder;
      });
    } else {
      // 선택된 폴더에 추가
      bookmarks = bookmarks.map(folder => {
        if (folder.id === folderId) {
          const maxOrder = folder.bookmarks.length 
            ? Math.max(...folder.bookmarks.map(b => b.order || 0)) + 1 
            : 0;
            
          const newBookmark = {
            id: generateUUID(),
            title: bookmarkName,
            url: formattedUrl,
            faviconUrl: faviconUrl,
            order: maxOrder,
            createdAt: new Date().toISOString()
          };
          
          return {
            ...folder,
            expanded: true, // 자동으로 폴더 확장
            bookmarks: [...folder.bookmarks, newBookmark]
          };
        }
        return folder;
      });
    }
    
    // 북마크 변경 후 저장
    saveBookmarksAndUpdateStore(bookmarks);
  }
  
  // 북마크 편집 시작
  function startEditBookmark(folderId, bookmark) {
    editingFolder = folderId;
    editingBookmark = bookmark;
    editBookmarkName = bookmark.title;
    editBookmarkUrl = bookmark.url;
    isEditDialogOpen = true;
  }

  // 폴더 편집 시작
  function startEditFolder(folder) {
    editingFolder = folder;
    editingBookmark = null;
    editFolderName = folder.title;
    isEditDialogOpen = true;
  }

  // 편집 저장
  function saveEdit(newFolderId) {
    if (editingBookmark) {
      // 북마크 편집 저장
      if (editBookmarkName.trim() && editBookmarkUrl.trim() && isValidUrl(editBookmarkUrl)) {
        const formattedUrl = formatUrl(editBookmarkUrl);
        
        // URL이 변경되었는지 확인
        const urlChanged = formattedUrl !== editingBookmark.url;
        
        // 파비콘 URL - URL이 변경되었을 때만 업데이트
        const faviconUrl = urlChanged ? getFaviconUrl(formattedUrl) : editingBookmark.faviconUrl;
        
        // 폴더 변경이 없는 경우
        if (!newFolderId || newFolderId === editingFolder) {
          bookmarks = bookmarks.map(folder => {
            if (folder.id === editingFolder) {
              return {
                ...folder,
                bookmarks: folder.bookmarks.map(bookmark => {
                  if (bookmark.id === editingBookmark.id) {
                    return {
                      ...bookmark,
                      title: editBookmarkName,
                      url: formattedUrl,
                      faviconUrl: faviconUrl,
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return bookmark;
                })
              };
            }
            return folder;
          });
        } else {
          // 폴더 변경이 있는 경우 - 기존 폴더에서 제거하고 새 폴더에 추가
          const updatedBookmark = {
            ...editingBookmark,
            title: editBookmarkName,
            url: formattedUrl,
            faviconUrl: faviconUrl,
            updatedAt: new Date().toISOString()
          };
          
          // 1. 먼저 기존 폴더에서 북마크 제거
          bookmarks = bookmarks.map(folder => {
            if (folder.id === editingFolder) {
              return {
                ...folder,
                bookmarks: folder.bookmarks.filter(b => b.id !== editingBookmark.id)
              };
            }
            return folder;
          });
          
          // 2. 새 폴더에 북마크 추가
          bookmarks = bookmarks.map(folder => {
            if (folder.id === newFolderId) {
              // 순서 값 구하기
              const maxOrder = folder.bookmarks.length 
                ? Math.max(...folder.bookmarks.map(b => b.order || 0)) + 1 
                : 0;
                
              const bookmarkWithOrder = {
                ...updatedBookmark,
                order: maxOrder
              };
              
              return {
                ...folder,
                expanded: true, // 새 폴더는 자동으로 확장
                bookmarks: [...folder.bookmarks, bookmarkWithOrder]
              };
            }
            return folder;
          });
        }
        
        saveBookmarksAndUpdateStore(bookmarks);
      }
    } else if (editingFolder) {
      // 폴더 편집 저장
      if (editFolderName.trim()) {
        // 미분류 폴더 이름 변경 방지
        if (editingFolder.title === UNCATEGORIZED_FOLDER_NAME && editFolderName !== UNCATEGORIZED_FOLDER_NAME) {
          // 미분류 폴더는 이름을 변경할 수 없음
          return;
        }
        
        bookmarks = bookmarks.map(folder => {
          if (folder.id === editingFolder.id) {
            return {
              ...folder,
              title: editFolderName,
              updatedAt: new Date().toISOString()
            };
          }
          return folder;
        });
        saveBookmarksAndUpdateStore(bookmarks);
      }
    }
    closeEditDialog();
  }

  // 편집 대화상자 닫기
  function closeEditDialog() {
    isEditDialogOpen = false;
    editingFolder = null;
    editingBookmark = null;
    editFolderName = "";
    editBookmarkName = "";
    editBookmarkUrl = "";
  }

  // 북마크 직접 삭제 (다이얼로그 없이)
  function deleteBookmark(folderId, bookmark) {
    // 북마크 삭제
    bookmarks = bookmarks.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          bookmarks: folder.bookmarks.filter(b => b.id !== bookmark.id)
        };
      }
      return folder;
    });
    
    saveBookmarksAndUpdateStore(bookmarks);
  }

  // 폴더 직접 삭제 (다이얼로그 없이)
  function deleteFolder(folder) {
    // 미분류 폴더 삭제 방지
    if (folder.title === UNCATEGORIZED_FOLDER_NAME) {
      // 미분류 폴더는 삭제할 수 없음
      return;
    }
    
    // 폴더 삭제
    bookmarks = bookmarks.filter(f => f.id !== folder.id);
    saveBookmarksAndUpdateStore(bookmarks);
  }
  
  // 북마크 저장 및 스토어 업데이트 함수
  function saveBookmarksAndUpdateStore(bookmarkData) {
    persistBookmarks(bookmarkData);
  }

  // 드래그 앤 드롭 핸들러 래퍼: 실제 북마크 이동 로직은 기존대로 처리
  function handleSidebarDragStart(event, itemType, id, folderId) {
    dndOnDragStart(event, itemType, id, folderId);
  }
  function handleSidebarDragOver(event, itemType, id, folderId) {
    dndOnDragOver(event, itemType, id, folderId, $draggedItemType, $draggedItemId);
  }
  function handleSidebarDrop(event, itemType, id, folderId) {
    dndOnDrop(
      event, itemType, id, folderId,
      $draggedItemType, $draggedItemId, $draggedSourceFolderId, $dragOverPosition,
      () => {
        try {
          const updatedBookmarks = handleDragDrop(
            bookmarks,
            $draggedItemType,
            $draggedItemId,
            $draggedSourceFolderId,
            itemType,
            id,
            folderId,
            $dragOverPosition
          );
          saveBookmarksAndUpdateStore(updatedBookmarks);
        } catch (error) {
          console.error('드래그 앤 드롭 처리 중 오류:', error);
        }
      }
    );
  }
</script>

<style>
  .bookmark-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d4d4d8 transparent;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-thumb {
    background-color: #d4d4d8;
    border-radius: 6px;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a1a1aa;
  }
</style>

{#if !shouldRender}
  <div class="w-80 border-r h-full flex items-center justify-center">
    <p class="text-sm text-muted-foreground">{errorMessage}</p>
  </div>
{:else}
  <aside class="w-80 border-r h-full flex flex-col">
    <div class="p-4 pb-2">
      <!-- 상단 검색/추가 영역 분리: BookmarkSidebarHeader로 대체 예정 -->
      <BookmarkSidebarHeader
        searchQuery={$searchQuery}
        {bookmarks}
        on:search={e => handleSearch(e.detail)}
        on:clearSearch={handleClearSearch}
        on:addBookmark={e => handleAddBookmark(e.detail.folderId, e.detail.name, e.detail.url)}
        on:addFolder={e => handleAddFolder(e.detail)}
      />
    </div>
    
    <!-- 북마크 목록 (스크롤 가능) -->
    <div class="flex-1 overflow-hidden px-4">
      <div class="overflow-y-auto bookmark-scrollbar h-full pr-1">
        {#if isLoading}
          <BookmarkLoadingState />
        {:else if loadError}
          <BookmarkErrorState errorMessage={loadError} onRetry={refreshData} />
        {:else if $isSearchMode && sortedSearchResults.length === 0}
          <BookmarkEmptyState message="No search results found." subMessage={null} />
        {:else if bookmarks.length === 0}
          <BookmarkEmptyState message="No bookmarks saved." subMessage="Click the button above to add a bookmark." />
        {:else}
          <BookmarkFolderList
            folders={$isSearchMode ? sortedSearchResults : sortedBookmarks}
            draggedItemId={draggedItemId}
            dragOverItemId={dragOverItemId}
            dragOverPosition={dragOverPosition}
            on:toggleFolder={e => toggleFolder(e.detail)}
            on:editFolder={e => startEditFolder(e.detail)}
            on:deleteFolder={e => deleteFolder(e.detail)}
            on:editBookmark={e => startEditBookmark(e.detail.folderId, e.detail.bookmark)}
            on:deleteBookmark={e => deleteBookmark(e.detail.folderId, e.detail.bookmark)}
            on:dragStart={e => handleSidebarDragStart(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
            on:dragOver={e => handleSidebarDragOver(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
            on:drop={e => handleSidebarDrop(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
          />
        {/if}
      </div>
    </div>
  </aside>

  <!-- 편집 다이얼로그 -->
  <EditDialog
    bind:isOpen={isEditDialogOpen}
    bind:editingFolder
    bind:editingBookmark
    bind:editFolderName
    bind:editBookmarkName
    bind:editBookmarkUrl
    onSave={saveEdit}
    onClose={closeEditDialog}
  />
{/if} 