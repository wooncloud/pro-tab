<script>
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { Edit, Trash2, MoreVertical } from "lucide-svelte";
  import { getPriorityColor } from "./TodoStorage";
  
  export let todo;
  export let onToggle;
  export let onEdit;
  export let onDelete;
  
  // 우선순위 별 배지 색상 가져오기
  $: priorityColor = getPriorityColor(todo.priority);
</script>

<li class="hover:bg-muted/50 rounded-md group">
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <div class="flex items-center justify-between p-2">
        <div class="flex items-center space-x-2 flex-1">
          <Checkbox 
            id={`todo-${todo.id}`} 
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo)}
          />
          <Label 
            for={`todo-${todo.id}`}
            class={todo.completed ? "line-through text-muted-foreground cursor-pointer" : "cursor-pointer"}
          >
            {todo.text}
          </Label>
          
          <!-- 우선순위 뱃지 -->
          <span class={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>
            {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '중간' : '낮음'}
          </span>
        </div>
        
        <!-- 작업 버튼 (모바일에서 항상 표시) -->
        <div class="opacity-0 group-hover:opacity-100 sm:flex hidden">
          <button 
            class="p-1 rounded-md hover:bg-muted"
            on:click={() => onEdit(todo)}
          >
            <Edit class="h-4 w-4 text-muted-foreground" />
          </button>
          <button 
            class="p-1 rounded-md hover:bg-muted"
            on:click={() => onDelete(todo)}
          >
            <Trash2 class="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>
    </ContextMenu.Trigger>
    
    <!-- 컨텍스트 메뉴 (우클릭 시) -->
    <ContextMenu.Content>
      <ContextMenu.Item on:click={() => onEdit(todo)}>
        <Edit class="h-4 w-4 mr-2" />
        할 일 편집
      </ContextMenu.Item>
      <ContextMenu.Item on:click={() => onToggle(todo)}>
        <Checkbox class="h-4 w-4 mr-2" checked={todo.completed} />
        {todo.completed ? '미완료로 표시' : '완료로 표시'}
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item class="text-destructive focus:text-destructive" on:click={() => onDelete(todo)}>
        <Trash2 class="h-4 w-4 mr-2" />
        삭제
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
</li> 