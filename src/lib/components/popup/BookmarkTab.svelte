<script>
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
  import { UNCATEGORIZED_FOLDER_NAME, getOrCreateUncategorizedFolder } from "$lib/components/bookmarks/storage/BookmarkModel";
  import { loadBookmarks, saveBookmarks } from "$lib/components/bookmarks/storage/BookmarkPersistence";
  import { isValidUrl, formatUrl } from "$lib/components/bookmarks/storage/BookmarkUtils";
  import { Plus } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  // 이벤트 디스패처 생성
  const dispatch = createEventDispatcher();

  // 속성 정의
  export let currentUrl = '';
  export let currentTitle = '';

  // 상태 변수
  let bookmarkName = '';
  let bookmarkUrl = '';
  let selectedFolderId = '';
  let bookmarkFolders = [];
  let isInitialized = false;
  let urlError = '';
  let isFormValid = false;
  
  // 양방향 바인딩을 위한 커스텀 이벤트 핸들러
  function updateFormValidity() {
    const nameValid = bookmarkName.trim().length > 0;
    const urlValid = bookmarkUrl.trim().length > 0 && !urlError;
    isFormValid = nameValid && urlValid;
    
    console.log('폼 유효성 업데이트:', { nameValid, urlValid, isFormValid });
  }
  
  // URL 유효성 검사
  function validateUrl() {
    if (bookmarkUrl.trim()) {
      if (!isValidUrl(bookmarkUrl)) {
        urlError = "유효하지 않은 URL 형식입니다.";
      } else {
        urlError = "";
      }
    } else {
      urlError = "";
    }
    updateFormValidity();
  }
  
  // 이름 유효성 검사
  $: {
    if (bookmarkName !== undefined) {
      updateFormValidity();
    }
  }
  
  // URL 값 변경 시 유효성 검사
  $: {
    if (bookmarkUrl !== undefined) {
      validateUrl();
    }
  }
  
  // 컴포넌트가 마운트될 때 초기화
  onMount(async () => {
    console.log('BookmarkTab 마운트됨');
    
    // 북마크 폴더 로드
    await loadBookmarkFolders();
    
    // 입력란 초기화 시도
    updateFormFields();
  });
  
  // 북마크 폴더 로드 함수
  async function loadBookmarkFolders() {
    try {
      console.log('북마크 폴더 로드 중...');
      const bookmarks = await loadBookmarks();
      bookmarkFolders = bookmarks;
      
      // 기본 선택 폴더를 '미분류'로 설정
      const uncategorizedFolder = bookmarkFolders.find(folder => folder.title === UNCATEGORIZED_FOLDER_NAME);
      if (uncategorizedFolder) {
        selectedFolderId = uncategorizedFolder.id.toString();
        console.log('미분류 폴더 선택됨:', selectedFolderId, typeof selectedFolderId);
      }
    } catch (error) {
      console.error('북마크 폴더 로드 실패:', error);
    }
  }
  
  // 폴더 선택 핸들러
  function handleSelect(event) {
    selectedFolderId = event.detail;
    console.log('폴더 선택됨 (select 이벤트):', selectedFolderId, typeof selectedFolderId);
  }
  
  // 속성 변경 감지 및 입력란 업데이트
  $: {
    if (currentUrl || currentTitle) {
      updateFormFields();
    }
  }
  
  // 입력란 업데이트 함수
  function updateFormFields() {
    console.log('입력란 업데이트 시도:', { currentUrl, currentTitle });
    
    if (currentUrl && !isInitialized) {
      bookmarkUrl = currentUrl;
      console.log('북마크 URL 설정됨:', bookmarkUrl);
      validateUrl();
    }
    
    if (currentTitle && !isInitialized) {
      bookmarkName = currentTitle;
      console.log('북마크 이름 설정됨:', bookmarkName);
      updateFormValidity();
    }
    
    // 한 번 초기화되면 플래그 설정
    if (currentUrl && currentTitle) {
      isInitialized = true;
    }
  }

  // 북마크 저장 함수
  async function saveBookmark() {
    if (!isFormValid) {
      alert('유효한 북마크 이름과 URL을 입력해주세요.');
      return;
    }

    try {
      console.log('북마크 저장 시작:', { bookmarkName, bookmarkUrl, selectedFolderId });
      
      // 선택된 폴더 ID를 숫자로 변환
      const folderId = selectedFolderId ? parseInt(selectedFolderId) : null;
      const formattedUrl = formatUrl(bookmarkUrl);

      console.log('변환된 폴더 ID:', folderId, typeof folderId);
      
      // 북마크 데이터 로드
      let bookmarks = await loadBookmarks();
      console.log('로드된 북마크 데이터:', bookmarks);
      
      // 폴더 ID를 사용하여 선택된 폴더 찾기
      let selectedFolder = bookmarks.find(folder => folder.id === folderId);
      console.log('선택된 폴더:', selectedFolder);
      
      if (!folderId || !selectedFolder) {
        // 폴더 ID가 없거나 선택된 폴더를 찾을 수 없는 경우 미분류 폴더에 추가
        const { folder: uncategorizedFolder, updatedBookmarks } = getOrCreateUncategorizedFolder(bookmarks);
        bookmarks = updatedBookmarks;
        
        console.log('미분류 폴더에 추가:', uncategorizedFolder.id);
        
        // 수정된 북마크 배열 생성
        bookmarks = bookmarks.map(folder => {
          if (folder.id === uncategorizedFolder.id) {
            const bookmarkId = folder.bookmarks.length ? Math.max(0, ...folder.bookmarks.map(b => b.id)) + 1 : 1;
            return {
              ...folder,
              expanded: true, // 자동으로 폴더 확장
              bookmarks: [...folder.bookmarks, { id: bookmarkId, title: bookmarkName, url: formattedUrl }]
            };
          }
          return folder;
        });
      } else {
        // 선택된 폴더에 추가
        console.log('선택된 폴더에 추가:', selectedFolder.id, selectedFolder.title);
        
        bookmarks = bookmarks.map(folder => {
          if (folder.id === folderId) {
            const bookmarkId = folder.bookmarks.length ? Math.max(0, ...folder.bookmarks.map(b => b.id)) + 1 : 1;
            return {
              ...folder,
              expanded: true, // 자동으로 폴더 확장
              bookmarks: [...folder.bookmarks, { id: bookmarkId, title: bookmarkName, url: formattedUrl }]
            };
          }
          return folder;
        });
      }

      // 업데이트된 북마크 저장
      const result = saveBookmarks(bookmarks);
      console.log('북마크 저장 결과:', result);
      
      // 성공 메시지
      alert('북마크가 저장되었습니다.');
      
      // 완료 이벤트 발생
      dispatch('complete');
    } catch (error) {
      console.error('북마크 저장 실패:', error);
      alert('북마크 저장 중 오류가 발생했습니다.');
    }
  }

  // 엔터 키 처리
  function handleKeyDown(event) {
    if (event.key === 'Enter' && isFormValid) {
      saveBookmark();
    }
  }
