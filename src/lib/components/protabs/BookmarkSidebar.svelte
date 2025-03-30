<script>
  // 북마크 컴포넌트
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import { ChevronDown, ChevronUp, FolderOpen, Trash, ChevronRight, Plus } from "lucide-svelte";
  
  // 샘플 북마크 데이터
  export let bookmarks = [
    {
      id: 1,
      title: "개발 관련",
      expanded: true,
      bookmarks: [
        { id: 1, title: "GitHub", url: "https://github.com" },
        { id: 2, title: "Stack Overflow", url: "https://stackoverflow.com" }
      ]
    },
    {
      id: 2,
      title: "뉴스",
      expanded: false,
      bookmarks: [
        { id: 3, title: "Google News", url: "https://news.google.com" },
        { id: 4, title: "Naver", url: "https://naver.com" }
      ]
    }
  ];
  
  let newFolderName = "";
  let newBookmarkName = "";
  let newBookmarkUrl = "";
  let selectedFolderId = null;
  
  // 폴더 토글 함수
  function toggleFolder(id) {
    bookmarks = bookmarks.map(folder => {
      if (folder.id === id) {
        return { ...folder, expanded: !folder.expanded };
      }
      return folder;
    });
  }
  
  // 새 폴더 추가
  function addFolder() {
    if (newFolderName.trim()) {
      const id = Math.max(0, ...bookmarks.map(b => b.id)) + 1;
      bookmarks = [...bookmarks, { id, title: newFolderName, expanded: false, bookmarks: [] }];
      newFolderName = "";
    }
  }
  
  // 북마크 추가
  function addBookmark() {
    if (selectedFolderId && newBookmarkName.trim() && newBookmarkUrl.trim()) {
      bookmarks = bookmarks.map(folder => {
        if (folder.id === selectedFolderId) {
          const id = folder.bookmarks.length ? Math.max(...folder.bookmarks.map(b => b.id)) + 1 : 1;
          return {
            ...folder,
            bookmarks: [...folder.bookmarks, { id, title: newBookmarkName, url: newBookmarkUrl }]
          };
        }
        return folder;
      });
      newBookmarkName = "";
      newBookmarkUrl = "";
    }
  }
</script>

<aside class="w-80 border-r h-full flex flex-col">
  <div class="p-4 pb-0">
    <h2 class="text-xl font-semibold mb-2">북마크</h2>
    
    <!-- 폴더 추가 -->
    <div class="flex space-x-2 mb-4">
      <Input 
        type="text" 
        placeholder="새 폴더 이름" 
        bind:value={newFolderName}
        class="flex-1"
      />
      <Button on:click={addFolder} size="sm">
        <Plus class="h-4 w-4 mr-1" />
        추가
      </Button>
    </div>
    
    <!-- 북마크 추가 -->
    <div class="mb-4">
      <div class="flex space-x-2 mb-2">
        <select
          bind:value={selectedFolderId}
          class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value={null}>폴더 선택</option>
          {#each bookmarks as folder}
            <option value={folder.id}>{folder.title}</option>
          {/each}
        </select>
      </div>
      <div class="flex space-x-2 mb-2">
        <Input 
          type="text" 
          placeholder="북마크 이름" 
          bind:value={newBookmarkName}
        />
      </div>
      <div class="flex space-x-2">
        <Input 
          type="text" 
          placeholder="URL (https://...)" 
          bind:value={newBookmarkUrl}
          class="flex-1"
        />
        <Button on:click={addBookmark} size="sm" disabled={!selectedFolderId}>추가</Button>
      </div>
    </div>
    
    <Separator class_value="my-2" />
  </div>
  
  <!-- 북마크 목록 (스크롤 가능) -->
  <div class="flex-1 overflow-hidden p-4 pt-2">
    <div class="overflow-y-auto h-full pr-1">
      <ul class="space-y-2">
        {#each bookmarks as folder (folder.id)}
          <li>
            <div class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer" on:click={() => toggleFolder(folder.id)}>
              <div class="flex items-center">
                <FolderOpen class="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{folder.title}</span>
              </div>
              {#if folder.expanded}
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-4 w-4 text-muted-foreground" />
              {/if}
            </div>
            
            {#if folder.expanded}
              <ul class="ml-6 mt-1 space-y-1">
                {#each folder.bookmarks as bookmark (bookmark.id)}
                  <li>
                    <a href={bookmark.url} class="flex items-center p-2 hover:bg-muted/50 rounded-md text-sm" target="_blank" rel="noopener noreferrer">
                      {bookmark.title}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</aside> 