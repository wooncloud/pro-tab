<script>
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { UNCATEGORIZED_FOLDER_NAME } from "./BookmarkStorage";
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  export let deletingFolder = null;
  export let deletingBookmark = null;
  export let onDelete;
  export let onClose;

  // 삭제 버튼 비활성화 체크
  function isDeleteDisabled() {
    return deletingFolder && deletingFolder.title === UNCATEGORIZED_FOLDER_NAME;
  }

  // 폼 제출 핸들러
  function handleSubmit() {
    if (isDeleteDisabled()) return;
    onDelete();
  }

  // 폼과 버튼 엘리먼트 참조
  let formElement;
  let deleteButtonElement;
  
  // 다이얼로그가 열릴 때 삭제 버튼에 포커스 주기
  $: if (isOpen) {
    setTimeout(() => {
      if (deleteButtonElement && !isDeleteDisabled()) {
        deleteButtonElement.focus();
      } else if (formElement) {
        // 포커스를 폼으로 이동시켜 키보드 이벤트를 캡처
        formElement.focus();
      }
    }, 50);
  }
  
  // 키보드 이벤트 핸들러
  function handleKeydown(event) {
    if (event.key === 'Enter' && !isDeleteDisabled() && isOpen) {
      event.preventDefault();
      onDelete();
    }
  }
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <Dialog.Content 
      class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg"
      on:keydown={handleKeydown}
    >
      <form 
        bind:this={formElement}
        on:submit|preventDefault={handleSubmit}
      >
        <Dialog.Title class="text-lg font-semibold text-destructive">
          {#if deletingBookmark}
            북마크 삭제
          {:else if deletingFolder}
            폴더 삭제
          {/if}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-muted-foreground mb-4">
          {#if deletingBookmark}
            <p>"{deletingBookmark.title}" 북마크를 삭제하시겠습니까?</p>
            <p class="mt-2">이 작업은 되돌릴 수 없습니다.</p>
          {:else if deletingFolder}
            {#if deletingFolder.title === UNCATEGORIZED_FOLDER_NAME}
              <p>'미분류' 폴더는 삭제할 수 없습니다.</p>
            {:else}
              <p>"{deletingFolder.title}" 폴더와 폴더 내의 모든 북마크를 삭제하시겠습니까?</p>
              <p class="mt-2">이 작업은 되돌릴 수 없습니다.</p>
            {/if}
          {/if}
        </Dialog.Description>
        
        <div class="mt-6 flex justify-end space-x-2">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" on:click={onClose}>취소</Button>
          </Dialog.Close>
          <Button 
            type="submit"
            variant="destructive" 
            disabled={isDeleteDisabled()}
            bind:this={deleteButtonElement}
          >
            삭제
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root> 