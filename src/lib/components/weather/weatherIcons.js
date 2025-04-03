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

/**
 * 날씨 ID에 따른 아이콘 매핑
 * OpenWeatherMap API 날씨 코드: https://openweathermap.org/weather-conditions
 * @param {number} weatherId - OpenWeatherMap API의 날씨 ID
 * @returns {Object|null} 날씨 아이콘 컴포넌트
 */
export const getWeatherIcon = (weatherId) => {
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

/**
 * 날씨 코드에 따른 색상 클래스
 * @param {number} weatherId - OpenWeatherMap API의 날씨 ID
 * @returns {string} Tailwind CSS 색상 클래스
 */
export const getWeatherColorClass = (weatherId) => {
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

/**
 * 날씨 코드를 한글 설명으로 변환
 * @param {number} weatherId - OpenWeatherMap API의 날씨 ID
 * @returns {string} 날씨 상태 한글 설명
 */
export const getWeatherDescription = (weatherId) => {
  if (!weatherId) return "날씨 정보 없음";
  
  if (weatherId >= 200 && weatherId < 300) {
    return "뇌우";
  } else if (weatherId >= 300 && weatherId < 400) {
    return "이슬비";
  } else if (weatherId >= 500 && weatherId < 600) {
    return "비";
  } else if (weatherId >= 600 && weatherId < 700) {
    return "눈";
  } else if (weatherId >= 700 && weatherId < 800) {
    return "안개";
  } else if (weatherId === 800) {
    return "맑음";
  } else if (weatherId > 800 && weatherId < 900) {
    return "구름";
  }
  
  return "날씨 정보 없음";
};

// 로딩 아이콘
export const LoadingIcon = Loader2; 