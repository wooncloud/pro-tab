<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { MoreHorizontal, Pencil, Trash2 } from "lucide-svelte";
  
  // Props
  export let todos = [];
  export let onToggle;
  export let onEdit;
  export let onDelete;
  export let onAdd;
  export let onDeleteAll;
  
  // 상태
  let newTodoText = "";
  let priorityFilter = "all";
  let searchQuery = "";
  
  // 우선순위 매핑
  const priorityLabels = {
    low: "낮음",
    medium: "중간",
    high: "높음"
  };
  
  // 우선순위 색상 클래스
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  
  // 필터된 할 일 항목 계산
  $: filteredTodos = todos
    .filter(todo => {
      // 우선순위 필터링
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) {
        return false;
      }
      
      // 검색어 필터링
      if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // 우선순위 순으로 정렬 (높음 > 중간 > 낮음)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // 완료된 항목은 아래로
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      // 최신 항목 우선
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
  // 할 일 추가 핸들러
  function handleAddTodo() {
    if (newTodoText.trim()) {
      onAdd(newTodoText.trim(), "medium");
      newTodoText = "";
    }
  }
  
  // 엔터 키 핸들러
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  }
  
  // 완료된 할 일 수 계산
  $: completedCount = todos.filter(todo => todo.completed).length;
  $: completionPercentage = todos.length > 0 
    ? Math.round((completedCount / todos.length) * 100) 
    : 0;
</script>

<div class="h-full flex flex-col">
  <!-- 할 일 추가 폼 -->
  <div class="mb-4">
    <div class="flex space-x-2 mb-2">
      <Input 
        type="text" 
        placeholder="할 일 추가..." 
        bind:value={newTodoText}
        on:keydown={handleKeyDown}
        class="flex-1"
      />
      <Button 
        on:click={handleAddTodo} 
        size="sm" 
        disabled={!newTodoText.trim()}
      >
        추가
      </Button>
    </div>
    
    <!-- 검색 및 필터링 -->
    <div class="flex space-x-2 mb-2">
      <Input 
        type="text" 
        placeholder="검색..." 
        bind:value={searchQuery}
        class="flex-1"
      />
      <select 
        bind:value={priorityFilter}
        class="px-2 rounded-md border border-input bg-background"
      >
        <option value="all">모든 우선순위</option>
        <option value="high">높음</option>
        <option value="medium">중간</option>
        <option value="low">낮음</option>
      </select>
    </div>
    
    <!-- 진행 상황 바 -->
    <div class="relative pt-1 mb-2">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold inline-block text-primary">
            진행률: {completionPercentage}%
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold inline-block text-primary">
            {completedCount}/{todos.length}
          </span>
          {#if todos.length > 0}
            <button
              class="text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
              title="모든 할 일 삭제"
              aria-label="모든 할 일 삭제"
              on:click={onDeleteAll}
            >
              <Trash2 class="h-3 w-3" />
            </button>
          {/if}
        </div>
      </div>
      <div class="overflow-hidden h-2 text-xs flex rounded bg-primary/20">
        <div 
          style="width:{completionPercentage}%" 
          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
        ></div>
      </div>
    </div>
  </div>
  
  <!-- 할 일 목록 -->
  <div class="overflow-y-auto flex-1 pr-1">
    {#if filteredTodos.length === 0}
      <div class="text-center py-8">
        {#if todos.length === 0}
          <p class="text-readable-muted">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
        {:else}
          <p class="text-readable-muted">검색 조건에 맞는 할 일이 없습니다.</p>
        {/if}
      </div>
    {:else}
      <ul class="space-y-2">
        {#each filteredTodos as todo (todo.id)}
          <li class={`rounded-md border ${todo.completed ? 'bg-muted/30' : 'hover:bg-muted/30'}`}>
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <Checkbox 
                  id={`todo-${todo.id}`} 
                  checked={todo.completed}
                  onCheckedChange={() => onToggle(todo)}
                />
                <div class="flex flex-col min-w-0">
                  <Label 
                    for={`todo-${todo.id}`}
                    class={`cursor-pointer ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "font-medium"} truncate`}
                  >
                    {todo.text}
                  </Label>
                  
                  {#if todo.priority}
                    <span class={`text-xs px-2 py-0.5 rounded-full w-fit mt-1 ${priorityColors[todo.priority] || ''}`}>
                      {priorityLabels[todo.priority] || todo.priority}
                    </span>
                  {/if}
                </div>
              </div>
              
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    builders={[builder]}
                    class="h-8 w-8"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">작업</span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item 
                    on:click={() => onEdit(todo)}
                    class="cursor-pointer"
                  >
                    <Pencil class="mr-2 h-4 w-4" />
                    <span>편집</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    on:click={() => onDelete(todo)}
                    class="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    <span>삭제</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div> 