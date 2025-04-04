<script>
  import { onMount, onDestroy } from 'svelte';
  import { X, Search, Loader2, Check } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { 
    closeBackgroundSelector, 
    searchUnsplashImages, 
    getPopularUnsplashImages,
    setBackgroundImage
  } from '$lib/utils/backgroundImage';
  
  // 상태 변수
  let images = [];
  let isLoading = false;
  let hasError = false;
  let errorMessage = '';
  let currentPage = 1;
  let searchQuery = '';
  let totalPages = 0;
  let loadingMore = false;
  let searchMode = false;
  
  // 스크롤 이벤트를 위한 변수
  let scrollContainer;
  let scrollListener;
  
  // 컴포넌트 마운트 시 이미지 로드
  onMount(async () => {
    await loadInitialImages();
    setupScrollListener();
  });
  
  // 컴포넌트 해제 시 리스너 제거
  onDestroy(() => {
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener);
    }
  });
  
  // 초기 이미지 로드
  async function loadInitialImages() {
    try {
      isLoading = true;
      hasError = false;
      
      const data = await getPopularUnsplashImages(1, 20);
      images = data;
      currentPage = 1;
      
      // API 응답에 total_pages가 있으면 사용, 없으면 기본값 10
      totalPages = data.total_pages || 10;
      
    } catch (error) {
      hasError = true;
      errorMessage = error.message || '이미지를 불러오는 중 오류가 발생했습니다.';
      console.error('이미지 로드 오류:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // 이미지 검색
  async function handleSearch() {
    if (!searchQuery.trim()) {
      // 검색어가 비어있으면 인기 이미지 로드
      searchMode = false;
      await loadInitialImages();
      return;
    }
    
    try {
      isLoading = true;
      hasError = false;
      
      const data = await searchUnsplashImages(searchQuery.trim(), 1, 20);
      images = data.results;
      currentPage = 1;
      totalPages = data.total_pages;
      searchMode = true;
      
    } catch (error) {
      hasError = true;
      errorMessage = error.message || '이미지 검색 중 오류가 발생했습니다.';
      console.error('이미지 검색 오류:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // 추가 이미지 로드 (스크롤 페이징)
  async function loadMoreImages() {
    if (loadingMore || currentPage >= totalPages) return;
    
    try {
      loadingMore = true;
      const nextPage = currentPage + 1;
      
      let newImages;
      if (searchMode && searchQuery) {
        const data = await searchUnsplashImages(searchQuery, nextPage, 20);
        newImages = data.results;
      } else {
        const data = await getPopularUnsplashImages(nextPage, 20);
        newImages = data;
      }
      
      images = [...images, ...newImages];
      currentPage = nextPage;
      
    } catch (error) {
      console.error('추가 이미지 로드 오류:', error);
    } finally {
      loadingMore = false;
    }
  }
  
  // 스크롤 감지 설정
  function setupScrollListener() {
    scrollListener = () => {
      if (!scrollContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      // 스크롤이 80% 이상 내려갔을 때 추가 이미지 로드
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        loadMoreImages();
      }
    };
    
    window.addEventListener('scroll', scrollListener);
  }
  
  // 이미지 선택 핸들러
  function selectImage(image) {
    // 배경 이미지로 설정
    setBackgroundImage(image);
    
    // 이미지 선택 후 셀렉터 닫기
    closeBackgroundSelector();
  }
  
  // Enter 키로 검색 실행
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div 
  class="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex flex-col overflow-hidden"
  bind:this={scrollContainer}
>
  <!-- 헤더 -->
  <div class="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-background/80 backdrop-blur-sm">
    <h2 class="text-2xl font-bold">배경 이미지 선택</h2>
    
    <div class="flex items-center gap-4">
      <!-- 검색 필드 -->
      <div class="relative w-64">
        <Input
          type="text"
          placeholder="이미지 검색..."
          bind:value={searchQuery}
          on:keydown={handleKeyDown}
          class="pr-10"
        />
        <button 
          class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          on:click={handleSearch}
        >
          <Search class="h-4 w-4" />
        </button>
      </div>
      
      <!-- 닫기 버튼 -->
      <Button variant="ghost" size="icon" on:click={closeBackgroundSelector}>
        <X class="h-5 w-5" />
        <span class="sr-only">닫기</span>
      </Button>
    </div>
  </div>
  
  <!-- 본문 (이미지 그리드) -->
  <div class="flex-1 overflow-y-auto p-4">
    {#if isLoading && !loadingMore}
      <!-- 초기 로딩 중 -->
      <div class="flex flex-col items-center justify-center h-full">
        <Loader2 class="h-10 w-10 animate-spin text-primary mb-4" />
        <p>이미지를 불러오는 중...</p>
      </div>
    {:else if hasError}
      <!-- 에러 상태 -->
      <div class="flex flex-col items-center justify-center h-full">
        <p class="text-destructive mb-4">{errorMessage}</p>
        <Button on:click={loadInitialImages}>다시 시도</Button>
      </div>
    {:else if images.length === 0}
      <!-- 이미지 없음 -->
      <div class="flex flex-col items-center justify-center h-full">
        <p class="mb-4">표시할 이미지가 없습니다.</p>
        {#if searchMode}
          <Button on:click={loadInitialImages}>인기 이미지 보기</Button>
        {/if}
      </div>
    {:else}
      <!-- 이미지 그리드 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each searchMode ? images : images as image (image.id)}
          <button 
            class="relative group overflow-hidden rounded-lg aspect-[3/2] cursor-pointer hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary focus:outline-none"
            on:click={() => selectImage(image)}
            aria-label={`배경 이미지 선택: ${image.alt_description || '배경 이미지'}`}
          >
            <img 
              src={image.urls.small} 
              alt={image.alt_description || '배경 이미지'} 
              class="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            <!-- 이미지 메타데이터 (호버 시 표시) -->
            <div class="absolute inset-0 bg-black/50 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="text-white text-sm truncate max-w-full">
                {#if image.user && image.user.name}
                  <span>Photo by {image.user.name}</span>
                {/if}
              </div>
              <div class="bg-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Check class="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </button>
        {/each}
      </div>
      
      <!-- 추가 로딩 표시 -->
      {#if loadingMore}
        <div class="flex justify-center items-center py-6">
          <Loader2 class="h-6 w-6 animate-spin text-primary mr-2" />
          <span>추가 이미지를 불러오는 중...</span>
        </div>
      {/if}
    {/if}
  </div>
</div> 