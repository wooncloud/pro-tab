<script>
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { ChevronDown, ChevronRight, FolderOpen, Edit, Trash2 } from "lucide-svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import { UNCATEGORIZED_FOLDER_NAME } from "./storage/BookmarkModel";
  
  export let folder;
  export let onToggleFolder;
  export let onEditFolder;
  export let onDeleteFolder;
  export let onEditBookmark;
  export let onDeleteBookmark;
  export let onDragStart = () => {}; // 드래그 시작 이벤트 핸들러
  export let onDragOver = () => {}; // 드래그 오버 이벤트 핸들러
  export let onDrop = () => {}; // 드롭 이벤트 핸들러
  export let onDragLeave = () => {}; // 드래그 떠남 이벤트 핸들러
  export let isDragging = false; // 현재 드래그 중인지 여부
  export let isDropTarget = false; // 현재 드롭 대상인지 여부
  export let dropPosition = 'inside'; // 드롭 위치 (before, inside, after)

  // 드래그 시작 처리
  function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      id: folder.id,
      type: 'folder'
    }));
    onDragStart(event, 'folder', folder.id);
  }

  // 드래그 오버 처리
  function handleDragOver(event) {
    event.preventDefault();
    onDragOver(event, 'folder', folder.id);
  }

  // 드롭 처리
  function handleDrop(event) {
    event.preventDefault();
    onDrop(event, 'folder', folder.id);
  }

  // 드래그 떠남 처리
  function handleDragLeave(event) {
    onDragLeave(event);
  }

  // 드롭 위치에 따른 CSS 클래스 계산
  $: dropPositionClass = isDropTarget 
    ? dropPosition === 'before' 
      ? 'border-t-2 border-primary' 
      : dropPosition === 'after' 
        ? 'border-b-2 border-primary' 
        : 'bg-primary/10'
    : '';
</script>

<li 
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:dragleave={handleDragLeave}
  class="transition-opacity {isDragging ? 'opacity-50' : ''} {dropPositionClass}"
>
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <div 
        class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer" 
        on:click={() => onToggleFolder(folder.id)}
        on:keydown={(e) => e.key === 'Enter' && onToggleFolder(folder.id)}
        role="button"
        tabindex="0"
      >
        <div class="flex items-center">
          <FolderOpen class="h-4 w-4 mr-2 text-primary" />
          <span class="font-medium">{folder.title}</span>
        </div>
        {#if folder.expanded}
          <ChevronDown class="h-4 w-4 text-primary" />
        {:else}
          <ChevronRight class="h-4 w-4 text-primary" />
        {/if}
      </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item 
        disabled={folder.title === UNCATEGORIZED_FOLDER_NAME}
        on:click={() => onEditFolder(folder)}
      >
        <Edit class="h-4 w-4 mr-2" />
        폴더 편집
      </ContextMenu.Item>
      <ContextMenu.Item 
        disabled={folder.title === UNCATEGORIZED_FOLDER_NAME}
        class="text-destructive focus:text-destructive" 
        on:click={() => onDeleteFolder(folder)}
      >
        <Trash2 class="h-4 w-4 mr-2" />
        폴더 삭제
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
  
  {#if folder.expanded}
    <ul class="ml-6 mt-1 space-y-1">
      {#if !folder.bookmarks || folder.bookmarks.length === 0}
        <li class="p-2 text-sm text-readable-muted italic">
          북마크가 없습니다.
        </li>
      {:else}
        {#each folder.bookmarks as bookmark (bookmark.id)}
          <BookmarkItem 
            {bookmark}
            folderId={folder.id}
            onEditBookmark={onEditBookmark}
            onDeleteBookmark={onDeleteBookmark}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
            isDragging={isDragging && bookmark.id === isDragging}
            isDropTarget={isDropTarget && bookmark.id === isDropTarget}
            dropPosition={dropPosition}
          />
        {/each}
      {/if}
    </ul>
  {/if}
</li> 