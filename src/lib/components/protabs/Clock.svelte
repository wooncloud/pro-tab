<script>
  import { onMount } from "svelte";
  
  // 현재 시간
  let time = new Date();
  // 타이머 ID
  let timer;
  // 확대 모드 (배경 모드에서 사용)
  export let enlarged = false;
  
  // 시간을 00:00 형식으로 포맷팅
  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // 날짜를 YYYY년 MM월 DD일 요일 형식으로 포맷팅
  function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(date);
    
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
  }
  
  // 컴포넌트가 마운트되면 1초마다 시간 업데이트
  onMount(() => {
    timer = setInterval(() => {
      time = new Date();
    }, 1000);
    
    // 컴포넌트가 언마운트되면 타이머 제거
    return () => {
      clearInterval(timer);
    };
  });
</script>

<section class="flex-1 flex flex-col justify-center items-center p-6">
  {#if enlarged}
    <!-- 배경 모드에서 사용되는 확대된 시계 -->
    <h1 class="text-9xl font-bold mb-4 text-white drop-shadow-2xl" style="text-shadow: 0 0 20px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5);">{formatTime(time)}</h1>
    <p class="text-2xl text-white drop-shadow-lg" style="text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);">{formatDate(time)}</p>
  {:else}
    <!-- 기본 시계 -->
    <h1 class="text-7xl font-bold mb-4">{formatTime(time)}</h1>
    <p class="text-xl text-muted-foreground">{formatDate(time)}</p>
  {/if}
</section> 