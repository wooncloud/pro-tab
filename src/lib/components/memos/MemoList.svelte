<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Search, Plus, Calendar, ChevronDown, ChevronUp, Edit, Maximize2 } from "lucide-svelte";
  
  // Props
  export let memos = [];
  export let selectedMemoId = null;
  export let onSelectMemo;
  export let onNewMemo;
  export let searchQuery = "";
  
  // Events
  export let onSearch = (query) => {};
  export let onOpenFullScreen = null; // 메모를 전체 화면으로 열기 위한 함수
  
  // 정렬 상태
  let sortBy = "updatedAt"; // "updatedAt", "title"
  let sortDirection = "desc"; // "asc", "desc"
  
  // 필터링된 메모 계산
  $: filteredMemos = memos
    .filter(memo => {
      // 검색어 필터링
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        memo.title.toLowerCase().includes(query) || 
        memo.content.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // 정렬
      if (sortBy === "updatedAt") {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return sortDirection === "asc" 
          ? dateA - dateB 
          : dateB - dateA;
      } else if (sortBy === "title") {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
  
  // 정렬 토글 함수
  function toggleSort(field) {
    if (sortBy === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortBy = field;
      sortDirection = "desc";
    }
  }
  
  // 날짜 형식화 함수
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  
  // 메모 내용 요약 함수
  function summarizeContent(content, maxLength = 60) {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  }
  
  // 메모 선택 및 전체 화면 열기
  function handleMemoClick(memo) {
    onSelectMemo(memo.id);
    if (onOpenFullScreen) {
      onOpenFullScreen(memo);
    }
  }
</script>

<div class="flex flex-col h-full">
  <!-- 검색 및 추가 버튼 -->
  <div class="flex items-center space-x-2 mb-4">
    <div class="relative flex-1">
      <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        type="text" 
        placeholder="메모 검색..."
        class="pl-8"
        bind:value={searchQuery}
        on:input={() => onSearch(searchQuery)}
      />
    </div>
    <Button size="sm" on:click={onNewMemo}>
      <Plus class="h-4 w-4 mr-1" />
      <span>새 메모</span>
    </Button>
  </div>
  
  <!-- 메모 목록 헤더 -->
  <div class="flex items-center text-xs font-medium text-muted-foreground border-b pb-2 mb-2">
    <button 
      class="flex-1 flex items-center hover:text-foreground"
      on:click={() => toggleSort("title")}
    >
      제목
      {#if sortBy === "title"}
        {#if sortDirection === "asc"}
          <ChevronUp class="h-3 w-3 ml-1" />
        {:else}
          <ChevronDown class="h-3 w-3 ml-1" />
        {/if}
      {/if}
    </button>
    <button 
      class="w-24 flex items-center justify-end hover:text-foreground"
      on:click={() => toggleSort("updatedAt")}
    >
      수정일
      {#if sortBy === "updatedAt"}
        {#if sortDirection === "asc"}
          <ChevronUp class="h-3 w-3 ml-1" />
        {:else}
          <ChevronDown class="h-3 w-3 ml-1" />
        {/if}
      {/if}
    </button>
  </div>
  
  <!-- 메모 목록 -->
  <div class="overflow-y-auto flex-1 pr-1">
    {#if filteredMemos.length === 0}
      <div class="text-center py-8 text-muted-foreground">
        {#if memos.length === 0}
          메모가 없습니다. 새 메모를 추가해보세요!
        {:else if searchQuery}
          검색 조건에 맞는 메모가 없습니다.
        {:else}
          표시할 메모가 없습니다.
        {/if}
      </div>
    {:else}
      <ul class="space-y-1">
        {#each filteredMemos as memo (memo.id)}
          <li>
            <button 
              class="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              class:bg-muted={selectedMemoId === memo.id}
              on:click={() => handleMemoClick(memo)}
            >
              <div class="flex flex-col">
                <div class="flex justify-between items-start">
                  <h3 class="font-bold truncate">
                    {memo.title || "제목 없음"}
                  </h3>
                  <div class="text-xs text-muted-foreground flex items-center ml-2">
                    <Calendar class="h-3 w-3 mr-1" />
                    <span>{formatDate(memo.updatedAt)}</span>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground truncate opacity-75">
                  {summarizeContent(memo.content)}
                </p>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div> 