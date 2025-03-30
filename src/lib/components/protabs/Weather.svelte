<script>
  import { onMount, onDestroy } from "svelte";
  import axios from "axios";
  
  // 날씨 데이터 (기본값)
  export let weather = { condition: "로딩 중...", temperature: "", location: "" };
  
  // 사용자 위치
  let userLocation = {
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  };
  
  // 타이머 ID 저장 변수
  let weatherUpdateTimer;
  
  // 날씨 업데이트 간격 (1시간)
  const WEATHER_UPDATE_INTERVAL = 60 * 60 * 1000;
  
  // 사용자 위치 가져오기
  async function getUserLocation() {
    if (!navigator.geolocation) {
      userLocation.error = "브라우저가 위치 정보를 지원하지 않습니다.";
      userLocation.loading = false;
      return;
    }
    
    try {
      // 위치 정보 권한 요청
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false
      };
      
      // 위치를 기반으로 날씨 정보 가져오기
      fetchWeatherByCoords(userLocation.latitude, userLocation.longitude);
      
    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류 발생:", error);
      userLocation = {
        latitude: null,
        longitude: null,
        error: "위치 정보를 가져올 수 없습니다.",
        loading: false
      };
      
      // 위치 정보를 가져오지 못한 경우 기본 도시 사용
      fetchWeatherByCity("Seoul");
    }
  }
  
  // 날씨 정보 업데이트 함수
  function updateWeather() {
    if (userLocation.latitude && userLocation.longitude) {
      fetchWeatherByCoords(userLocation.latitude, userLocation.longitude);
    } else {
      fetchWeatherByCity("Seoul");
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
  
  // 좌표로 날씨 정보 가져오기
  async function fetchWeatherByCoords(lat, lon) {
    try {
      // OpenWeatherMap API 키 가져오기
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey || apiKey === "your_api_key_here") {
        console.warn("OpenWeatherMap API 키가 설정되지 않았습니다.");
        weather = { 
          condition: "API 키 필요", 
          temperature: "--°C", 
          location: "설정 필요" 
        };
        return;
      }
      
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      // 날씨 데이터 업데이트
      weather = {
        condition: data.weather[0].description,
        temperature: `${Math.round(data.main.temp)}°C`,
        location: data.name
      };
      
    } catch (error) {
      console.error("날씨 정보를 가져오는 중 오류 발생:", error);
      weather = { 
        condition: "오류 발생", 
        temperature: "--°C", 
        location: "재시도 중..." 
      };
    }
  }
  
  // 도시명으로 날씨 정보 가져오기
  async function fetchWeatherByCity(city) {
    try {
      // OpenWeatherMap API 키 가져오기
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey || apiKey === "your_api_key_here") {
        console.warn("OpenWeatherMap API 키가 설정되지 않았습니다.");
        weather = { 
          condition: "API 키 필요", 
          temperature: "--°C", 
          location: "설정 필요" 
        };
        return;
      }
      
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      // 날씨 데이터 업데이트
      weather = {
        condition: data.weather[0].description,
        temperature: `${Math.round(data.main.temp)}°C`,
        location: data.name
      };
      
    } catch (error) {
      console.error("날씨 정보를 가져오는 중 오류 발생:", error);
      weather = { 
        condition: "오류 발생", 
        temperature: "--°C", 
        location: "재시도 중..." 
      };
    }
  }
  
  // 컴포넌트가 마운트될 때 위치 정보와 날씨 데이터 가져오기, 정기 업데이트 시작
  onMount(() => {
    getUserLocation();
    startWeatherUpdates();
  });
  
  // 컴포넌트가 제거될 때 타이머 정리
  onDestroy(() => {
    if (weatherUpdateTimer) {
      clearInterval(weatherUpdateTimer);
    }
  });
</script>

<div class="flex items-center">
  {#if userLocation.loading}
    <span class="text-lg font-medium">위치 정보 가져오는 중...</span>
  {:else}
    <span class="text-lg font-medium">{weather.condition} {weather.temperature}</span>
    <span class="text-sm text-muted-foreground ml-2">{weather.location}</span>
  {/if}
</div> 