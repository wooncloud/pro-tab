<script>
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { onMount, createEventDispatcher } from "svelte";
  
  // Props
  export let isOpen = false;
  export let memo = null;
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher();
  
  // 삭제 확인 버튼 레퍼런스
  let deleteButton;
  
  // 다이얼로그가 열리면 삭제 버튼에 포커스
  $: if (isOpen && deleteButton) {
    setTimeout(() => {
      deleteButton.focus();
    }, 0);
  }
  
  // 취소 핸들러
  function handleCancel() {
    dispatch('close');
  }
  
  // 삭제 핸들러
  function handleDelete() {
    if (memo) {
      dispatch('delete', memo);
    }
    dispatch('close');
  }
  
  // 키보드 이벤트 핸들러
  function handleKeyDown(event) {
    if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      handleDelete();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<Dialog.Root bind:open={isOpen} on:close={() => dispatch('close')}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>메모 삭제</Dialog.Title>
      <Dialog.Description>
        이 메모를 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
      </Dialog.Description>
    </Dialog.Header>
    
    {#if memo}
      <div class="bg-muted/40 p-3 rounded-md my-4">
        <p class="font-medium">{memo.title || "제목 없음"}</p>
        <p class="text-sm text-muted-foreground truncate">
          {#if memo.content}
            {memo.content.length > 100 ? memo.content.substring(0, 100) + "..." : memo.content}
          {:else}
            <em>내용 없음</em>
          {/if}
        </p>
      </div>
    {/if}
    
    <Dialog.Footer>
      <Button variant="outline" on:click={handleCancel}>취소</Button>
      <Button
        variant="destructive"
        on:click={handleDelete}
        bind:this={deleteButton}
      >
        삭제
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root> 