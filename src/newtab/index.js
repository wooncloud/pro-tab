import '../app.css';
import './index.css';
import './style.css';
import App from './NewTab.svelte';
import { loadTheme, applyTheme, setupThemeListener } from '$lib/utils/theme';

// 테마 초기화
async function initializeTheme() {
  try {
    const theme = await loadTheme();
    applyTheme(theme);
    setupThemeListener(theme);
  } catch (error) {
    console.error('테마 초기화 중 오류 발생:', error);
  }
}

// 테마 초기화 실행
initializeTheme();

const app = new App({
  target: document.getElementById('app')
});

export default app; 