<script>
  import { bookmarks } from './bookmarkStore.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from "$lib/components/ui/dialog";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Plus, FolderPlus } from 'lucide-svelte';
  // onMount는 bookmarkStore에서 초기 로드를 수행하므로 주석 처리합니다.
  // import { onMount } from 'svelte'; 
  import * as Popover from "$lib/components/ui/popover";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import BookmarkItem from './BookmarkItem.svelte';
  import BookmarkFolder from './BookmarkFolder.svelte';

  let bookmarkName = "";
  let bookmarkUrl = "";
  let folderName = "";

  let isAddBookmarkPopoverOpen = false;
  let isAddFolderPopoverOpen = false;

  let isEditDialogOpen = false;
  let editingItem = null; 
  let editedName = "";
  let editedUrl = ""; // 북마크 편집 시에만 사용

  let isDeleteDialogOpen = false;
  let deletingItem = null;

  // Popover 내부 input 요소에 대한 참조
  let bookmarkNameInputEl;
  let bookmarkUrlInputEl;
  let folderNameInputEl;
  let editNameInputEl;
  let editUrlInputEl;


  /**
   * URL이 유효한 형식인지 확인합니다.
   * @param {string} urlString - 검사할 URL 문자열
   * @returns {boolean} 유효하면 true, 아니면 false
   */
  function isValidUrl(urlString) {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
  }
  }

  function getFaviconUrl(urlString) {
    try {
      const url = new URL(urlString);
      return `${url.protocol}//${url.hostname}/favicon.ico`;
    } catch (e) {
      return ""; // URL 형식이 잘못된 경우 빈 문자열 반환
    }
  }

  function handleSaveNewBookmark() {
    if (!bookmarkName.trim() || !bookmarkUrl.trim()) {
      alert("이름과 URL을 모두 입력해주세요.");
      return;
      }

    if (!isValidUrl(bookmarkUrl)) {
      alert("유효한 URL 형식이 아닙니다. (예: https://example.com)");
      return;
    }

    const newBookmark = {
      id: crypto.randomUUID(),
      name: bookmarkName.trim(),
      type: 'url',
      url: bookmarkUrl.trim(),
      meta_info: {
        faviconUrl: getFaviconUrl(bookmarkUrl.trim())
      },
      // expanded는 폴더에만 해당될 수 있으나, 일관성을 위해 북마크에도 추가해둘 수 있습니다. 
      // 다만 현재 사용처가 없으므로 제거하거나, 혹은 나중에 활용 가능성을 열어둘 수 있습니다. 여기서는 제거합니다.
    };

    bookmarks.update(currentBookmarks => [...currentBookmarks, newBookmark]);
    
    // console.log('New bookmark added (with favicon attempt):', newBookmark);
    
    bookmarkName = "";
    bookmarkUrl = "";
    isAddBookmarkPopoverOpen = false; 
  }

  function handleSaveNewFolder() {
    if (!folderName.trim()) {
      alert("폴더 이름을 입력해주세요.");
      return;
    }
    const newFolder = {
      id: crypto.randomUUID(),
      name: folderName.trim(),
      type: 'folder',
      children: [],
      expanded: true // 새 폴더는 기본적으로 펼쳐진 상태로
    };
    bookmarks.update(currentBookmarks => [...currentBookmarks, newFolder]);
    // console.log('New folder added:', newFolder);
    folderName = "";
    isAddFolderPopoverOpen = false;
  }

  function openEditDialog(item) {
    editingItem = item;
    editedName = item.name;
    if (item.type === 'url') {
      editedUrl = item.url;
    }
    isEditDialogOpen = true;
  }

  function handleSaveChanges() {
    if (!editingItem) return;
    if (!editedName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    const updateRecursively = (items, targetId, updater) => {
      return items.map(item => {
        if (item.id === targetId) {
          return updater(item);
        }
        if (item.children) {
          return { ...item, children: updateRecursively(item.children, targetId, updater) };
                  }
        return item;
      });
    };

    if (editingItem.type === 'url') {
      if (!editedUrl.trim() || !isValidUrl(editedUrl)) {
        alert("유효한 URL을 입력해주세요.");
        return;
      }
      bookmarks.update(currentBookmarks => 
        updateRecursively(currentBookmarks, editingItem.id, item => ({ 
          ...item, 
          name: editedName.trim(), 
          url: editedUrl.trim(),
          meta_info: { faviconUrl: getFaviconUrl(editedUrl.trim()) } 
        }))
      );
    } else if (editingItem.type === 'folder') {
      bookmarks.update(currentBookmarks => 
        updateRecursively(currentBookmarks, editingItem.id, item => ({ 
          ...item, 
          name: editedName.trim() 
        }))
      );
    }
    isEditDialogOpen = false;
    editingItem = null; // 편집 후 상태 초기화
  }

  function openDeleteDialog(item) {
    deletingItem = item;
    isDeleteDialogOpen = true;
      }

  function handleConfirmDelete() {
    if (!deletingItem) return;

    const removeRecursively = (items, targetId) => {
      return items.filter(item => item.id !== targetId).map(item => {
        if (item.children) {
          return { ...item, children: removeRecursively(item.children, targetId) };
          }
        return item;
        });
    };

    bookmarks.update(currentBookmarks => removeRecursively(currentBookmarks, deletingItem.id));
    isDeleteDialogOpen = false;
    deletingItem = null; // 삭제 후 상태 초기화
  }

  // onMount(() => {
    // loadBookmarks(); // bookmarkStore.js에서 이미 초기 로드를 수행함
  // });

  function handleAddBookmarkPopoverOpenChange(event) {
    isAddBookmarkPopoverOpen = event.detail.open;
    if (!isAddBookmarkPopoverOpen) {
      bookmarkName = "";
      bookmarkUrl = "";
    } else {
      // Popover가 열릴 때 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        bookmarkNameInputEl?.focus();
      }, 0);
    }
  }

  function handleAddFolderPopoverOpenChange(event) {
    isAddFolderPopoverOpen = event.detail.open;
    if (!isAddFolderPopoverOpen) {
      folderName = "";
    } else {
      setTimeout(() => {
        folderNameInputEl?.focus();
      }, 0);
    }
  }

  function handleEditDialogClose() {
    // 다이얼로그가 닫힐 때 editingItem 등을 초기화하는 로직은 handleSaveChanges 또는 취소 버튼에 이미 있음
    // isEditDialogOpen = false; // 이것은 Dialog의 bind:open에 의해 자동으로 처리됨
    // editingItem = null; // 이미 handleSaveChanges 또는 취소 시 처리
  }
  
  // 엔터 키 핸들러 함수들
  function handleBookmarkNameEnter(event) {
    if (event.key === 'Enter') {
      bookmarkUrlInputEl?.focus();
  }
  }

  function handleBookmarkUrlEnter(event) {
    if (event.key === 'Enter') {
      handleSaveNewBookmark();
  }
  }

  function handleFolderNameEnter(event) {
    if (event.key === 'Enter') {
      handleSaveNewFolder();
  }
  }

  function handleEditNameEnter(event) {
    if (event.key === 'Enter') {
      if (editingItem && editingItem.type === 'url') {
        editUrlInputEl?.focus();
      } else {
        handleSaveChanges();
      }
    }
  }
  
  function handleEditUrlEnter(event) {
    if (event.key === 'Enter') {
      handleSaveChanges();
        }
      }

