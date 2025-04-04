<script>
  import { onMount, onDestroy } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Sun, Moon, Laptop } from "lucide-svelte";
  import { 
    loadTheme, 
    saveTheme, 
    applyTheme, 
    setupThemeListener,
    THEME_LIGHT,
    THEME_DARK,
    THEME_SYSTEM
  } from '$lib/utils/theme';
  
  // 현재 테마 상태
  let currentTheme = THEME_SYSTEM;
  // 시스템 테마 변경 감지 클린업 함수
  let cleanupThemeListener;
  
  // 테마에 따른 아이콘 및 텍스트 정보
  const themeInfo = {
    [THEME_LIGHT]: { 
      icon: Sun, 
      label: '라이트 모드',
      iconClass: 'text-yellow-500'
    },
    [THEME_DARK]: { 
      icon: Moon, 
      label: '다크 모드',
      iconClass: 'text-blue-500'
    },
    [THEME_SYSTEM]: { 
      icon: Laptop, 
      label: '시스템 설정',
      iconClass: 'text-gray-500'
    }
  };
  
  // 컴포넌트 마운트 시 테마 로드 및 적용
  onMount(async () => {
    try {
      // 저장된 테마 불러오기
      currentTheme = await loadTheme();
      
      // 테마 적용
      applyTheme(currentTheme);
      
      // 시스템 테마 변경 감지 설정
      cleanupThemeListener = setupThemeListener(currentTheme);
    } catch (error) {
      console.error('테마 초기화 중 오류 발생:', error);
    }
  });
  
  // 컴포넌트 언마운트 시 리스너 클린업
  onDestroy(() => {
    if (cleanupThemeListener) {
      cleanupThemeListener();
    }
  });
  
  // 테마 변경 핸들러
  async function changeTheme(theme) {
    // 클린업 함수가 있으면 호출
    if (cleanupThemeListener) {
      cleanupThemeListener();
    }
    
    // 테마 상태 업데이트
    currentTheme = theme;
    
    // 테마 적용
    applyTheme(theme);
    
    // 테마 저장
    await saveTheme(theme);
    
    // 시스템 테마 감지 리스너 다시 설정
    cleanupThemeListener = setupThemeListener(theme);
  }
  
  // 현재 테마에 따른 정보
  $: currentThemeInfo = themeInfo[currentTheme];
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button 
      variant="ghost" 
      size="icon"
      builders={[builder]}
      class="h-9 w-9"
      title={currentThemeInfo.label}
    >
      <svelte:component 
        this={currentThemeInfo.icon} 
        class={`h-5 w-5 ${currentThemeInfo.iconClass}`} 
      />
      <span class="sr-only">{currentThemeInfo.label}</span>
    </Button>
  </DropdownMenu.Trigger>
  
  <DropdownMenu.Content>
    <DropdownMenu.Label>테마 선택</DropdownMenu.Label>
    
    <DropdownMenu.Item 
      on:click={() => changeTheme(THEME_LIGHT)}
      class="cursor-pointer {currentTheme === THEME_LIGHT ? 'bg-accent' : ''}"
    >
      <Sun class="mr-2 h-4 w-4 text-yellow-500" />
      <span>라이트 모드</span>
      {#if currentTheme === THEME_LIGHT}
        <DropdownMenu.Shortcut>✓</DropdownMenu.Shortcut>
      {/if}
    </DropdownMenu.Item>
    
    <DropdownMenu.Item 
      on:click={() => changeTheme(THEME_DARK)}
      class="cursor-pointer {currentTheme === THEME_DARK ? 'bg-accent' : ''}"
    >
      <Moon class="mr-2 h-4 w-4 text-blue-500" />
      <span>다크 모드</span>
      {#if currentTheme === THEME_DARK}
        <DropdownMenu.Shortcut>✓</DropdownMenu.Shortcut>
      {/if}
    </DropdownMenu.Item>
    
    <DropdownMenu.Item 
      on:click={() => changeTheme(THEME_SYSTEM)}
      class="cursor-pointer {currentTheme === THEME_SYSTEM ? 'bg-accent' : ''}"
    >
      <Laptop class="mr-2 h-4 w-4 text-gray-500" />
      <span>시스템 설정</span>
      {#if currentTheme === THEME_SYSTEM}
        <DropdownMenu.Shortcut>✓</DropdownMenu.Shortcut>
      {/if}
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root> 