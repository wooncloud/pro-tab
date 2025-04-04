<script>
  import { onMount } from 'svelte';
  // 컴포넌트 임포트
  import Header from "$lib/components/protabs/Header.svelte";
  import Footer from "$lib/components/protabs/Footer.svelte";
  import BookmarkSidebar from "$lib/components/protabs/BookmarkSidebar.svelte";
  import Clock from "$lib/components/protabs/Clock.svelte";
  import UtilsSidebar from "$lib/components/protabs/UtilsSidebar.svelte";
  import BackgroundModeHeader from "$lib/components/protabs/BackgroundModeHeader.svelte";
  import BackgroundSelector from "$lib/components/protabs/BackgroundSelector.svelte";
  
  // 배경 모드 상태 관리
  import { isBackgroundMode } from "$lib/utils/backgroundMode";
  import { isBackgroundSelectorOpen, currentBackgroundImage, loadBackgroundImage } from "$lib/utils/backgroundImage";
  
  // 배경 이미지 URL
  let backgroundImageUrl = '';
  
  // 컴포넌트 초기화
  onMount(() => {
    // 저장된 배경 이미지 불러오기
    const savedImage = loadBackgroundImage();
    
    if (savedImage && savedImage.urls) {
      backgroundImageUrl = savedImage.urls.regular || savedImage.urls.full;
    }
  });
  
  // 배경 이미지 상태 감지
  $: if ($currentBackgroundImage && $currentBackgroundImage.urls) {
    backgroundImageUrl = $currentBackgroundImage.urls.regular || $currentBackgroundImage.urls.full;
  }
</script>

<div 
  class="h-screen flex flex-col bg-background text-foreground relative"
  style={backgroundImageUrl ? `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;` : ''}
>
  {#if backgroundImageUrl}
    <!-- 배경 이미지가 있을 때 오버레이 추가 -->
    <div class="absolute inset-0 bg-background/50 backdrop-blur-[2px] dark:bg-background/70"></div>
  {/if}
  
  <!-- 콘텐츠 -->
  <div class="relative z-10 h-full flex flex-col">
    {#if $isBackgroundMode}
      <!-- 배경 모드 -->
      <BackgroundModeHeader />
      <div class="flex-1 flex justify-center items-center">
        <Clock enlarged={true} />
      </div>
    {:else}
      <!-- 일반 모드 -->
      <!-- 헤더 영역 -->
      <Header />
      
      <!-- 메인 콘텐츠 영역 -->
      <main class="flex-1 flex overflow-hidden">
        <!-- 왼쪽 사이드바 - 북마크 -->
        <BookmarkSidebar />
        
        <!-- 중앙 영역 - 시계와 날짜 -->
        <Clock />
        
        <!-- 오른쪽 사이드바 - 메모와 TODO -->
        <UtilsSidebar />
      </main>
      
      <!-- 푸터 영역 -->
      <Footer />
    {/if}
  </div>
  
  <!-- 배경 이미지 선택기 -->
  {#if $isBackgroundSelectorOpen}
    <BackgroundSelector />
  {/if}
</div>