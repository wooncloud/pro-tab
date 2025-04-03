<script>
  import * as Tabs from "$lib/components/ui/tabs";
  import TodoComponent from "$lib/components/todos/TodoComponent.svelte";
  import MemoComponent from "$lib/components/memos/MemoComponent.svelte";
</script>

<aside class="w-80 border-l h-full flex flex-col">
  <div class="p-4 h-full flex flex-col">
    <Tabs.Root value="todos" class="w-full h-full flex flex-col">
      <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger value="todos">할 일</Tabs.Trigger>
        <Tabs.Trigger value="memo">메모</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="todos" class="flex-1 overflow-hidden mt-2">
        <TodoComponent />
      </Tabs.Content>
      
      <Tabs.Content value="memo" class="flex-1 overflow-hidden mt-2">
        <MemoComponent />
      </Tabs.Content>
    </Tabs.Root>
  </div>
</aside> 