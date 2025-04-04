<script>
  import { onMount, onDestroy } from "svelte";
  import { 
    fetchWeatherByCoords, 
    fetchWeatherByCity, 
    getUserLocation,
    WEATHER_UPDATE_INTERVAL
  } from "$lib/components/weather/weatherService";
  import WeatherDisplay from "$lib/components/weather/WeatherDisplay.svelte";
  import { 
    Sun, 
    Cloud, 
    CloudRain, 
    CloudSnow, 
    CloudFog, 
    CloudLightning, 
    CloudDrizzle,
    Loader2
  } from "lucide-svelte";
  
  // 날씨 데이터 (기본값)
  let weather = { 
    condition: "로딩 중...", 
    temperature: "", 
    location: "",
    icon: "",
    weatherId: null
  };
  
  // 사용자 위치
  let userLocation = {
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  };
  
  // 타이머 ID 저장 변수
  let weatherUpdateTimer;
  
  // 간소화 모드 활성화 여부 (배경 모드에서 사용)
  export let minimized = false;
  
  // 날씨 ID에 따른 아이콘 매핑
  // OpenWeatherMap API 날씨 코드: https://openweathermap.org/weather-conditions
  const getWeatherIcon = (weatherId) => {
    if (!weatherId) return null;
    
    // Group 2xx: 뇌우
    if (weatherId >= 200 && weatherId < 300) {
      return CloudLightning;
    }
    // Group 3xx: 이슬비
    else if (weatherId >= 300 && weatherId < 400) {
      return CloudDrizzle;
    }
    // Group 5xx: 비
    else if (weatherId >= 500 && weatherId < 600) {
      return CloudRain;
    }
    // Group 6xx: 눈
    else if (weatherId >= 600 && weatherId < 700) {
      return CloudSnow;
    }
    // Group 7xx: 대기 상태(안개, 연무 등)
    else if (weatherId >= 700 && weatherId < 800) {
      return CloudFog;
    }
    // Group 800: 맑음
    else if (weatherId === 800) {
      return Sun;
    }
    // Group 80x: 구름
    else if (weatherId > 800 && weatherId < 900) {
      return Cloud;
    }
    
    return null;
  };
  
  // 날씨 코드에 따른 색상 클래스
  const getWeatherColorClass = (weatherId) => {
    if (!weatherId) return "";
    
    if (weatherId >= 200 && weatherId < 300) { // 뇌우
      return "text-yellow-500";
    } else if (weatherId >= 300 && weatherId < 400) { // 이슬비
      return "text-blue-400";
    } else if (weatherId >= 500 && weatherId < 600) { // 비
      return "text-blue-500";
    } else if (weatherId >= 600 && weatherId < 700) { // 눈
      return "text-blue-200";
    } else if (weatherId >= 700 && weatherId < 800) { // 안개
      return "text-gray-400";
    } else if (weatherId === 800) { // 맑음
      return "text-yellow-400";
    } else if (weatherId > 800 && weatherId < 900) { // 구름
      return "text-gray-500";
    }
    
    return "";
  };
  
  // 날씨 정보 업데이트 함수
  async function updateWeather() {
    if (userLocation.latitude && userLocation.longitude) {
      weather = await fetchWeatherByCoords(userLocation.latitude, userLocation.longitude);
    } else {
      weather = await fetchWeatherByCity("Seoul");
    }
  }
  
  // 위치 정보 초기화 및 날씨 가져오기
  async function initializeWeather() {
    try {
      userLocation = { ...userLocation, loading: true };
      
      // 사용자 위치 가져오기
      const locationData = await getUserLocation();
      userLocation = locationData;
      
      // 위치 정보가 있으면 좌표로 날씨 가져오기, 없으면 도시명으로 가져오기
      await updateWeather();
      
    } catch (error) {
      console.error("날씨 초기화 중 오류 발생:", error);
      userLocation.loading = false;
    }
  }
  
  // 정기적인 날씨 업데이트 시작
  function startWeatherUpdates() {
    // 기존 타이머가 있으면 제거
    if (weatherUpdateTimer) {
      clearInterval(weatherUpdateTimer);
    }
    
    // 1시간마다 날씨 정보 업데이트
    weatherUpdateTimer = setInterval(() => {
      updateWeather();
    }, WEATHER_UPDATE_INTERVAL);
  }
  
  // 컴포넌트가 마운트될 때 위치 정보와 날씨 데이터 가져오기, 정기 업데이트 시작
  onMount(() => {
    initializeWeather();
    startWeatherUpdates();
  });
  
  // 컴포넌트가 제거될 때 타이머 정리
  onDestroy(() => {
    if (weatherUpdateTimer) {
      clearInterval(weatherUpdateTimer);
    }
  });
  
  // 현재 날씨에 따른 아이콘 컴포넌트
  $: WeatherIcon = getWeatherIcon(weather.weatherId);
  $: weatherColorClass = getWeatherColorClass(weather.weatherId);
</script>

<WeatherDisplay {weather} isLoading={userLocation.loading} {minimized} /> 