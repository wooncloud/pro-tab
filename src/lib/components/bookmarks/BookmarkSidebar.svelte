<script>
  import { onMount, onDestroy } from 'svelte';
  import { loadBookmarks, saveBookmarks, formatUrl, isValidUrl, getOrCreateUncategorizedFolder, UNCATEGORIZED_FOLDER_NAME } from './BookmarkStorage';
  import { checkAndSetMounted, setUnmounted, bookmarksStore } from './BookmarkSidebar.js';
  
  // 컴포넌트 임포트
  import BookmarkFolder from './BookmarkFolder.svelte';
  import BookmarkSearch from './BookmarkSearch.svelte';
  import AddBookmarkPopover from './AddBookmarkPopover.svelte';
  import AddFolderPopover from './AddFolderPopover.svelte';
  import EditDialog from './EditDialog.svelte';
  import DeleteDialog from './DeleteDialog.svelte';
  
  // 싱글톤 체크 - 컴포넌트가 이미 있으면 비어있는 div 반환
  let shouldRender = true;
  let errorMessage = "";
  
  // 북마크 데이터 및 상태
  let bookmarks = [];
  let isLoading = true;
  let loadError = null;
  
  // 검색 관련 상태
  let searchQuery = "";
  let isSearchMode = false;
  let searchResults = [];
  
  // 편집 관련 상태
  let isEditDialogOpen = false;
  let editingFolder = null;
  let editingBookmark = null;
  let editFolderName = "";
  let editBookmarkName = "";
  let editBookmarkUrl = "";
  
  // 삭제 확인 관련 상태
  let isDeleteDialogOpen = false;
  let deletingFolder = null;
  let deletingBookmark = null;
  let deletingFolderId = null;
  
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
      bookmarks = await loadBookmarks();
      // 북마크 데이터를 스토어에 저장
      bookmarksStore.set(bookmarks);
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
        const id = bookmarks.length ? Math.max(0, ...bookmarks.map(b => b.id)) + 1 : 1;
        bookmarks = [...bookmarks, { id, title: UNCATEGORIZED_FOLDER_NAME, expanded: false, bookmarks: [] }];
        saveBookmarksAndUpdateStore(bookmarks);
      }
    } else {
      const id = bookmarks.length ? Math.max(0, ...bookmarks.map(b => b.id)) + 1 : 1;
      bookmarks = [...bookmarks, { id, title: folderName, expanded: false, bookmarks: [] }];
      saveBookmarksAndUpdateStore(bookmarks);
    }
  }
  
  // 북마크 추가
  function addBookmark(folderId, bookmarkName, bookmarkUrl) {
    if (!bookmarkName.trim() || !bookmarkUrl.trim() || !isValidUrl(bookmarkUrl)) return;
    
    const formattedUrl = formatUrl(bookmarkUrl);
    
    // 루트 선택 또는 선택된 폴더에 추가
    if (folderId === null) {
      // 미분류 폴더에 추가
      const { folder: uncategorizedFolder, updatedBookmarks } = getOrCreateUncategorizedFolder(bookmarks);
      bookmarks = updatedBookmarks;
      
      // 수정된 북마크 배열 생성
      bookmarks = bookmarks.map(folder => {
        if (folder.id === uncategorizedFolder.id) {
          const bookmarkId = folder.bookmarks.length ? Math.max(...folder.bookmarks.map(b => b.id)) + 1 : 1;
          return {
            ...folder,
            expanded: true, // 자동으로 폴더 확장
            bookmarks: [...folder.bookmarks, { id: bookmarkId, title: bookmarkName, url: formattedUrl }]
          };
        }
        return folder;
      });
    } else {
      // 선택된 폴더에 추가
      bookmarks = bookmarks.map(folder => {
        if (folder.id === folderId) {
          const bookmarkId = folder.bookmarks.length ? Math.max(...folder.bookmarks.map(b => b.id)) + 1 : 1;
          return {
            ...folder,
            expanded: true, // 자동으로 폴더 확장
            bookmarks: [...folder.bookmarks, { id: bookmarkId, title: bookmarkName, url: formattedUrl }]
          };
        }
        return folder;
      });
    }
    
    // 북마크 변경 후 저장
    saveBookmarksAndUpdateStore(bookmarks);
  }
  
  // 북마크 검색 함수
  function searchBookmarks() {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }
    
    isSearchMode = true;
    const query = searchQuery.toLowerCase().trim();
    
    // 검색 결과를 저장할 임시 배열
    let results = [];
    
    // 각 폴더와 북마크를 검색
    bookmarks.forEach(folder => {
      const matchingBookmarks = folder.bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) || 
        bookmark.url.toLowerCase().includes(query)
      );
      
      if (matchingBookmarks.length > 0) {
        // 검색 결과가 있는 폴더만 추가하고 결과에 매칭되는 북마크만 포함
        results.push({
          ...folder,
          expanded: true, // 검색 결과가 있는 폴더는 자동으로 확장
          bookmarks: matchingBookmarks
        });
      }
    });
    
    searchResults = results;
  }
  
  // 검색 초기화
  function clearSearch() {
    searchQuery = "";
    isSearchMode = false;
    searchResults = [];
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
  function saveEdit() {
    if (editingBookmark) {
      // 북마크 편집 저장
      if (editBookmarkName.trim() && editBookmarkUrl.trim() && isValidUrl(editBookmarkUrl)) {
        const formattedUrl = formatUrl(editBookmarkUrl);
        bookmarks = bookmarks.map(folder => {
          if (folder.id === editingFolder) {
            return {
              ...folder,
              bookmarks: folder.bookmarks.map(bookmark => {
                if (bookmark.id === editingBookmark.id) {
                  return {
                    ...bookmark,
                    title: editBookmarkName,
                    url: formattedUrl
                  };
                }
                return bookmark;
              })
            };
          }
          return folder;
        });
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
              title: editFolderName
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

  // 북마크 삭제 확인 대화상자 열기
  function confirmDeleteBookmark(folderId, bookmark) {
    deletingFolderId = folderId;
    deletingBookmark = bookmark;
    deletingFolder = null;
    isDeleteDialogOpen = true;
  }

  // 폴더 삭제 확인 대화상자 열기
  function confirmDeleteFolder(folder) {
    deletingFolder = folder;
    deletingBookmark = null;
    deletingFolderId = null;
    isDeleteDialogOpen = true;
  }

  // 삭제 실행
  function executeDelete() {
    if (deletingBookmark) {
      // 북마크 삭제
      bookmarks = bookmarks.map(folder => {
        if (folder.id === deletingFolderId) {
          return {
            ...folder,
            bookmarks: folder.bookmarks.filter(b => b.id !== deletingBookmark.id)
          };
        }
        return folder;
      });
    } else if (deletingFolder) {
      // 미분류 폴더 삭제 방지
      if (deletingFolder.title === UNCATEGORIZED_FOLDER_NAME) {
        // 미분류 폴더는 삭제할 수 없음
        closeDeleteDialog();
        return;
      }
      
      // 폴더 삭제
      bookmarks = bookmarks.filter(folder => folder.id !== deletingFolder.id);
    }
    
    saveBookmarksAndUpdateStore(bookmarks);
    closeDeleteDialog();
  }

  // 삭제 대화상자 닫기
  function closeDeleteDialog() {
    isDeleteDialogOpen = false;
    deletingFolder = null;
    deletingBookmark = null;
    deletingFolderId = null;
  }
  
  // 북마크 저장 및 스토어 업데이트 함수
  function saveBookmarksAndUpdateStore(bookmarkData) {
    saveBookmarks(bookmarkData);
    bookmarksStore.set(bookmarkData);
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
      <!-- 상단 검색창 및 버튼 -->
      <div class="flex items-center space-x-2">
        <div class="flex-1">
          <BookmarkSearch
            bind:searchQuery
            bind:isSearchMode
            bind:searchResults
            onSearch={searchBookmarks}
            onClearSearch={clearSearch}
          />
        </div>
        
        <!-- 북마크 추가 버튼 -->
        <AddBookmarkPopover 
          {bookmarks}
          onAddBookmark={addBookmark}
        />
        
        <!-- 폴더 추가 버튼 -->
        <AddFolderPopover
          onAddFolder={addFolder}
        />
      </div>
    </div>
    
    <!-- 북마크 목록 (스크롤 가능) -->
    <div class="flex-1 overflow-hidden px-4">
      <div class="overflow-y-auto bookmark-scrollbar h-full pr-1">
        {#if isLoading}
          <div class="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>북마크 로딩 중...</p>
          </div>
        {:else if loadError}
          <div class="flex flex-col items-center justify-center h-full text-sm">
            <p class="text-destructive">오류: {loadError}</p>
            <button 
              class="mt-2 px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
              on:click={refreshData}
            >
              다시 시도
            </button>
          </div>
        {:else if isSearchMode && searchResults.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <p>검색 결과가 없습니다.</p>
          </div>
        {:else if bookmarks.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <p>저장된 북마크가 없습니다.</p>
            <p>오른쪽 상단 버튼으로 북마크를 추가해보세요.</p>
          </div>
        {:else}
          <ul class="space-y-2 pt-1">
            {#each (isSearchMode ? searchResults : bookmarks) as folder (folder.id)}
              <BookmarkFolder
                {folder}
                onToggleFolder={toggleFolder}
                onEditFolder={startEditFolder}
                onDeleteFolder={confirmDeleteFolder}
                onEditBookmark={startEditBookmark}
                onDeleteBookmark={confirmDeleteBookmark}
              />
            {/each}
          </ul>
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

  <!-- 삭제 확인 다이얼로그 -->
  <DeleteDialog
    bind:isOpen={isDeleteDialogOpen}
    bind:deletingFolder
    bind:deletingBookmark
    onDelete={executeDelete}
    onClose={closeDeleteDialog}
  />
{/if} 