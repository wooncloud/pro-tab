<script>
  import { onMount } from 'svelte';
  // 컴포넌트 임포트
  import Header from "$lib/components/protabs/Header.svelte";
  import Footer from "$lib/components/protabs/Footer.svelte";
  import BookmarkSidebar from "$lib/components/protabs/BookmarkSidebar.svelte";
  import Clock from "$lib/components/protabs/Clock.svelte";
  import UtilsSidebar from "$lib/components/protabs/UtilsSidebar.svelte";
  import BackgroundModeHeader from "$lib/components/protabs/BackgroundModeHeader.svelte";
  
  // 배경 모드 상태 관리
  import { isBackgroundMode } from "$lib/utils/backgroundMode";
</script>

<div class="h-screen flex flex-col bg-background text-foreground">
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