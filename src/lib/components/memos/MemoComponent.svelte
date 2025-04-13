<script>
  import { onMount } from 'svelte';
  import { loadMemos, saveMemo, deleteMemo } from './MemoStorage';
  import MemoList from './MemoList.svelte';
  import MemoEditor from './MemoEditor.svelte';
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Separator from "$lib/components/ui/separator";
  
  // 상태
  let memos = [];
  let selectedMemoId = null;
  let selectedMemo = null;
  let isLoading = true;
  let loadError = null;
  let searchQuery = "";
  let isSheetOpen = false;
  let sheetMemo = null;
  
  // 컴포넌트 마운트 시 데이터 로드
  onMount(async () => {
    await loadData();
  });
  
  // 데이터 로드 함수
  async function loadData() {
    try {
      isLoading = true;
      loadError = null;
      memos = await loadMemos();
      
      // 메모가 있으면 첫 번째 메모 선택
      if (memos.length > 0 && !selectedMemoId) {
        selectedMemoId = memos[0].id;
      }
    } catch (error) {
      console.error("메모 로드 중 오류:", error);
      loadError = error.message || "메모 데이터를 불러오는 중 오류가 발생했습니다.";
    } finally {
      isLoading = false;
    }
  }
  
  // 선택된 메모 계산
  $: selectedMemo = memos.find(memo => memo.id === selectedMemoId) || null;
  
  // 메모 선택 핸들러
  function handleSelectMemo(id) {
    selectedMemoId = id;
  }
  
  // 새 메모 생성 핸들러
  function handleNewMemo() {
    const now = new Date().toISOString();
    const newMemo = {
      id: memos.length > 0 ? Math.max(...memos.map(m => m.id)) + 1 : 1,
      title: "새 메모",
      content: "",
      createdAt: now,
      updatedAt: now
    };
    
    memos = [newMemo, ...memos];
    selectedMemoId = newMemo.id;
    
    // 새 메모는 바로 전체 화면으로 열기
    sheetMemo = newMemo;
    isSheetOpen = true;
  }
  
  // 메모 저장 핸들러
  async function handleSaveMemo(event) {
    const memo = event.detail;
    
    try {
      await saveMemo(memo);
      
      // 메모 배열 업데이트
      memos = memos.map(m => m.id === memo.id ? memo : m);
    } catch (error) {
      console.error("메모 저장 중 오류:", error);
    }
  }
  
  // 메모 삭제 실행 핸들러 - 확인 다이얼로그 없이 바로 삭제
  async function handleDeleteMemo(event) {
    const memo = event.detail;
    
    try {
      await deleteMemo(memo.id);
      
      // 메모 배열에서 제거
      memos = memos.filter(m => m.id !== memo.id);
      
      // 다른 메모 선택
      if (selectedMemoId === memo.id) {
        selectedMemoId = memos.length > 0 ? memos[0].id : null;
      }
      
      // Sheet가 열려있었다면 닫기
      if (isSheetOpen && sheetMemo && sheetMemo.id === memo.id) {
        isSheetOpen = false;
        sheetMemo = null;
      }
    } catch (error) {
      console.error("메모 삭제 중 오류:", error);
    }
  }
  
  // 에디터 닫기 핸들러
  function handleCloseEditor() {
    selectedMemoId = null;
  }
  
  // 검색 핸들러
  function handleSearch(query) {
    searchQuery = query;
  }
  
  // 전체 화면 모드 열기
  function handleOpenFullScreen(event) {
    const memo = event.detail;
    sheetMemo = memo;
    isSheetOpen = true;
  }
  
  // Sheet 닫기 핸들러
  function handleSheetClose() {
    isSheetOpen = false;
  }
  
  // Sheet 메모 저장 핸들러
  function handleSheetSave(event) {
    handleSaveMemo(event);
    // sheetMemo도 업데이트
    const updatedMemo = event.detail;
    sheetMemo = { ...updatedMemo };
  }
  
  // 메모 목록에서 전체 화면 열기
  function handleListOpenFullScreen(memo) {
    sheetMemo = memo;
    isSheetOpen = true;
  }
</script>

<div class="h-full flex flex-col">
  {#if isLoading}
    <div class="flex justify-center items-center h-full">
      <p class="text-readable-muted font-medium">메모 로딩 중...</p>
    </div>
  {:else if loadError}
    <div class="flex flex-col justify-center items-center h-full text-error">
      <p>{loadError}</p>
      <button 
        class="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
        on:click={loadData}
      >
        다시 시도
      </button>
    </div>
  {:else}
    <div class="flex h-full overflow-hidden">
      <!-- 메모 목록 -->
      <div class="w-full h-full overflow-hidden">
        <MemoList 
          {memos}
          {selectedMemoId}
          {searchQuery}
          onSelectMemo={handleSelectMemo}
          onNewMemo={handleNewMemo}
          onSearch={handleSearch}
          onOpenFullScreen={handleListOpenFullScreen}
        />
      </div>
      
      <!-- 인라인 에디터는 Sheet 모드 사용으로 완전히 제거 -->
    </div>
  {/if}
  
  <!-- 전체 화면 편집을 위한 Sheet -->
  <Sheet.Root bind:open={isSheetOpen} onOpenChange={handleSheetClose}>
    <Sheet.Content side="right" class="w-full sm:w-3/4 max-w-4xl p-6">
      <Sheet.Header>
        <Sheet.Title>메모 편집</Sheet.Title>
      </Sheet.Header>
      
      <div class="h-[calc(100vh-200px)] mt-6">
        {#if sheetMemo}
          <MemoEditor 
            memo={sheetMemo}
            fullScreenMode={true}
            on:save={handleSheetSave}
            on:delete={handleDeleteMemo}
            on:close={() => isSheetOpen = false}
          />
        {/if}
      </div>
    </Sheet.Content>
  </Sheet.Root>
</div> 