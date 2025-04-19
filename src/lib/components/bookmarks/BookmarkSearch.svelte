<script>
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Search, X } from "lucide-svelte";
  import { createEventDispatcher } from 'svelte';
  
  export let searchQuery = "";
  export let onClearSearch;
  
  const dispatch = createEventDispatcher();
  
  // 엔터 키를 눌렀을 때 검색 실행
  function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
      dispatch('search', searchQuery);
    } else if (event.key === 'Escape') {
      if (typeof onClearSearch === 'function') onClearSearch();
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
        on:click={() => { if (typeof onClearSearch === 'function') onClearSearch(); }}
        aria-label="검색 지우기"
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>
</div> 