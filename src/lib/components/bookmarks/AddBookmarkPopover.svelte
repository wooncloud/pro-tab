<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover";
  import { Bookmark, AlertCircle } from "lucide-svelte";
  import { isValidUrl } from "./BookmarkStorage";
  
  export let bookmarks = [];
  export let onAddBookmark;
  
  let newBookmarkName = "";
  let newBookmarkUrl = "";
  let selectedFolderId = null;
  let urlError = "";
  let bookmarkNameInput;
  let bookmarkUrlInput;
  let isOpen = false;
  
  // URL 입력란 변경 시 유효성 실시간 검사
  function handleUrlInput() {
    if (newBookmarkUrl.trim()) {
      if (!isValidUrl(newBookmarkUrl)) {
        urlError = "유효하지 않은 URL 형식입니다.";
      } else {
        urlError = "";
      }
    } else {
      urlError = "";
    }
  }
  
  // 북마크 추가 함수
  function addBookmark() {
    if (newBookmarkName.trim() && newBookmarkUrl.trim() && !urlError) {
      onAddBookmark(selectedFolderId, newBookmarkName, newBookmarkUrl);
      
      // 입력 필드 초기화
      newBookmarkName = "";
      newBookmarkUrl = "";
      urlError = "";
      isOpen = false;
    }
  }
  
  // URL 입력란으로 포커스 이동
  function focusUrlInput() {
    if (newBookmarkName.trim() && bookmarkUrlInput) {
      bookmarkUrlInput.focus();
    }
  }
  
  // 팝오버가 열릴 때 입력란에 포커스
  $: if (isOpen && bookmarkNameInput) {
    setTimeout(() => {
      bookmarkNameInput.focus();
    }, 50);
  }
</script>

<Popover.Root bind:open={isOpen}>
  <Popover.Trigger asChild let:builder>
    <Button variant="outline" size="icon" builders={[builder]} title="북마크 추가">
      <Bookmark class="h-4 w-4" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-72 p-4">
    <form on:submit|preventDefault={addBookmark}>
      <div class="grid gap-4">
        <h4 class="font-medium">북마크 추가</h4>
        
        <div class="grid gap-2">
          <div class="space-y-2">
            <select
              bind:value={selectedFolderId}
              class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={null}>미분류에 추가</option>
              {#each bookmarks as folder}
                <option value={folder.id}>{folder.title}</option>
              {/each}
            </select>
          </div>
          
          <div class="space-y-2">
            <Input 
              type="text" 
              placeholder="북마크 이름" 
              bind:value={newBookmarkName}
              bind:this={bookmarkNameInput}
              on:blur={focusUrlInput}
              autocomplete="off"
            />
          </div>
          
          <div class="space-y-1">
            <div class="relative">
              <Input 
                type="text" 
                placeholder="URL (https://...)" 
                bind:value={newBookmarkUrl}
                bind:this={bookmarkUrlInput}
                on:input={handleUrlInput}
                autocomplete="off"
                class={urlError ? "border-destructive" : ""}
              />
              {#if urlError}
                <div class="absolute right-2 top-2 text-destructive">
                  <AlertCircle class="h-4 w-4" />
                </div>
              {/if}
            </div>
            {#if urlError}
              <p class="text-xs text-destructive">{urlError}</p>
            {/if}
          </div>
          
          <Button 
            type="submit"
            disabled={!newBookmarkName || !newBookmarkUrl || urlError}
            class="w-full"
          >
            추가
          </Button>
        </div>
      </div>
    </form>
  </Popover.Content>
</Popover.Root> 