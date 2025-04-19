<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { MoreHorizontal, Pencil, Trash2, Plus, Save, Flag, Filter, CheckCircle2, CircleDashed, Circle } from "lucide-svelte";
  import { PRIORITIES, getPriorityColor } from "./TodoStorage";
  
  // Props
  export let todos = [];
  export let onToggle;
  export let onEdit;
  export let onDelete;
  export let onAdd;
  export let onDeleteAll;
  
  // 상태
  let newTodoText = "";
  let isComposing = false; // IME 조합 상태 추적
  let newTodoPriority = "medium"; // 새 할 일의 우선순위 기본값
  let isPriorityDropdownOpen = false;
  let isStatusFilterOpen = false;
  let statusFilter = "all"; // 'all', 'active', 'completed'
  
  // 우선순위 매핑
  const priorityLabels = {
    low: "낮음",
    medium: "중간",
    high: "높음"
  };
  
  // 우선순위 아이콘 색상
  const priorityIconColors = {
    low: "text-blue-500",
    medium: "text-amber-500",
    high: "text-red-500"
  };
  
  // 상태 필터 아이콘과 레이블
  const statusFilters = [
    { value: "all", label: "전체", icon: CircleDashed },
    { value: "active", label: "미완료", icon: Circle },
    { value: "completed", label: "완료", icon: CheckCircle2 }
  ];
  
  // 필터와 정렬이 적용된 할 일 목록 계산
  $: filteredAndSortedTodos = todos
    .filter(todo => {
      // 상태 필터링
      if (statusFilter === "active") return !todo.completed;
      if (statusFilter === "completed") return todo.completed;
      return true; // all
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
  
  // 현재 필터에 맞는 아이콘 가져오기
  $: currentStatusFilterIcon = statusFilters.find(f => f.value === statusFilter)?.icon || CircleDashed;
  
  // 할 일 추가 핸들러
  function handleAddTodo() {
    if (newTodoText.trim()) {
      onAdd(newTodoText.trim(), newTodoPriority);
      newTodoText = "";
    }
  }
  
  // 엔터 키 핸들러
  function handleKeyDown(event) {
    // isComposing이 true면 한글 등의 IME 입력 중이므로 처리하지 않음
    if (event.isComposing || isComposing) {
      return;
    }
    
    if (event.key === "Enter") {
      handleAddTodo();
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
  
  // 우선순위 선택 핸들러
  function selectPriority(priority) {
    newTodoPriority = priority;
    isPriorityDropdownOpen = false;
  }
  
  // 상태 필터 선택 핸들러
  function selectStatusFilter(filter) {
    statusFilter = filter;
    isStatusFilterOpen = false;
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
      <!-- 우선순위 선택 드롭다운 -->
      <DropdownMenu.Root bind:open={isPriorityDropdownOpen}>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            variant="outline"
            size="icon"
            builders={[builder]}
            title="우선순위 선택"
            aria-label="우선순위 선택"
            class={priorityIconColors[newTodoPriority]}
          >
            <Flag class="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {#each PRIORITIES as priority}
            <DropdownMenu.Item 
              on:click={() => selectPriority(priority.value)}
              class={`cursor-pointer ${priority.value === newTodoPriority ? 'bg-muted' : ''}`}
            >
              <span class={priority.color + " mr-2"}>
                <Flag class="h-4 w-4" />
              </span>
              <span>{priority.label}</span>
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      
      <Input 
        type="text" 
        placeholder="할 일 추가..." 
        bind:value={newTodoText}
        on:keydown={handleKeyDown}
        on:compositionstart={handleCompositionStart}
        on:compositionend={handleCompositionEnd}
        class="flex-1"
      />
      
      <Button 
        on:click={handleAddTodo} 
        size="icon" 
        disabled={!newTodoText.trim()}
        title="할 일 추가"
        aria-label="할 일 추가"
      >
        <Save class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- 진행 상황 바 -->
    <div class="relative pt-1 mb-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- 상태 필터 드롭다운 -->
          <DropdownMenu.Root bind:open={isStatusFilterOpen}>
            <DropdownMenu.Trigger asChild let:builder>
              <Button
                variant="outline"
                size="sm"
                builders={[builder]}
                title="완료 상태 필터"
                aria-label="완료 상태 필터"
                class="h-6 px-2 text-xs"
              >
                <svelte:component this={currentStatusFilterIcon} class="h-3 w-3 mr-1" />
                <span class="sr-only sm:not-sr-only sm:inline">{statusFilters.find(f => f.value === statusFilter)?.label}</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              {#each statusFilters as filter}
                <DropdownMenu.Item 
                  on:click={() => selectStatusFilter(filter.value)}
                  class={`cursor-pointer ${filter.value === statusFilter ? 'bg-muted' : ''}`}
                >
                  <svelte:component this={filter.icon} class="mr-2 h-4 w-4" />
                  <span>{filter.label}</span>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          
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
      <div class="overflow-hidden h-2 mt-2 text-xs flex rounded bg-primary/20">
        <div 
          style="width:{completionPercentage}%" 
          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
        ></div>
      </div>
    </div>
  </div>
  
  <!-- 할 일 목록 -->
  <div class="overflow-y-auto flex-1 pr-1">
    {#if filteredAndSortedTodos.length === 0}
      <div class="text-center py-8">
        {#if todos.length === 0}
          <p class="text-readable-muted">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
        {:else}
          <p class="text-readable-muted">
            {#if statusFilter === "active"}
              미완료된 할 일이 없습니다.
            {:else if statusFilter === "completed"}
              완료된 할 일이 없습니다.
            {:else}
              필터 조건에 맞는 할 일이 없습니다.
            {/if}
          </p>
        {/if}
      </div>
    {:else}
      <ul class="space-y-2">
        {#each filteredAndSortedTodos as todo (todo.id)}
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
                    class={`cursor-pointer ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "font-medium text-foreground"} break-words`}
                  >
                    {todo.text}
                  </Label>
                  
                  {#if todo.priority}
                    <span class={`text-xs px-2 py-0.5 rounded-full w-fit mt-1 ${getPriorityColor(todo.priority)}`}>
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