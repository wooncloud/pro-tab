<script>
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Input } from "$lib/components/ui/input";
  
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

<aside class="w-80 p-4 border-l">
  <Tabs defaultValue="todos" class="w-full">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="todos">할 일</TabsTrigger>
      <TabsTrigger value="memo">메모</TabsTrigger>
    </TabsList>
    <TabsContent value="todos" class="pt-4">
      <div class="mb-4 flex">
        <Input 
          type="text" 
          placeholder="할 일 추가..." 
          bind:value={newTodo}
          on:keypress={(e) => e.key === 'Enter' && addTodo()}
          class="flex-1"
        />
      </div>
      <ul class="space-y-2">
        {#each todos as todo (todo.id)}
          <li class="flex items-center">
            <input 
              type="checkbox" 
              checked={todo.completed} 
              on:change={() => toggleTodo(todo.id)}
              class="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-primary"
            />
            <span class={todo.completed ? "line-through text-muted-foreground" : ""}>
              {todo.text}
            </span>
          </li>
        {/each}
      </ul>
    </TabsContent>
    <TabsContent value="memo" class="pt-4">
      <textarea 
        bind:value={memo}
        class="w-full h-48 p-2 rounded-md border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="메모를 입력하세요..."
      ></textarea>
    </TabsContent>
  </Tabs>
</aside> 