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
  let isFormValid = false;
  
  // 폼 유효성 검사 함수
  function updateFormValidity() {
    const nameValid = newBookmarkName.trim().length > 0;
    const urlValid = newBookmarkUrl.trim().length > 0 && !urlError;
    isFormValid = nameValid && urlValid;
    console.log('북마크 폼 유효성:', { nameValid, urlValid, isFormValid });
  }
  
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
    updateFormValidity();
  }
  
  // 이름 입력란 변경 시 유효성 검사
  function handleNameInput() {
    updateFormValidity();
  }
  
  // 반응형 유효성 검사 - 값이 변경될 때마다 유효성 검사
  $: {
    if (newBookmarkName !== undefined || newBookmarkUrl !== undefined) {
      updateFormValidity();
    }
  }
  
  // 북마크 추가 함수
  function addBookmark() {
    if (!isFormValid) return;
    
    onAddBookmark(selectedFolderId, newBookmarkName, newBookmarkUrl);
    
    // 입력 필드 초기화
    newBookmarkName = "";
    newBookmarkUrl = "";
    urlError = "";
    isOpen = false;
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
  
  // 폼 제출 핸들러
  function handleSubmit(event) {
    event.preventDefault();
    if (isFormValid) {
      addBookmark();
    }
  }
  
  // 엔터 키 처리
  function handleKeyDown(event) {
    if (event.key === 'Enter' && isFormValid) {
      event.preventDefault();
      addBookmark();
    }
  }
</script>

<Popover.Root bind:open={isOpen}>
  <Popover.Trigger asChild let:builder>
    <Button variant="outline" size="icon" builders={[builder]} title="북마크 추가">
      <Bookmark class="h-4 w-4" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-72 p-4">
    <form on:submit={handleSubmit}>
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
              on:input={handleNameInput}
              on:keydown={handleKeyDown}
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
                on:keydown={handleKeyDown}
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
            disabled={!isFormValid}
            class="w-full"
          >
            추가
          </Button>
          
          <!-- 디버그 정보 (개발 환경에서만 표시) -->
          {#if process.env.NODE_ENV === 'development'}
            <div class="text-xs text-muted-foreground bg-muted/30 p-2 rounded mt-2">
              <div>이름: {newBookmarkName || '(없음)'}</div>
              <div>URL: {newBookmarkUrl || '(없음)'}</div>
              <div>URL 오류: {urlError || '없음'}</div>
              <div>폼 유효성: {isFormValid ? '✓' : '✗'}</div>
            </div>
          {/if}
        </div>
      </div>
    </form>
  </Popover.Content>
</Popover.Root> 