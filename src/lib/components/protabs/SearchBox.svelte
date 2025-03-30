<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { createEventDispatcher } from "svelte";
  
  // 검색어
  let searchQuery = "";
  
  // 선택된 검색 엔진
  let selectedEngine = "google";
  
  // 검색 엔진 목록
  const searchEngines = [
    { id: "google", name: "Google", url: "https://www.google.com/search?q=" },
    { id: "naver", name: "Naver", url: "https://search.naver.com/search.naver?query=" },
    { id: "daum", name: "Daum", url: "https://search.daum.net/search?q=" },
    { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=" },
    { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" }
  ];
  
  // 검색 엔진 선택 토글
  let showEngineSelector = false;
  
  // 이벤트 디스패처 생성
  const dispatch = createEventDispatcher();
  
  // 구글 검색 함수
  function search() {
    if (searchQuery.trim()) {
      // 선택된 검색 엔진 찾기
      const engine = searchEngines.find(e => e.id === selectedEngine);
      const searchUrl = `${engine.url}${encodeURIComponent(searchQuery)}`;
      
      // 검색 이벤트 발생
      dispatch('search', { query: searchQuery, engine: selectedEngine, url: searchUrl });
      
      // 새 탭에서 검색 결과 열기
      window.open(searchUrl, "_blank");
    }
  }
  
  // 검색 엔진 변경 함수
  function changeEngine(engineId) {
    selectedEngine = engineId;
    showEngineSelector = false;
  }
  
  // 엔터 키 처리
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      search();
    }
  }
  
  // 현재 선택된 검색 엔진 정보 가져오기
  $: currentEngine = searchEngines.find(e => e.id === selectedEngine);
</script>

<div class="flex items-center">
  <!-- 검색 엔진 선택기 -->
  <div class="relative mr-2">
    <!-- 현재 선택된 검색 엔진 로고 -->
    <button 
      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none"
      on:click={() => showEngineSelector = !showEngineSelector}
      aria-label="검색 엔진 선택"
    >
      {#if selectedEngine === "google"}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-6 h-6">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      {:else if selectedEngine === "naver"}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-6 h-6">
          <path d="M16 8V16H13.5V11.91L10.5 16H8V8H10.5V12.09L13.5 8H16Z" fill="#03C75A" />
          <rect x="1" y="1" width="22" height="22" rx="2" ry="2" fill="transparent" stroke="#03C75A" stroke-width="2" />
        </svg>
      {:else if selectedEngine === "daum"}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-6 h-6">
          <circle cx="12" cy="12" r="11" fill="#FC2E31" />
          <path d="M12 6H16V9H12V12H15V15H12V18H9V15H6V12H9V9H12V6Z" fill="white" />
        </svg>
      {:else if selectedEngine === "bing"}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-6 h-6">
          <path d="M7 4.27V17.73L11.27 19.8L11.33 19.73L17 15.27V11.27L12 13.73L10 12.73V5.27L7 4.27Z" fill="#008373" />
        </svg>
      {:else if selectedEngine === "duckduckgo"}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-6 h-6">
          <circle cx="12" cy="12" r="11" fill="#DE5833" />
          <path d="M15 8.5C15 10.2 13.7 11.5 12 11.5S9 10.2 9 8.5 10.3 5.5 12 5.5 15 6.8 15 8.5Z" fill="white" />
          <path d="M10 14.5V17.5H14V14.5H10Z" fill="white" />
        </svg>
      {/if}
    </button>
    
    <!-- 검색 엔진 선택 드롭다운 -->
    {#if showEngineSelector}
      <div class="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border z-10">
        {#each searchEngines as engine}
          <button
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            on:click={() => changeEngine(engine.id)}
          >
            <span class={selectedEngine === engine.id ? "font-bold" : ""}>
              {engine.name}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 검색창 -->
  <div class="flex space-x-2">
    <Input 
      type="text" 
      placeholder="{currentEngine.name} 검색..." 
      bind:value={searchQuery}
      on:keypress={handleKeyPress}
      class="w-64"
    />
    <Button 
      on:click={search}
    >
      검색
    </Button>
  </div>
</div> 