</script>

<aside class="w-80 border-r h-full flex flex-col bg-background text-foreground">
  <div class="p-2 border-b border-border flex items-center justify-end space-x-1">
    <Popover.Root bind:open={isAddBookmarkPopoverOpen} onOpenChange={handleAddBookmarkPopoverOpenChange}>
      <Popover.Trigger asChild let:builder>
        <Button variant="ghost" size="icon" title="Add Bookmark" builders={[builder]}>
          <Plus class="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-72">
        <div class="grid gap-4">
          <div class="space-y-2">
            <h4 class="font-medium leading-none">북마크 추가</h4>
            <p class="text-sm text-muted-foreground">
              새로운 북마크의 이름과 URL을 입력하세요.
            </p>
          </div>
          <div class="grid gap-2">
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="bookmarkNamePopover">이름</Label>
              <Input bind:this={bookmarkNameInputEl} id="bookmarkNamePopover" bind:value={bookmarkName} class="col-span-2 h-8" placeholder="예: Svelte 공식" on:keydown={handleBookmarkNameEnter} />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="bookmarkUrlPopover">URL</Label>
              <Input bind:this={bookmarkUrlInputEl} id="bookmarkUrlPopover" bind:value={bookmarkUrl} class="col-span-2 h-8" placeholder="https://svelte.dev" on:keydown={handleBookmarkUrlEnter} />
            </div>
          </div>
          <Button on:click={handleSaveNewBookmark}>저장</Button>
        </div>
      </Popover.Content>
    </Popover.Root>

    <Popover.Root bind:open={isAddFolderPopoverOpen} onOpenChange={handleAddFolderPopoverOpenChange}>
      <Popover.Trigger asChild let:builder>
        <Button variant="ghost" size="icon" title="Add Folder" builders={[builder]}>
          <FolderPlus class="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-72">
        <div class="grid gap-4">
          <div class="space-y-2">
            <h4 class="font-medium leading-none">폴더 추가</h4>
            <p class="text-sm text-muted-foreground">
              새로운 폴더의 이름을 입력하세요.
            </p>
          </div>
          <div class="grid gap-2">
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="folderNamePopover">이름</Label>
              <Input bind:this={folderNameInputEl} id="folderNamePopover" bind:value={folderName} class="col-span-2 h-8" placeholder="예: 개발 관련" on:keydown={handleFolderNameEnter} />
            </div>
          </div>
          <Button on:click={handleSaveNewFolder}>저장</Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  </div>

  <!-- 북마크 목록 표시 영역 -->
  <div class="flex-1 overflow-y-auto p-2 space-y-1 bookmark-scrollbar">
    {#if $bookmarks.length === 0}
      <div class="text-sm text-muted-foreground text-center py-4">
        북마크가 없습니다.
      </div>
    {:else}
      {#each $bookmarks as item (item.id)}
        {#if item.type === 'folder'}
          <BookmarkFolder 
            folder={item} 
            on:edit={(e) => openEditDialog(e.detail)} 
            on:delete={(e) => openDeleteDialog(e.detail)}
          />
        {:else if item.type === 'url'}
          <BookmarkItem 
            bookmark={item} 
            on:edit={(e) => openEditDialog(e.detail)} 
            on:delete={(e) => openDeleteDialog(e.detail)} 
          />
        {/if}
      {/each}
    {/if}
  </div>
</aside>

{#if editingItem}
  <Dialog.Root bind:open={isEditDialogOpen} onOpenChange={(e) => { if (!e.detail.open) editingItem = null; /* 다이얼로그 닫힐 때 editingItem 초기화 */ }}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>{editingItem.type === 'url' ? '북마크 편집' : '폴더 편집'}</Dialog.Title>
        <Dialog.Description>
          {editingItem.type === 'url' ? '북마크의 이름과 URL을 수정하세요.' : '폴더의 이름을 수정하세요.'}
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="editName" class="text-right">이름</Label>
          <Input bind:this={editNameInputEl} id="editName" bind:value={editedName} class="col-span-3" on:keydown={handleEditNameEnter} />
        </div>
        {#if editingItem.type === 'url'}
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="editUrl" class="text-right">URL</Label>
            <Input bind:this={editUrlInputEl} id="editUrl" bind:value={editedUrl} class="col-span-3" on:keydown={handleEditUrlEnter} />
          </div>
        {/if}
      </div>
      <Dialog.Footer>
        <Button variant="outline" on:click={() => { isEditDialogOpen = false; editingItem = null; }}>취소</Button>
        <Button on:click={handleSaveChanges}>변경사항 저장</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{/if}

{#if deletingItem}
  <AlertDialog.Root bind:open={isDeleteDialogOpen} onOpenChange={(e) => { if(!e.detail.open) deletingItem = null; }}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>정말로 삭제하시겠습니까?</AlertDialog.Title>
        <AlertDialog.Description>
          이 작업은 되돌릴 수 없습니다. '{deletingItem.name}'
          {deletingItem.type === 'folder' ? '폴더와 그 안의 모든 북마크가' : '북마크가'}
          영구적으로 삭제됩니다.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel on:click={() => {isDeleteDialogOpen = false; deletingItem = null;}}>취소</AlertDialog.Cancel>
        <AlertDialog.Action on:click={handleConfirmDelete} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">삭제</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

<style>
  .bookmark-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted)) transparent; /* shadcn-svelte 변수 사용 시도 */
  }
  
  .bookmark-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted)); /* shadcn-svelte 변수 사용 시도 */
    border-radius: 3px;
  }
  
  .bookmark-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--accent)); /* shadcn-svelte 변수 사용 시도 */
  }
</style>