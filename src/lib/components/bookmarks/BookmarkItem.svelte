<script>
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { ExternalLink, Edit, Trash2, Link } from "lucide-svelte";
  
  export let bookmark;
  export let folderId;
  export let onEditBookmark;
  export let onDeleteBookmark;
  export let onDragStart = () => {}; // 드래그 시작 이벤트 핸들러
  export let onDragOver = () => {}; // 드래그 오버 이벤트 핸들러
  export let onDrop = () => {}; // 드롭 이벤트 핸들러
  export let onDragLeave = () => {}; // 드래그 떠남 이벤트 핸들러
  export let isDragging = false; // 현재 드래그 중인지 여부
  export let isDropTarget = false; // 현재 드롭 대상인지 여부
  export let dropPosition = 'inside'; // 드롭 위치 (before, inside, after)
  
  // 파비콘 로드 오류 처리
  let faviconError = false;
  
  function handleFaviconError() {
    faviconError = true;
  }

  // 드래그 시작 처리
  function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      id: bookmark.id,
      type: 'bookmark',
      folderId: folderId
    }));
    onDragStart(event, 'bookmark', bookmark.id, folderId);
  }

  // 드래그 오버 처리
  function handleDragOver(event) {
    event.preventDefault();
    onDragOver(event, 'bookmark', bookmark.id, folderId);
  }

  // 드롭 처리
  function handleDrop(event) {
    event.preventDefault();
    onDrop(event, 'bookmark', bookmark.id, folderId);
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
      <a 
        href={bookmark.url} 
        class="flex items-center p-2 hover:bg-muted/70 rounded-md text-sm group transition-colors duration-200" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {#if bookmark.faviconUrl && !faviconError}
          <img 
            src={bookmark.faviconUrl} 
            alt="" 
            class="h-4 w-4 mr-1.5 flex-shrink-0"
            on:error={handleFaviconError}
          />
        {:else}
          <Link class="h-3.5 w-3.5 mr-1.5 text-primary opacity-70 group-hover:opacity-100 flex-shrink-0" />
        {/if}
        <span class="font-medium group-hover:text-primary truncate">{bookmark.title}</span>
      </a>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item on:click={() => window.open(bookmark.url, '_blank')}>
        <ExternalLink class="h-4 w-4 mr-2" />
        새 탭에서 열기
      </ContextMenu.Item>
      <ContextMenu.Item on:click={() => onEditBookmark(folderId, bookmark)}>
        <Edit class="h-4 w-4 mr-2" />
        북마크 편집
      </ContextMenu.Item>
      <ContextMenu.Item 
        class="text-destructive focus:text-destructive" 
        on:click={() => onDeleteBookmark(folderId, bookmark)}
      >
        <Trash2 class="h-4 w-4 mr-2" />
        북마크 삭제
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
</li> 