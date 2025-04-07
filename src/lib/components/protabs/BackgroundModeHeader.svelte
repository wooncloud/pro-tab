<script>
  import { X } from "lucide-svelte";
  import Weather from "$lib/components/protabs/Weather.svelte";
  import { setBackgroundMode } from "$lib/utils/backgroundMode";
  
  // 배경 모드 종료 핸들러
  function exitBackgroundMode() {
    setBackgroundMode(false);
  }
</script>

<div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
  <!-- 왼쪽 상단 - 날씨 간소화 표시 -->
  <div class="bg-black/40 backdrop-blur-lg p-2 rounded-lg shadow-lg">
    <Weather minimized={true} />
  </div>
  
  <!-- 오른쪽 상단 - 모드 종료 버튼 -->
  <button 
    on:click={exitBackgroundMode} 
    class="bg-black/40 backdrop-blur-lg p-2 rounded-lg text-white hover:bg-black/60 transition-colors shadow-lg"
    title="배경 모드 종료"
    aria-label="배경 모드 종료"
  >
    <X class="h-5 w-5" />
  </button>
</div> 