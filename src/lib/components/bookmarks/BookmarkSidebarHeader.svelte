<script>
  // 북마크 사이드바 상단: 검색창, 북마크/폴더 추가 버튼 담당
  // 한국어 주석, UI 문자열은 영어로 작성
  import BookmarkSearch from './BookmarkSearch.svelte';
  import AddBookmarkPopover from './AddBookmarkPopover.svelte';
  import AddFolderPopover from './AddFolderPopover.svelte';

  export let searchQuery = "";
  export let bookmarks = [];

  // 검색 이벤트
  function onSearch(query) {
    // 부모로 검색 쿼리 전달
    dispatch('search', query);
  }
  function onClearSearch() {
    dispatch('clearSearch');
  }
  // 북마크 추가 이벤트
  function onAddBookmark(folderId, name, url) {
    dispatch('addBookmark', { folderId, name, url });
  }
  // 폴더 추가 이벤트
  function onAddFolder(folderName) {
    dispatch('addFolder', folderName);
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<!-- 상단 검색창 및 버튼 UI -->
<div class="flex items-center space-x-2">
  <div class="flex-1">
    <BookmarkSearch
      bind:searchQuery
      on:search={e => onSearch(e.detail)}
      on:clearSearch={onClearSearch}
    />
  </div>
  <!-- 북마크 추가 버튼 -->
  <AddBookmarkPopover 
    {bookmarks}
    on:addBookmark={({ detail }) => onAddBookmark(detail.folderId, detail.name, detail.url)}
  />
  <!-- 폴더 추가 버튼 -->
  <AddFolderPopover
    on:addFolder={({ detail }) => onAddFolder(detail)}
  />
</div> 