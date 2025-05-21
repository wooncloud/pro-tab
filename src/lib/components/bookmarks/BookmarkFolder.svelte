<script>
  export let folder;
  export let level = 0; // 중첩 수준 (들여쓰기 용도)

  import { Folder, ChevronRight, ChevronDown } from 'lucide-svelte';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import BookmarkItem from './BookmarkItem.svelte';
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { activeContextMenuId } from './contextMenuStore.js';
  // 자기 자신을 import 할 수 없으므로, 렌더링은 BookmarkSidebar.svelte 에서 <svelte:self> 또는 유사한 방식으로 처리하거나,
  // 별도의 렌더링 헬퍼 컴포넌트를 고려해야 합니다. 여기서는 children 데이터를 BookmarkSidebar에서 처리하도록 구조를 유지합니다.
  // 이 컴포넌트는 단일 폴더의 표시와 그 직접적인 children의 반복 렌더링만 담당합니다.

  const dispatch = createEventDispatcher();
  let isOpen = folder.expanded !== undefined ? folder.expanded : true; // 초기 expanded 상태, 없으면 true
  let isMenuOpen = false; // 컨텍스트 메뉴 열림 상태
  const menuId = folder.id; // 각 메뉴의 고유 ID

  let unsubscribeContextMenu;

  onMount(() => {
    unsubscribeContextMenu = activeContextMenuId.subscribe(id => {
      if (id !== menuId && isMenuOpen) {
        isMenuOpen = false; // 다른 메뉴가 열리면 이 메뉴를 닫음
      }
    });
  });

  onDestroy(() => {
    if (unsubscribeContextMenu) {
      unsubscribeContextMenu();
    }
  });

  function toggleOpen(event) {
    // ContextMenuTrigger 내부에서 클릭 이벤트가 발생한 경우 토글하지 않도록 함
    // 또는 ContextMenu.Trigger에 on:click|stopPropagation 추가 고려
    if (event.target.closest('[data-radix-svelte-context-menu-trigger]')) {
      // 만약 클릭된 요소가 ContextMenuTrigger의 일부라면, 폴더 열림/닫힘 로직을 실행하지 않음
      // 하지만 ContextMenu.Trigger 자체가 div를 감싸므로, 실제로는 div 클릭 시 열림/닫힘이 발생.
      // 이 부분은 UX적으로 좀 더 세밀한 조정이 필요할 수 있음. 예를 들어, 아이콘 영역만 토글 담당.
    }
    isOpen = !isOpen;
  }

  function handleEdit() {
    dispatch('edit', folder);
    isMenuOpen = false; // 메뉴 항목 선택 후 닫기
  }

  function handleDelete() {
    dispatch('delete', folder);
    isMenuOpen = false; // 메뉴 항목 선택 후 닫기
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
    <div class="w-full">
      <div 
        class="flex items-center space-x-1 p-2 rounded-md hover:bg-muted cursor-pointer"
        style="padding-left: {level * 16 + 8}px;" 
        on:click={toggleOpen} 
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && toggleOpen()}
      >
        {#if isOpen}
          <ChevronDown class="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        {:else}
          <ChevronRight class="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        {/if}
        <Folder class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm truncate">{folder.name}</span>
      </div>
    </div>
  </ContextMenu.Trigger>
  <ContextMenu.Content class="w-48">
    <ContextMenu.Item on:select={handleEdit}>편집</ContextMenu.Item>
    <ContextMenu.Item on:select={handleDelete} class="text-destructive">삭제</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>

<!-- Collapsible 부분은 ContextMenu.Root 바깥으로 이동해야 할 수 있음 -->
<!-- 또는 ContextMenuTrigger가 폴더 이름 부분만 감싸도록 수정 -->
<!-- 현재 구조에서는 폴더 전체(자식 포함)가 ContextMenu의 트리거가 될 수 있음 -->
<!-- 여기서는 폴더 이름 행만 트리거가 되도록 수정 시도 -->

<Collapsible.Root bind:open={isOpen} class="w-full">
  <Collapsible.Content class="pl-4 pt-1 space-y-1" style="padding-left: {level * 16 + 8 + 4}px;">
    {#if folder.children && folder.children.length > 0}
      {#each folder.children as child (child.id)}
        {#if child.type === 'folder'}
          <svelte:self folder={child} level={level + 1} on:edit on:delete />
        {:else if child.type === 'url'}
          <BookmarkItem bookmark={child} on:edit on:delete />
        {/if}
      {/each}
    {:else if isOpen}
      <div class="text-xs text-muted-foreground pl-5 py-1">폴더가 비어있습니다.</div>
    {/if}
  </Collapsible.Content>
</Collapsible.Root> 