<script>
  export let bookmark;
  import { Link } from 'lucide-svelte';
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { activeContextMenuId } from './contextMenuStore.js';
  import { writable } from 'svelte/store';

  const dispatch = createEventDispatcher();
  let faviconError = false;
  let isMenuOpen = false; // 로컬 상태로 메뉴 열림 관리
  const menuId = bookmark.id; // 각 메뉴의 고유 ID

  let unsubscribe;

  onMount(() => {
    unsubscribe = activeContextMenuId.subscribe(id => {
      if (id !== menuId && isMenuOpen) {
        isMenuOpen = false; // 다른 메뉴가 열리면 이 메뉴를 닫음
      }
    });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function handleFaviconError() {
    faviconError = true;
  }

  function dispatchEdit(event) {
    // event.preventDefault(); // ContextMenu.Item의 on:select는 기본 동작이 없으므로 필요 X
    dispatch('edit', bookmark);
    isMenuOpen = false; // 메뉴 항목 선택 후 닫기
  }

  function dispatchDelete(event) {
    // event.preventDefault();
    dispatch('delete', bookmark);
    isMenuOpen = false; // 메뉴 항목 선택 후 닫기
  }

  function handleClick(event) {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return; 
    }
    event.preventDefault();
    window.location.href = bookmark.url;
  }

  function handleMenuOpenChange(event) {
    const newOpenState = event.detail.open;
    if (newOpenState) {
      activeContextMenuId.set(menuId); // 이 메뉴가 열렸음을 알림
    }
    isMenuOpen = newOpenState;
  }

</script>

<ContextMenu.Root bind:open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
  <ContextMenu.Trigger>
    <a 
      href={bookmark.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      class="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer no-underline text-current"
      on:click={handleClick} 
      draggable="false"
    >
      {#if bookmark.meta_info && bookmark.meta_info.faviconUrl && !faviconError}
        <img 
          src={bookmark.meta_info.faviconUrl} 
          alt=""
          class="w-4 h-4"
          on:error={handleFaviconError}
          draggable="false"
        />
      {:else}
        <Link class="w-4 h-4 text-muted-foreground" />
      {/if}
      <span class="text-sm truncate" draggable="false">{bookmark.name}</span>
    </a>
  </ContextMenu.Trigger>
  <ContextMenu.Content class="w-48">
    <ContextMenu.Item on:select={dispatchEdit}>편집</ContextMenu.Item>
    <ContextMenu.Item on:select={dispatchDelete} class="text-destructive">삭제</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root> 