<script>
  import { Button } from "$lib/components/ui/button";
  import { Image, Maximize2 } from "lucide-svelte";
  import { toggleBackgroundMode } from "$lib/utils/backgroundMode";
</script>

<footer class="p-4 flex justify-between items-center border-t">
  <div class="flex space-x-2">
    <!-- 배경 변경 버튼 -->
    <Button variant="ghost" size="sm">
      <Image class="h-5 w-5 mr-2" />
      배경 변경
    </Button>
    
    <!-- 배경 모드 버튼 -->
    <Button variant="ghost" size="sm" on:click={toggleBackgroundMode}>
      <Maximize2 class="h-5 w-5 mr-2" />
      배경 모드
    </Button>
  </div>
  
  <Button variant="link" class="text-sm text-muted-foreground hover:text-primary h-auto p-0">
    개발자 후원하기
  </Button>
</footer> 