<script>
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { Input } from "$lib/components/ui/input";
  import { Save, Trash2, X, Clock } from "lucide-svelte";
  
  // Props
  export let memo = null;
  export let readOnly = false;
  export let saveDebounceTime = 500; // 자동 저장 딜레이(ms)
  export let fullScreenMode = false; // 전체 화면 모드 (Sheet 내부에서 true)
  
  // 내부 상태
  let title = "";
  let content = "";
  let modified = false;
  let saveTimer = null;
  let saveStatus = "idle"; // "idle", "saving", "saved", "error"
  let saveStatusTimer = null;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher();
  
  // 메모가 변경되면 상태 업데이트
  $: if (memo) {
    title = memo.title || "";
    content = memo.content || "";
    modified = false;
    saveStatus = "idle";
  }
  
  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    if (memo) {
      title = memo.title || "";
      content = memo.content || "";
    }
    
    // 자동 포커스 설정
    if (!readOnly) {
      const titleInput = document.getElementById('memo-title-input');
      if (titleInput) titleInput.focus();
    }
  });
  
  // 컴포넌트 언마운트 시 타이머 정리
  onDestroy(() => {
    if (saveTimer) clearTimeout(saveTimer);
    if (saveStatusTimer) clearTimeout(saveStatusTimer);
  });
  
  // 내용 변경 핸들러
  function handleContentChange() {
    modified = true;
    debounceSave();
  }
  
  // 제목 변경 핸들러
  function handleTitleChange() {
    modified = true;
    debounceSave();
  }
  
  // 자동 저장 디바운스 함수
  function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer);
    
    // 저장 상태 업데이트
    saveStatus = "idle";
    
    saveTimer = setTimeout(() => {
      saveChanges();
    }, saveDebounceTime);
  }
  
  // 변경사항 저장
  function saveChanges() {
    if (!memo || !modified) return;
    
    // 제목이 비어있으면 저장하지 않음
    if (!title.trim()) return;
    
    const updatedMemo = {
      ...memo,
      title: title.trim(),
      content,
      updatedAt: new Date().toISOString()
    };
    
    saveStatus = "saving";
    
    // 저장 이벤트 발송
    dispatch('save', updatedMemo);
    
    // 저장 후 상태 업데이트
    setTimeout(() => {
      saveStatus = "saved";
      modified = false;
      
      // 상태 메시지 타이머 설정
      if (saveStatusTimer) clearTimeout(saveStatusTimer);
      saveStatusTimer = setTimeout(() => {
        saveStatus = "idle";
      }, 2000);
    }, 300);
  }
  
  // 삭제 요청
  function requestDelete() {
    if (!memo) return;
    dispatch('delete', memo);
  }
  
  // 닫기 요청
  function requestClose() {
    dispatch('close');
  }
  
  // 열기 요청
  function requestOpen() {
    dispatch('open', memo);
  }
  
  // 키보드 단축키 처리
  function handleKeyDown(event) {
    // Ctrl+S 또는 Cmd+S로 저장
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveChanges();
    }
    
    // Esc로 닫기
    if (event.key === 'Escape' && !fullScreenMode) {
      event.preventDefault();
      requestClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class={`flex flex-col ${fullScreenMode ? 'h-full' : 'h-full'}`}>
  <!-- 에디터 헤더 -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b">
    <Input
      id="memo-title-input"
      type="text"
      placeholder="제목 없음"
      class="text-lg font-medium border-none shadow-none focus-visible:ring-0 h-auto px-0 py-1 text-foreground placeholder:text-muted-foreground"
      disabled={readOnly}
      bind:value={title}
      on:input={handleTitleChange}
    />
    
    <div class="flex items-center space-x-1">
      {#if !readOnly && !fullScreenMode}
        <!-- 확장 버튼 (작은 화면에서만 표시) -->
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors"
          on:click={requestOpen}
          title="전체 화면으로 편집"
          aria-label="전체 화면으로 편집"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </button>
      {/if}
      
      {#if !readOnly}
        <!-- 삭제 버튼 -->
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors"
          on:click={requestDelete}
          title="메모 삭제"
          aria-label="메모 삭제"
        >
          <Trash2 class="h-4 w-4 text-destructive" />
        </button>
      {/if}
    </div>
  </div>
  
  <!-- 에디터 내용 -->
  <div class="flex-1 overflow-hidden">
    <textarea
      class="w-full h-full p-2 resize-none border-none bg-transparent focus:outline-none text-foreground"
      placeholder="내용을 입력하세요..."
      disabled={readOnly}
      bind:value={content}
      on:input={handleContentChange}
    ></textarea>
  </div>
  
  <!-- 저장 상태 표시 -->
  {#if saveStatus !== "idle"}
    <div class="flex justify-end items-center py-1 border-t mt-2">
      {#if saveStatus === "saving"}
        <div class="flex items-center text-xs text-muted-foreground">
          <Clock class="h-3 w-3 mr-1 animate-spin" />
          <span>저장 중...</span>
        </div>
      {:else if saveStatus === "saved"}
        <div class="flex items-center text-xs text-green-600">
          <Save class="h-3 w-3 mr-1" />
          <span>저장됨</span>
        </div>
      {:else if saveStatus === "error"}
        <div class="flex items-center text-xs text-destructive">
          <span>저장 실패</span>
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- 단축키 안내 -->
  <div class="text-xs text-muted-foreground pt-2 border-t mt-2">
    <span class="mr-3">
      <kbd class="px-1 rounded border">Ctrl</kbd> + 
      <kbd class="px-1 rounded border">S</kbd> 저장
    </span>
    <span>
      <kbd class="px-1 rounded border">Esc</kbd> 닫기
    </span>
  </div>
</div> 