<script>
  import { onMount } from 'svelte';
  import { loadTodos, saveTodos } from './TodoStorage';
  import TodoList from './TodoList.svelte';
  import EditTodoDialog from './EditTodoDialog.svelte';
  import DeleteTodoDialog from './DeleteTodoDialog.svelte';
  
  // 할 일 데이터
  let todos = [];
  let isLoading = true;
  let loadError = null;
  
  // 편집 상태
  let isEditDialogOpen = false;
  let editingTodo = null;
  
  // 삭제 상태
  let isDeleteDialogOpen = false;
  let deletingTodo = null;
  
  // 컴포넌트 마운트 시 데이터 로드
  onMount(async () => {
    await loadData();
  });
  
  // 할 일 데이터 로드
  async function loadData() {
    try {
      isLoading = true;
      loadError = null;
      todos = await loadTodos();
    } catch (error) {
      console.error("할 일 로드 중 오류:", error);
      loadError = error.message || "할 일 데이터를 불러오는 중 오류가 발생했습니다.";
    } finally {
      isLoading = false;
    }
  }
  
  // 할 일 추가
  function addTodo(text, priority = "medium") {
    const id = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    const newTodo = { 
      id, 
      text, 
      completed: false, 
      priority, 
      createdAt: new Date().toISOString()
    };
    
    todos = [...todos, newTodo];
    saveTodos(todos);
  }
  
  // 할 일 토글
  function toggleTodo(todo) {
    todos = todos.map(t => {
      if (t.id === todo.id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTodos(todos);
  }
  
  // 할 일 편집 시작
  function startEditTodo(todo) {
    editingTodo = todo;
    isEditDialogOpen = true;
  }
  
  // 할 일 편집 저장
  function saveEditTodo(updatedTodo) {
    todos = todos.map(t => {
      if (t.id === updatedTodo.id) {
        return updatedTodo;
      }
      return t;
    });
    
    saveTodos(todos);
    closeEditDialog();
  }
  
  // 편집 다이얼로그 닫기
  function closeEditDialog() {
    isEditDialogOpen = false;
    editingTodo = null;
  }
  
  // 할 일 삭제 시작
  function startDeleteTodo(todo) {
    deletingTodo = todo;
    isDeleteDialogOpen = true;
  }
  
  // 할 일 삭제 실행
  function executeDeleteTodo(todo) {
    if (todo && todo.id) {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos(todos);
    }
    closeDeleteDialog();
  }
  
  // 삭제 다이얼로그 닫기
  function closeDeleteDialog() {
    isDeleteDialogOpen = false;
    deletingTodo = null;
  }
</script>

<div class="h-full">
  {#if isLoading}
    <div class="flex justify-center items-center h-full">
      <p class="text-muted-foreground">할 일 로딩 중...</p>
    </div>
  {:else if loadError}
    <div class="flex flex-col justify-center items-center h-full text-destructive">
      <p>{loadError}</p>
      <button 
        class="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
        on:click={loadData}
      >
        다시 시도
      </button>
    </div>
  {:else}
    <TodoList 
      {todos}
      onToggle={toggleTodo}
      onEdit={startEditTodo}
      onDelete={startDeleteTodo}
      onAdd={addTodo}
    />
  {/if}
  
  <!-- 편집 다이얼로그 -->
  <EditTodoDialog
    bind:isOpen={isEditDialogOpen}
    todo={editingTodo}
    onSave={saveEditTodo}
    onClose={closeEditDialog}
  />
  
  <!-- 삭제 확인 다이얼로그 -->
  <DeleteTodoDialog
    bind:isOpen={isDeleteDialogOpen}
    todo={deletingTodo}
    onDelete={executeDeleteTodo}
    onClose={closeDeleteDialog}
  />
</div> 