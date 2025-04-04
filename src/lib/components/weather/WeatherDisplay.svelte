<script>
  import { getWeatherIcon, getWeatherColorClass, LoadingIcon } from './weatherIcons';
  
  // 날씨 데이터를 props로 받음
  export let weather = { 
    condition: "로딩 중...", 
    temperature: "", 
    location: "",
    icon: "",
    weatherId: null
  };
  
  export let isLoading = false;
  
  // 간소화 모드 (배경 모드에서 사용)
  export let minimized = false;
  
  // 현재 날씨에 따른 아이콘 컴포넌트
  $: WeatherIcon = getWeatherIcon(weather.weatherId);
  $: weatherColorClass = getWeatherColorClass(weather.weatherId);
</script>

{#if minimized}
  <!-- 간소화된 날씨 표시 (배경 모드용) -->
  <div class="flex items-center">
    {#if isLoading}
      <LoadingIcon class="h-5 w-5 animate-spin" />
    {:else}
      {#if WeatherIcon}
        <svelte:component this={WeatherIcon} class={`h-5 w-5 mr-1 ${weatherColorClass}`} />
      {/if}
      <span class="text-base font-medium">{weather.temperature}</span>
    {/if}
  </div>
{:else}
  <!-- 기본 날씨 표시 -->
  <div class="flex items-center">
    {#if isLoading}
      <div class="flex items-center">
        <LoadingIcon class="h-5 w-5 mr-2 animate-spin" />
        <span class="text-lg font-medium">위치 정보 가져오는 중...</span>
      </div>
    {:else}
      <div class="flex items-center">
        {#if WeatherIcon}
          <svelte:component this={WeatherIcon} class={`h-6 w-6 mr-2 ${weatherColorClass}`} />
        {/if}
        <span class="text-lg font-medium">{weather.condition} {weather.temperature}</span>
        <span class="text-sm text-muted-foreground ml-2">{weather.location}</span>
      </div>
    {/if}
  </div>
{/if} 