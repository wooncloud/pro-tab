<script>
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  export let todo = null;
  export let onDelete;
  export let onClose;
  
  // 폼과 버튼 엘리먼트 참조
  let formElement;
  let deleteButtonElement;
  
  // 다이얼로그가 열릴 때 삭제 버튼에 포커스
  $: if (isOpen && todo) {
    setTimeout(() => {
      if (deleteButtonElement) {
        deleteButtonElement.focus();
      }
    }, 50);
  }
  
  // 폼 제출 핸들러
  function handleSubmit() {
    onDelete(todo);
  }
  
  // 키보드 이벤트 핸들러
  function handleKeydown(event) {
    if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      onDelete(todo);
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
          할 일 삭제
        </Dialog.Title>
        <Dialog.Description class="text-sm text-muted-foreground mb-4">
          {#if todo}
            <p>"{todo.text}" 할 일을 삭제하시겠습니까?</p>
            <p class="mt-2">이 작업은 되돌릴 수 없습니다.</p>
          {/if}
        </Dialog.Description>
        
        <div class="mt-6 flex justify-end space-x-2">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" on:click={onClose}>취소</Button>
          </Dialog.Close>
          <Button 
            type="submit"
            variant="destructive" 
            bind:this={deleteButtonElement}
          >
            삭제
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root> 