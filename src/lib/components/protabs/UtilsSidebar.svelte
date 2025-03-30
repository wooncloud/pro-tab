<script>
  import * as Tabs from "$lib/components/ui/tabs";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label/index.js";
  
  // Todo 샘플 데이터
  export let todos = [
    { id: 1, text: "Pro Tabs 개발하기", completed: false },
    { id: 2, text: "메인 화면 디자인", completed: true },
    { id: 3, text: "날씨 API 연동", completed: false }
  ];
  
  // 메모 텍스트
  export let memo = "";
  
  // 새 할 일 텍스트
  let newTodo = "";
  
  // 할 일 추가 함수
  function addTodo() {
    if (newTodo.trim()) {
      const id = Math.max(0, ...todos.map(t => t.id)) + 1;
      todos = [...todos, { id, text: newTodo, completed: false }];
      newTodo = "";
    }
  }
  
  // 할 일 토글 함수
  function toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
</script>

<aside class="w-80 border-l h-full flex flex-col">
  <div class="p-4 h-full flex flex-col">
    <Tabs.Root value="todos" class="w-full h-full flex flex-col">
      <Tabs.List class="grid w-full grid-cols-2">
        <Tabs.Trigger value="todos">할 일</Tabs.Trigger>
        <Tabs.Trigger value="memo">메모</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="todos" class="flex-1 overflow-hidden mt-2">
        <div class="mb-4 flex space-x-2">
          <Input 
            type="text" 
            placeholder="할 일 추가..." 
            bind:value={newTodo}
            on:keypress={(e) => e.key === 'Enter' && addTodo()}
            class="flex-1"
          />
          <Button on:click={addTodo} size="sm">추가</Button>
        </div>
        <div class="overflow-y-auto h-[calc(100%-50px)] pr-1">
          <ul class="space-y-2">
            {#each todos as todo (todo.id)}
              <li class="hover:bg-muted/50 rounded-md">
                <div class="flex items-center space-x-2 p-2">
                  <Checkbox 
                    id={`todo-${todo.id}`} 
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <Label 
                    for={`todo-${todo.id}`}
                    class={todo.completed ? "line-through text-muted-foreground cursor-pointer" : "cursor-pointer"}
                  >
                    {todo.text}
                  </Label>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </Tabs.Content>
      
      <Tabs.Content value="memo" class="flex-1 overflow-hidden mt-2">
        <textarea 
          bind:value={memo}
          class="w-full h-full p-2 rounded-md border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="메모를 입력하세요..."
        ></textarea>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</aside> 