</script>

<div class="space-y-3">
  <!-- 디버그 정보 (개발 환경에서만 표시) -->
  {#if process.env.NODE_ENV === 'development'}
    <div class="text-xs text-readable-muted bg-muted/30 p-2 rounded">
      <div>이름: {bookmarkName}</div>
      <div>URL: {bookmarkUrl}</div>
      <div>URL 오류: {urlError || '없음'}</div>
      <div>폴더ID: {selectedFolderId} (타입: {typeof selectedFolderId})</div>
      <div>초기화됨: {isInitialized ? '✓' : '✗'}</div>
      <div>폼 유효성: {isFormValid ? '✓' : '✗'}</div>
      <div>폴더 목록: {bookmarkFolders.map(f => `${f.id}:${f.title}`).join(', ')}</div>
    </div>
  {/if}

  <div class="space-y-1">
    <Label for="bookmark-name">북마크 이름</Label>
    <Input 
      id="bookmark-name" 
      bind:value={bookmarkName} 
      placeholder="북마크 이름을 입력하세요" 
      on:keydown={handleKeyDown}
      on:input={updateFormValidity}
    />
  </div>
  
  <div class="space-y-1">
    <Label for="bookmark-url">URL</Label>
    <div class="relative">
      <Input 
        id="bookmark-url" 
        bind:value={bookmarkUrl} 
        placeholder="https://example.com" 
        on:keydown={handleKeyDown}
        on:input={validateUrl}
        class={urlError ? "border-destructive" : ""}
      />
      {#if urlError}
        <div class="absolute right-2 top-2 text-destructive text-xs">
          ⚠️ {urlError}
        </div>
      {/if}
    </div>
  </div>
  
  <div class="space-y-1">
    <Label for="bookmark-folder">폴더</Label>
    <select
      id="bookmark-folder"
      bind:value={selectedFolderId}
      class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#each bookmarkFolders as folder}
        <option value={folder.id.toString()}>{folder.title}</option>
      {/each}
    </select>
  </div>
  
  <Button 
    on:click={saveBookmark} 
    class="w-full" 
    variant="default"
    disabled={!isFormValid}
  >
    <Plus class="mr-2 h-4 w-4" />
    북마크 추가
  </Button>
</div> 