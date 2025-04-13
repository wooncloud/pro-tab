<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Dialog from "$lib/components/ui/dialog";
  import { isValidUrl, loadBookmarks } from "./BookmarkStorage";
  import { UNCATEGORIZED_FOLDER_NAME } from "./BookmarkStorage";
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  export let editingFolder = null;
  export let editingBookmark = null;
  export let editFolderName = "";
  export let editBookmarkName = "";
  export let editBookmarkUrl = "";
  export let onSave;
  export let onClose;

  // 폴더 변경을 위한 추가 변수
  let bookmarkFolders = [];
  let selectedFolderId = null;

  // 컴포넌트 마운트 시 또는 다이얼로그가 열릴 때 폴더 목록 로드
  $: if (isOpen && editingBookmark) {
    loadBookmarkFolders();
  }

  // 폴더 목록 로드
  async function loadBookmarkFolders() {
    try {
      bookmarkFolders = await loadBookmarks();
      
      // 현재 폴더 ID 설정
      if (editingFolder) {
        selectedFolderId = editingFolder;
      }
    } catch (error) {
      console.error("폴더 목록 로드 중 오류:", error);
    }
  }

  // 폼 제출 핸들러
  function handleSubmit() {
    if (isSubmitDisabled()) return;
    
    // 북마크의 경우 선택된 폴더 ID 정보도 전달
    if (editingBookmark) {
      onSave(selectedFolderId);
    } else {
      onSave();
    }
  }

  // 저장 버튼 비활성화 체크
  function isSubmitDisabled() {
    if (editingBookmark) {
      return !editBookmarkName.trim() || !editBookmarkUrl.trim() || !isValidUrl(editBookmarkUrl);
    } else if (editingFolder) {
      return !editFolderName.trim() || (editingFolder.title === UNCATEGORIZED_FOLDER_NAME && editFolderName !== UNCATEGORIZED_FOLDER_NAME);
    }
    return true;
  }
  
  // 폼 및 입력 필드 참조
  let formElement;
  let nameInputElement;
  
  // 다이얼로그가 열릴 때 자동 포커스
  $: if (isOpen) {
    setTimeout(() => {
      if (nameInputElement) {
        nameInputElement.focus();
      }
    }, 50);
  }
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <Dialog.Content class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg">
      <form 
        bind:this={formElement}
        on:submit|preventDefault={handleSubmit}
      >
        <Dialog.Title class="text-lg font-semibold text-foreground">
          {#if editingBookmark}
            북마크 편집
          {:else if editingFolder}
            {editingFolder.title === UNCATEGORIZED_FOLDER_NAME ? '폴더 속성' : '폴더 편집'}
          {/if}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-readable-muted mb-4">
          {#if editingBookmark}
            북마크의 정보를 수정합니다.
          {:else if editingFolder}
            {editingFolder.title === UNCATEGORIZED_FOLDER_NAME ? '미분류 폴더의 속성입니다.' : '폴더의 이름을 수정합니다.'}
          {/if}
        </Dialog.Description>
        
        <div class="space-y-4">
          {#if editingBookmark}
            <!-- 북마크 편집 폼 -->
            <div class="space-y-2">
              <label for="edit-bookmark-name" class="text-sm font-medium text-foreground">북마크 이름</label>
              <Input 
                id="edit-bookmark-name"
                bind:value={editBookmarkName}
                bind:this={nameInputElement}
                placeholder="북마크 이름"
                autocomplete="off"
                class="text-foreground"
              />
            </div>
            
            <div class="space-y-2">
              <label for="edit-bookmark-url" class="text-sm font-medium text-foreground">URL</label>
              <Input 
                id="edit-bookmark-url"
                bind:value={editBookmarkUrl}
                placeholder="URL (https://...)"
                class={!isValidUrl(editBookmarkUrl) && editBookmarkUrl.trim() ? "border-destructive text-foreground" : "text-foreground"}
                autocomplete="off"
              />
              {#if !isValidUrl(editBookmarkUrl) && editBookmarkUrl.trim()}
                <p class="text-xs text-destructive">유효하지 않은 URL 형식입니다.</p>
              {/if}
            </div>
            
            <!-- 폴더 선택 드롭다운 추가 -->
            <div class="space-y-2">
              <label for="edit-bookmark-folder" class="text-sm font-medium text-foreground">폴더</label>
              <select
                id="edit-bookmark-folder"
                bind:value={selectedFolderId}
                class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              >
                {#each bookmarkFolders as folder}
                  <option value={folder.id}>{folder.title}</option>
                {/each}
              </select>
            </div>
          {:else if editingFolder}
            <!-- 폴더 편집 폼 -->
            <div class="space-y-2">
              <label for="edit-folder-name" class="text-sm font-medium text-foreground">폴더 이름</label>
              <Input 
                id="edit-folder-name"
                bind:value={editFolderName}
                bind:this={nameInputElement}
                placeholder="폴더 이름"
                disabled={editingFolder.title === UNCATEGORIZED_FOLDER_NAME}
                autocomplete="off"
                class="text-foreground"
              />
              {#if editingFolder.title === UNCATEGORIZED_FOLDER_NAME}
                <p class="text-xs text-readable-muted">미분류 폴더의 이름은 변경할 수 없습니다.</p>
              {/if}
            </div>
          {/if}
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" class="text-foreground border-input hover:bg-accent hover:text-accent-foreground" on:click={onClose}>취소</Button>
          </Dialog.Close>
          <Button 
            type="submit"
            disabled={isSubmitDisabled()}
          >
            저장
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root> 