<script>
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
  import { UNCATEGORIZED_FOLDER_NAME, loadBookmarks, saveBookmarks, isValidUrl, formatUrl } from "$lib/components/bookmarks/BookmarkStorage";
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
        console.log('미분류 폴더 선택됨:', selectedFolderId);
      }
    } catch (error) {
      console.error('북마크 폴더 로드 실패:', error);
    }
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
    }
    
    if (currentTitle && !isInitialized) {
      bookmarkName = currentTitle;
      console.log('북마크 이름 설정됨:', bookmarkName);
    }
    
    // 한 번 초기화되면 플래그 설정
    if (currentUrl && currentTitle) {
      isInitialized = true;
    }
  }

  // 북마크 저장 함수
  async function saveBookmark() {
    if (!bookmarkName.trim() || !isValidUrl(bookmarkUrl)) {
      alert('유효한 북마크 이름과 URL을 입력해주세요.');
      return;
    }

    try {
      console.log('북마크 저장 시작:', { bookmarkName, bookmarkUrl, selectedFolderId });
      
      // 선택된 폴더 ID
      const folderId = parseInt(selectedFolderId);
      const formattedUrl = formatUrl(bookmarkUrl);

      // 북마크 데이터 로드
      let bookmarks = await loadBookmarks();

      // 선택한 폴더에 북마크 추가
      bookmarks = bookmarks.map(folder => {
        if (folder.id === folderId) {
          const bookmarkId = folder.bookmarks.length ? Math.max(...folder.bookmarks.map(b => b.id)) + 1 : 1;
          return {
            ...folder,
            bookmarks: [...folder.bookmarks, { id: bookmarkId, title: bookmarkName, url: formattedUrl }]
          };
        }
        return folder;
      });

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
</script>

<div class="space-y-3">
  <!-- 디버그 정보 (개발 환경에서만 표시) -->
  {#if process.env.NODE_ENV === 'development'}
    <div class="text-xs text-readable-muted bg-muted/30 p-2 rounded">
      <div>이름: {bookmarkName}</div>
      <div>URL: {bookmarkUrl}</div>
      <div>폴더ID: {selectedFolderId}</div>
      <div>초기화됨: {isInitialized ? '✓' : '✗'}</div>
    </div>
  {/if}

  <div class="space-y-1">
    <Label for="bookmark-name">북마크 이름</Label>
    <Input id="bookmark-name" bind:value={bookmarkName} placeholder="북마크 이름을 입력하세요" />
  </div>
  
  <div class="space-y-1">
    <Label for="bookmark-url">URL</Label>
    <Input id="bookmark-url" bind:value={bookmarkUrl} placeholder="https://example.com" />
  </div>
  
  <div class="space-y-1">
    <Label for="bookmark-folder">폴더</Label>
    <Select bind:value={selectedFolderId}>
      <SelectTrigger id="bookmark-folder">
        <SelectValue placeholder="폴더 선택" />
      </SelectTrigger>
      <SelectContent>
        {#each bookmarkFolders as folder}
          <SelectItem value={folder.id.toString()}>{folder.title}</SelectItem>
        {/each}
      </SelectContent>
    </Select>
  </div>
  
  <Button 
    on:click={saveBookmark} 
    class="w-full" 
    variant="default"
  >
    <Plus class="mr-2 h-4 w-4" />
    북마크 추가
  </Button>
</div> 