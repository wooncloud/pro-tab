<script>
  import { onMount } from 'svelte';
  import { writable, get } from 'svelte/store';
  import { Plus, X } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  
  // Create a store for pinned items
  const pinnedItems = writable([]);
  
  // Pin item input state
  let newPinTitle = '';
  let newPinUrl = '';
  let newPinColor = '#3b82f6'; // Default blue color
  
  // Available colors for pins
  const colors = [
    { value: '#3b82f6', label: '파랑' },
    { value: '#10b981', label: '초록' },
    { value: '#f59e0b', label: '주황' },
    { value: '#ef4444', label: '빨강' },
    { value: '#8b5cf6', label: '보라' }
  ];
  
  onMount(() => {
    // Load pinned items from storage
    loadPinnedItems();
  });
  
  // Load pinned items from storage
  async function loadPinnedItems() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['pinnedItems'], (result) => {
          if (result.pinnedItems) {
            pinnedItems.set(result.pinnedItems);
          }
        });
      } else {
        // For development, load from localStorage
        const storedItems = localStorage.getItem('pinnedItems');
        if (storedItems) {
          pinnedItems.set(JSON.parse(storedItems));
        }
      }
    } catch (error) {
      console.error('Failed to load pinned items:', error);
    }
  }
  
  // Save pinned items to storage
  function savePinnedItems(items) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ pinnedItems: items });
      } else {
        // For development, save to localStorage
        localStorage.setItem('pinnedItems', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to save pinned items:', error);
    }
  }
  
  // Add a new pinned item
  function addPinItem() {
    if (!newPinTitle.trim()) return;
    
    const newPin = {
      id: Date.now().toString(),
      title: newPinTitle,
      url: newPinUrl,
      color: newPinColor,
      createdAt: new Date().toISOString()
    };
    
    const updatedItems = [...get(pinnedItems), newPin];
    pinnedItems.set(updatedItems);
    savePinnedItems(updatedItems);
    
    // Reset form
    newPinTitle = '';
    newPinUrl = '';
  }
  
  // Delete a pinned item
  function deletePinItem(id) {
    const updatedItems = get(pinnedItems).filter(item => item.id !== id);
    pinnedItems.set(updatedItems);
    savePinnedItems(updatedItems);
  }
</script>

<div class="space-y-4">
  <!-- Pin creation form -->
  <div class="space-y-2">
    <div class="grid grid-cols-1 gap-2">
      <Input 
        type="text" 
        placeholder="핀 제목" 
        bind:value={newPinTitle}
        class="text-sm"
      />
      <Input 
        type="text" 
        placeholder="URL (선택사항)" 
        bind:value={newPinUrl}
        class="text-sm"
      />
      <div class="flex items-center space-x-2">
        <span class="text-xs text-readable-muted">색상:</span>
        <div class="flex space-x-1">
          {#each colors as color}
            <button 
              class="w-5 h-5 rounded-full border {newPinColor === color.value ? 'ring-2 ring-ring ring-offset-1' : 'border-border'}" 
              style="background-color: {color.value}" 
              title={color.label}
              aria-label="{color.label} 색상 선택"
              on:click={() => newPinColor = color.value}
            ></button>
          {/each}
        </div>
        <div class="flex-1"></div>
        <Button size="sm" on:click={addPinItem} disabled={!newPinTitle.trim()}>
          <Plus class="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>
    </div>
  </div>
  
  <!-- Pinned items list -->
  <div class="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
    {#if $pinnedItems.length === 0}
      <div class="text-center py-6 text-readable-muted text-sm">
        <p>핀이 없습니다. 새로운 핀을 추가해보세요.</p>
      </div>
    {:else}
      {#each $pinnedItems as pin}
        <Card class="border-l-4" style="border-left-color: {pin.color}">
          <div class="p-3 flex items-start">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-foreground truncate">{pin.title}</h4>
              {#if pin.url}
                <a 
                  href={pin.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-xs text-primary hover:underline truncate block"
                >
                  {pin.url}
                </a>
              {/if}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-6 w-6 -mr-1" 
              on:click={() => deletePinItem(pin.id)}
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
        </Card>
      {/each}
    {/if}
  </div>
</div> 