import axios from "axios";

// 날씨 업데이트 간격 (1시간)
export const WEATHER_UPDATE_INTERVAL = 60 * 60 * 1000;

/**
 * 좌표로 날씨 정보 가져오기
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @returns {Promise<Object>} 날씨 데이터
 */
export async function fetchWeatherByCoords(lat, lon) {
  try {
    // OpenWeatherMap API 키 가져오기
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("OpenWeatherMap API 키가 설정되지 않았습니다.");
      return { 
        condition: "API 키 필요", 
        temperature: "--°C", 
        location: "설정 필요",
        icon: "",
        weatherId: null
      };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    // 날씨 데이터 반환
    return {
      condition: data.weather[0].description,
      temperature: `${Math.round(data.main.temp)}°C`,
      location: data.name,
      icon: data.weather[0].icon,
      weatherId: data.weather[0].id
    };
    
  } catch (error) {
    console.error("날씨 정보를 가져오는 중 오류 발생:", error);
    return { 
      condition: "오류 발생", 
      temperature: "--°C", 
      location: "재시도 중...",
      icon: "",
      weatherId: null
    };
  }
}

/**
 * 도시명으로 날씨 정보 가져오기
 * @param {string} city - 도시 이름
 * @returns {Promise<Object>} 날씨 데이터
 */
export async function fetchWeatherByCity(city) {
  try {
    // OpenWeatherMap API 키 가져오기
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("OpenWeatherMap API 키가 설정되지 않았습니다.");
      return { 
        condition: "API 키 필요", 
        temperature: "--°C", 
        location: "설정 필요",
        icon: "",
        weatherId: null
      };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    // 날씨 데이터 반환
    return {
      condition: data.weather[0].description,
      temperature: `${Math.round(data.main.temp)}°C`,
      location: data.name,
      icon: data.weather[0].icon,
      weatherId: data.weather[0].id
    };
    
  } catch (error) {
    console.error("날씨 정보를 가져오는 중 오류 발생:", error);
    return { 
      condition: "오류 발생", 
      temperature: "--°C", 
      location: "재시도 중...",
      icon: "",
      weatherId: null
    };
  }
}

/**
 * 사용자 위치 정보 가져오기
 * @returns {Promise<Object>} 위치 정보 객체
 */
export async function getUserLocation() {
  if (!navigator.geolocation) {
    return {
      latitude: null,
      longitude: null,
      error: "브라우저가 위치 정보를 지원하지 않습니다.",
      loading: false
    };
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
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: null,
      loading: false
    };
    
  } catch (error) {
    console.error("위치 정보를 가져오는 중 오류 발생:", error);
    return {
      latitude: null,
      longitude: null,
      error: "위치 정보를 가져올 수 없습니다.",
      loading: false
    };
  }
} 