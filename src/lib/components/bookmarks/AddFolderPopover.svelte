<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover";
  import { FolderPlus } from "lucide-svelte";
  
  export let onAddFolder;
  
  let newFolderName = "";
  let folderNameInput;
  let isOpen = false;
  
  // 폴더 추가 함수
  function addFolder() {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName);
      newFolderName = "";
      isOpen = false;
    }
  }
  
  // 팝오버가 열릴 때 입력란에 포커스
  $: if (isOpen && folderNameInput) {
    setTimeout(() => {
      folderNameInput.focus();
    }, 50);
  }
</script>

<Popover.Root bind:open={isOpen}>
  <Popover.Trigger asChild let:builder>
    <Button variant="outline" size="icon" builders={[builder]} title="폴더 추가">
      <FolderPlus class="h-4 w-4" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-72 p-4">
    <form on:submit|preventDefault={addFolder}>
      <div class="grid gap-4">
        <h4 class="font-medium">폴더 추가</h4>
        
        <div class="grid gap-4">
          <Input 
            type="text" 
            placeholder="새 폴더 이름" 
            bind:value={newFolderName}
            bind:this={folderNameInput}
            autocomplete="off"
          />
          
          <Button type="submit" disabled={!newFolderName.trim()}>
            폴더 추가
          </Button>
        </div>
      </div>
    </form>
  </Popover.Content>
</Popover.Root> 