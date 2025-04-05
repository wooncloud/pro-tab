<script>
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { ChevronDown, ChevronRight, FolderOpen, Edit, Trash2 } from "lucide-svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import { UNCATEGORIZED_FOLDER_NAME } from "./BookmarkStorage";
  
  export let folder;
  export let onToggleFolder;
  export let onEditFolder;
  export let onDeleteFolder;
  export let onEditBookmark;
  export let onDeleteBookmark;
</script>

<li>
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <div 
        class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer" 
        on:click={() => onToggleFolder(folder.id)}
        on:keydown={(e) => e.key === 'Enter' && onToggleFolder(folder.id)}
        role="button"
        tabindex="0"
      >
        <div class="flex items-center">
          <FolderOpen class="h-4 w-4 mr-2 text-primary" />
          <span class="font-medium">{folder.title}</span>
        </div>
        {#if folder.expanded}
          <ChevronDown class="h-4 w-4 text-primary" />
        {:else}
          <ChevronRight class="h-4 w-4 text-primary" />
        {/if}
      </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item 
        disabled={folder.title === UNCATEGORIZED_FOLDER_NAME}
        on:click={() => onEditFolder(folder)}
      >
        <Edit class="h-4 w-4 mr-2" />
        폴더 편집
      </ContextMenu.Item>
      <ContextMenu.Item 
        disabled={folder.title === UNCATEGORIZED_FOLDER_NAME}
        class="text-destructive focus:text-destructive" 
        on:click={() => onDeleteFolder(folder)}
      >
        <Trash2 class="h-4 w-4 mr-2" />
        폴더 삭제
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
  
  {#if folder.expanded}
    <ul class="ml-6 mt-1 space-y-1">
      {#if folder.bookmarks.length === 0}
        <li class="p-2 text-sm text-readable-muted italic">
          북마크가 없습니다.
        </li>
      {:else}
        {#each folder.bookmarks as bookmark (bookmark.id)}
          <BookmarkItem 
            {bookmark}
            folderId={folder.id}
            onEditBookmark={onEditBookmark}
            onDeleteBookmark={onDeleteBookmark}
          />
        {/each}
      {/if}
    </ul>
  {/if}
</li> 