<script>
  // 빈 상태 UI 컴포넌트
  // 한국어 주석, UI 문자열은 영어로 작성
  export let message = "No bookmarks saved.";
  export let subMessage = "Click the button above to add a bookmark.";
</script>

<div class="flex flex-col items-center justify-center h-full text-readable-muted text-sm">
  <p>{message}</p>
  {#if subMessage}
    <p>{subMessage}</p>
  {/if}
</div> 