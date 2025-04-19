<script>
  // 에러 상태 UI 컴포넌트
  // 한국어 주석, UI 문자열은 영어로 작성
  export let errorMessage = "An error occurred while loading bookmarks.";
  export let onRetry = null;
</script>

<div class="flex flex-col items-center justify-center h-full text-sm">
  <p class="text-error">Error: {errorMessage}</p>
  {#if onRetry}
    <button 
      class="mt-2 px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
      on:click={onRetry}
    >
      Retry
    </button>
  {/if}
</div> 