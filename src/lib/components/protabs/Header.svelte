<script>
  import { Button } from "$lib/components/ui/button";
  import Weather from "$lib/components/protabs/Weather.svelte";
  import SearchBox from "$lib/components/protabs/SearchBox.svelte";
  import ThemeToggle from "$lib/components/protabs/ThemeToggle.svelte";
  
  // 날씨 데이터 (기본값)
  let weather = { condition: "로딩 중...", temperature: "", location: "" };
  
  // 검색 이벤트 핸들러
  function handleSearch(event) {
    console.log('검색:', event.detail);
  }
</script>

<header class="p-4 flex justify-between items-center border-b">
  <div class="flex items-center space-x-6">
    <!-- 날씨 정보 -->
    <Weather bind:weather />
    
    <!-- 검색 -->
    <SearchBox on:search={handleSearch} />
  </div>
  
  <div class="flex items-center space-x-2">
    <!-- 테마 전환 버튼 -->
    <ThemeToggle />
    
    <!-- 설정 버튼 -->
    <Button variant="ghost" size="sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      <span class="ml-2">설정</span>
    </Button>
  </div>
</header> 