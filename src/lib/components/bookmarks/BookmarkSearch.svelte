<script>
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Search, X } from "lucide-svelte";
  
  export let searchQuery = "";
  export let isSearchMode = false;
  export let searchResults = [];
  export let onSearch;
  export let onClearSearch;
  
  // 엔터 키를 눌렀을 때 검색 실행
  function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
      onSearch();
    } else if (event.key === 'Escape') {
      onClearSearch();
    }
  }
</script>

<div class="space-y-2">
  <div class="relative flex-1">
    <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input 
      type="text"
      placeholder="북마크 검색..."
      bind:value={searchQuery}
      on:keydown={handleSearchKeydown}
      class="pl-8 pr-8"
    />
    {#if searchQuery}
      <button 
        class="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
        on:click={onClearSearch}
        aria-label="검색 지우기"
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>
  
  <!-- 검색 상태 표시 -->
  {#if isSearchMode}
    <div class="flex justify-between items-center text-sm text-muted-foreground">
      <span>검색 결과: {searchResults.reduce((acc, folder) => acc + folder.bookmarks.length, 0)}개</span>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" on:click={onClearSearch}>
        전체보기
      </Button>
    </div>
  {/if}
</div> 