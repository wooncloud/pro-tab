<script>
  import { onMount, onDestroy } from 'svelte';
  
  // 시간 및 날짜 상태
  let currentTime = new Date();
  let currentDate = new Date();
  let timer;
  
  // 날짜 형식 포맷팅 (예: 2024년 3월 30일 토요일)
  function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ko-KR', options);
  }
  
  // 시간을 실시간으로 업데이트하는 함수
  function updateTime() {
    currentTime = new Date();
    currentDate = new Date();
  }
  
  // 컴포넌트가 마운트될 때 타이머 설정
  onMount(() => {
    updateTime(); // 초기 시간 설정
    timer = setInterval(updateTime, 1000); // 1초마다 시간 업데이트
  });
  
  // 컴포넌트가 제거될 때 타이머 정리
  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<div class="flex-1 flex flex-col items-center justify-center p-4">
  <h1 class="text-7xl font-bold mb-2">
    {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
  </h1>
  <p class="text-xl text-muted-foreground">
    {formatDate(currentDate)}
  </p>
</div> 