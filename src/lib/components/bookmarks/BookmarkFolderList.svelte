<script>
  // 폴더/북마크 목록 전체를 렌더링하는 컴포넌트
  // 한국어 주석, UI 문자열은 영어로 작성
  import BookmarkFolder from './BookmarkFolder.svelte';
  import { createEventDispatcher } from 'svelte';

  export let folders = [];
  export let draggedItemId = null;
  export let dragOverItemId = null;
  export let dragOverPosition = 'inside';

  const dispatch = createEventDispatcher();

  // 각 폴더에서 발생하는 이벤트를 상위로 전달
  function handleToggleFolder(id) {
    dispatch('toggleFolder', id);
  }
  function handleEditFolder(folder) {
    dispatch('editFolder', folder);
  }
  function handleDeleteFolder(folder) {
    dispatch('deleteFolder', folder);
  }
  function handleEditBookmark(folderId, bookmark) {
    dispatch('editBookmark', { folderId, bookmark });
  }
  function handleDeleteBookmark(folderId, bookmark) {
    dispatch('deleteBookmark', { folderId, bookmark });
  }
  function handleDragStart(event, itemType, id, folderId) {
    dispatch('dragStart', { event, itemType, id, folderId });
  }
  function handleDragOver(event, itemType, id, folderId) {
    dispatch('dragOver', { event, itemType, id, folderId });
  }
  function handleDrop(event, itemType, id, folderId) {
    dispatch('drop', { event, itemType, id, folderId });
  }
  function handleDragLeave() {
    dispatch('dragLeave');
  }
</script>

<ul class="space-y-2 pt-1">
  {#each folders as folder (folder.id)}
    <BookmarkFolder
      {folder}
      on:toggleFolder={() => handleToggleFolder(folder.id)}
      on:editFolder={() => handleEditFolder(folder)}
      on:deleteFolder={() => handleDeleteFolder(folder)}
      on:editBookmark={e => handleEditBookmark(folder.id, e.detail)}
      on:deleteBookmark={e => handleDeleteBookmark(folder.id, e.detail)}
      on:dragStart={e => handleDragStart(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
      on:dragOver={e => handleDragOver(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
      on:drop={e => handleDrop(e.detail.event, e.detail.itemType, e.detail.id, e.detail.folderId)}
      on:dragLeave={handleDragLeave}
      isDragging={draggedItemId === folder.id}
      isDropTarget={dragOverItemId === folder.id}
      dropPosition={dragOverPosition}
    />
  {/each}
</ul> 