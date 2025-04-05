<script>
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { ExternalLink, Edit, Trash2, Link } from "lucide-svelte";
  
  export let bookmark;
  export let folderId;
  export let onEditBookmark;
  export let onDeleteBookmark;
</script>

<li>
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <a 
        href={bookmark.url} 
        class="flex items-center p-2 hover:bg-muted/70 rounded-md text-sm group transition-colors duration-200" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <Link class="h-3.5 w-3.5 mr-1.5 text-primary opacity-70 group-hover:opacity-100" />
        <span class="font-medium group-hover:text-primary">{bookmark.title}</span>
      </a>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item on:click={() => window.open(bookmark.url, '_blank')}>
        <ExternalLink class="h-4 w-4 mr-2" />
        새 탭에서 열기
      </ContextMenu.Item>
      <ContextMenu.Item on:click={() => onEditBookmark(folderId, bookmark)}>
        <Edit class="h-4 w-4 mr-2" />
        북마크 편집
      </ContextMenu.Item>
      <ContextMenu.Item 
        class="text-destructive focus:text-destructive" 
        on:click={() => onDeleteBookmark(folderId, bookmark)}
      >
        <Trash2 class="h-4 w-4 mr-2" />
        북마크 삭제
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
</li> 