<script>
  import { onMount } from 'svelte';
  import { Card } from "$lib/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  
  // 컴포넌트 임포트
  import BookmarkTab from "$lib/components/popup/BookmarkTab.svelte";
  import MemoTab from "$lib/components/popup/MemoTab.svelte";
  import PinboardTab from "$lib/components/popup/PinboardTab.svelte";

  // 상태 변수
  let currentUrl = '';
  let currentTitle = '';
  let isTabInfoLoaded = false;
  let debugInfo = {};

  // 컴포넌트가 마운트될 때 현재 탭 정보 로드
  onMount(async () => {
    console.log('Popup 컴포넌트 마운트됨');
    loadCurrentTabInfo();
  });

  // 현재 탭 정보 로드 함수
  async function loadCurrentTabInfo() {
    try {
      console.log('현재 탭 정보 로드 시작');
      
      // 현재 탭 정보 가져오기
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        console.log('Chrome API 사용 가능, 탭 쿼리 시작');
        
        // Promise 래핑으로 비동기 처리
        const tabs = await new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log('탭 쿼리 완료:', tabs);
            resolve(tabs);
          });
        });
        
        if (tabs && tabs.length > 0) {
          console.log('활성 탭 찾음:', tabs[0]);
          currentUrl = tabs[0].url;
          currentTitle = tabs[0].title;
          isTabInfoLoaded = true;
          
          // 디버깅 정보
          debugInfo = {
            tabId: tabs[0].id,
            url: currentUrl,
            title: currentTitle,
            timestamp: new Date().toISOString()
          };
          
          console.log('탭 정보 설정 완료:', currentUrl, currentTitle);
        } else {
          console.warn('활성 탭을 찾을 수 없음');
          setDefaultTabInfo();
        }
      } else {
        console.log('개발 환경 감지, 테스트 데이터 사용');
        setDefaultTabInfo();
      }
    } catch (error) {
      console.error('탭 정보 로드 오류:', error);
      setDefaultTabInfo();
    }
  }
  
  // 기본 탭 정보 설정
  function setDefaultTabInfo() {
    currentUrl = 'https://example.com';
    currentTitle = 'Example Website';
    isTabInfoLoaded = true;
    console.log('기본 탭 정보 설정됨');
  }

  // 팝업 닫기 함수
  function closePopup() {
    if (typeof chrome !== 'undefined' && chrome.windows) {
      window.close();
    }
  }
</script>

<main class="bg-background p-1">
  <Card class="w-[380px] shadow-none">
    {#if process.env.NODE_ENV === 'development'}
      <div class="p-2 text-xs bg-muted/50">
        <div class="text-readable-muted">URL: {currentUrl}</div>
        <div class="text-readable-muted">Title: {currentTitle}</div>
        <div class="text-readable-muted">Loaded: {isTabInfoLoaded ? '✓' : '✗'}</div>
      </div>
    {/if}
    
    <Tabs defaultValue="bookmark" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="bookmark">북마크</TabsTrigger>
        <TabsTrigger value="memo">메모</TabsTrigger>
        <TabsTrigger value="pinboard">Pinboard</TabsTrigger>
      </TabsList>
      
      <!-- 북마크 탭 -->
      <TabsContent value="bookmark" class="p-4 space-y-4">
        <BookmarkTab 
          currentUrl={currentUrl} 
          currentTitle={currentTitle}
          on:complete={closePopup}
        />
      </TabsContent>
      
      <!-- 메모 탭 -->
      <TabsContent value="memo" class="p-4 space-y-4">
        <MemoTab 
          currentUrl={currentUrl} 
          currentTitle={currentTitle}
          on:complete={closePopup}
        />
      </TabsContent>
      
      <!-- Pinboard 탭 -->
      <TabsContent value="pinboard" class="p-4">
        <PinboardTab />
      </TabsContent>
    </Tabs>
  </Card>
</main> 