<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Dialog from "$lib/components/ui/dialog";
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import { Label } from "$lib/components/ui/label";
  import { onMount } from 'svelte';
  import { PRIORITIES } from "./TodoStorage";
  
  export let isOpen = false;
  export let todo = null;
  export let onSave;
  export let onClose;
  
  // 편집 상태
  let editText = "";
  let editPriority = "medium";
  let isComposing = false; // IME 조합 상태 추적
  
  // todo가 변경될 때 편집 상태 초기화
  $: if (todo) {
    editText = todo.text;
    editPriority = todo.priority;
  }
  
  // 폼과 인풋 요소 참조
  let formElement;
  let textInputElement;
  
  // 다이얼로그가 열릴 때 입력란에 포커스
  $: if (isOpen && todo) {
    setTimeout(() => {
      if (textInputElement) {
        textInputElement.focus();
      }
    }, 50);
  }
  
  // 폼 제출 핸들러
  function handleSubmit() {
    if (editText.trim()) {
      onSave({
        ...todo,
        text: editText,
        priority: editPriority
      });
    }
  }
  
  // IME 조합 시작 핸들러
  function handleCompositionStart() {
    isComposing = true;
  }
  
  // IME 조합 종료 핸들러
  function handleCompositionEnd() {
    isComposing = false;
  }
  
  // 엔터키 처리
  function handleKeydown(event) {
    // IME 조합 중이면 처리하지 않음
    if (event.isComposing || isComposing) {
      return;
    }
    
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (editText.trim()) {
        handleSubmit();
      }
    }
  }
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <Dialog.Content 
      class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg"
    >
      <form 
        bind:this={formElement}
        on:submit|preventDefault={handleSubmit}
      >
        <Dialog.Title class="text-lg font-semibold">
          할 일 편집
        </Dialog.Title>
        <Dialog.Description class="text-sm text-muted-foreground mb-4">
          할 일 내용과 우선순위를 수정합니다.
        </Dialog.Description>
        
        <div class="space-y-4">
          <!-- 할 일 텍스트 입력 -->
          <div class="space-y-2">
            <Label for="edit-todo-text" class="text-sm font-medium">할 일</Label>
            <Input 
              id="edit-todo-text"
              bind:value={editText}
              bind:this={textInputElement}
              placeholder="할 일 내용"
              on:keydown={handleKeydown}
              on:compositionstart={handleCompositionStart}
              on:compositionend={handleCompositionEnd}
              autocomplete="off"
            />
          </div>
          
          <!-- 우선순위 선택 -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">우선순위</Label>
            <RadioGroup bind:value={editPriority}>
              {#each PRIORITIES as priority}
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} />
                  <Label for={`priority-${priority.value}`} class={`px-2 py-0.5 rounded-full text-xs ${priority.color}`}>
                    {priority.label}
                  </Label>
                </div>
              {/each}
            </RadioGroup>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" on:click={onClose}>취소</Button>
          </Dialog.Close>
          <Button 
            type="submit"
            disabled={!editText.trim()}
          >
            저장
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root> 