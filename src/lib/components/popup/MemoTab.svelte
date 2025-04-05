<script>
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { saveMemo, loadMemos } from "$lib/components/memos/MemoStorage";
  import { Download, RefreshCw } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  // 이벤트 디스패처 생성
  const dispatch = createEventDispatcher();

  // 속성 정의
  export let currentUrl = '';
  export let currentTitle = '';

  // 상태 변수
  let memoContent = '';
  let memoTitle = '';
  let isLoading = false;
  let scrapStatus = '';
  let messageTimeout;

  // 컴포넌트가 마운트될 때 초기화
  onMount(() => {
    // 제목 초기화
    memoTitle = currentTitle || '제목 없음';
    
    // 메시지 타임아웃 클리어
    return () => {
      if (messageTimeout) clearTimeout(messageTimeout);
    };
  });

  // 현재 페이지 내용 자동 스크랩
  async function autoScrapContent() {
    isLoading = true;
    scrapStatus = '스크랩 중...';
    
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            
            // 콘텐츠 스크립트 로드 상태 확인
            chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
              // 응답이 없으면 콘텐츠 스크립트가 로드되지 않은 것
              if (chrome.runtime.lastError || !response) {
                console.log('콘텐츠 스크립트 로드되지 않음, 스크립트 실행');
                // 콘텐츠 스크립트 직접 실행
                chrome.scripting.executeScript(
                  {
                    target: { tabId: tabId },
                    files: ['content_scripts/content.js']
                  },
                  () => {
                    // 스크립트 로드 후 스크랩 시도
                    setTimeout(() => sendScrapRequest(tabId), 300);
                  }
                );
              } else {
                // 콘텐츠 스크립트가 이미 로드됨, 바로 스크랩 요청
                sendScrapRequest(tabId);
              }
            });
          } else {
            handleScrapError('현재 탭을 찾을 수 없습니다.');
          }
        });
      } else {
        // 개발 환경에서는 테스트 데이터 제공
        setTimeout(() => {
          memoContent = '이것은 개발 환경에서 자동 생성된 예시 내용입니다. 이 텍스트는 실제 웹 페이지에서 스크랩된 것이 아닙니다.';
          isLoading = false;
          scrapStatus = '스크랩 완료';
          setTempStatus('');
        }, 1000);
      }
    } catch (error) {
      handleScrapError(error.message);
    }
  }
  
  // 스크랩 요청 보내기
  function sendScrapRequest(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'scrapeContent' }, (response) => {
      if (chrome.runtime.lastError) {
        handleScrapError('콘텐츠 스크립트와 통신 중 오류가 발생했습니다.');
        return;
      }
      
      isLoading = false;
      
      if (response && response.success) {
        memoContent = response.content;
        scrapStatus = '스크랩 완료';
        setTempStatus('');
      } else {
        handleScrapError(response?.error || '페이지 내용을 가져올 수 없습니다.');
      }
    });
  }
  
  // 스크랩 오류 처리
  function handleScrapError(message) {
    console.error('스크랩 오류:', message);
    isLoading = false;
    scrapStatus = '스크랩 실패';
    memoContent = `스크랩 중 오류 발생: ${message}\n\n수동으로 내용을 입력하시거나 다시 시도해주세요.`;
    setTempStatus('');
  }
  
  // 임시 상태 메시지 설정
  function setTempStatus(message) {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    if (message) {
      scrapStatus = message;
      messageTimeout = setTimeout(() => {
        scrapStatus = '';
      }, 3000);
    }
  }

  // 메모 저장 함수
  async function storeMemo() {
    if (!memoContent.trim()) {
      alert('저장할 메모 내용이 없습니다.');
      return;
    }

    const memo = {
      id: undefined, // 새 메모이므로 ID는 저장 로직에서 자동 생성
      title: memoTitle || currentTitle || '제목 없음',
      url: currentUrl || '',
      content: memoContent
      // createdAt과 updatedAt은 saveMemo 함수에서 자동 추가
    };

    try {
      // 저장 전 현재 메모 목록 확인 (디버깅용)
      const currentMemos = await loadMemos();
      console.log('저장 전 메모 목록:', currentMemos);
      
      // MemoStorage를 통해 메모 저장
      const success = await saveMemo(memo);
      
      // 저장 후 메모 목록 확인 (디버깅용)
      const updatedMemos = await loadMemos();
      console.log('저장 후 메모 목록:', updatedMemos);
      
      if (success) {
        // 성공 메시지
        alert('메모가 저장되었습니다.');
        
        // 내용 초기화
        memoContent = '';
        
        // 완료 이벤트 발생
        dispatch('complete');
      } else {
        alert('메모 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장 중 오류가 발생했습니다.');
    }
  }
</script>

<div class="space-y-3">
  <div class="space-y-1">
    <Label for="memo-title">메모 제목</Label>
    <Input id="memo-title" bind:value={memoTitle} placeholder="메모 제목" />
  </div>

  <div class="space-y-1">
    <div class="flex justify-between items-center">
      <Label for="memo-content">메모 내용</Label>
      {#if scrapStatus}
        <span class="text-xs text-status font-medium">{scrapStatus}</span>
      {/if}
    </div>
    <Textarea 
      id="memo-content" 
      bind:value={memoContent} 
      placeholder="메모할 내용을 입력하거나 자동 스크랩 기능을 사용하세요."
      class="min-h-[150px]"
    />
  </div>
  
  <div class="flex gap-2">
    <Button 
      on:click={autoScrapContent} 
      variant="outline" 
      class="flex-1"
      disabled={isLoading}
    >
      {#if isLoading}
        <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
        스크랩 중...
      {:else}
        <Download class="mr-2 h-4 w-4" />
        자동 스크랩
      {/if}
    </Button>
    
    <Button 
      on:click={storeMemo} 
      variant="default" 
      class="flex-1"
      disabled={isLoading || !memoContent.trim()}
    >
      저장
    </Button>
  </div>
</div> 