// 할 일 저장소 관리를 위한 유틸리티 함수들

// 스토리지 키 상수
const STORAGE_KEY = 'pro_tabs_todos';

/**
 * 할 일 목록을 로드하는 함수
 * Chrome Storage API를 사용하고, 실패 시 로컬 스토리지를 사용
 */
export async function loadTodos() {
  try {
    // Chrome Extension 환경인 경우 Chrome Storage API 사용
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          const todos = result[STORAGE_KEY] || getDefaultTodos();
          resolve(todos);
        });
      });
    } else {
      // 일반 브라우저 환경인 경우 로컬 스토리지 사용
      const todosJson = localStorage.getItem(STORAGE_KEY);
      return todosJson ? JSON.parse(todosJson) : getDefaultTodos();
    }
  } catch (error) {
    console.error('할 일 로드 중 오류 발생:', error);
    return getDefaultTodos();
  }
}

/**
 * 할 일 목록을 저장하는 함수
 * @param {Array} todos 저장할 할 일 목록
 */
export async function saveTodos(todos) {
  try {
    // Chrome Extension 환경인 경우 Chrome Storage API 사용
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: todos }, () => {
          resolve(true);
        });
      });
    } else {
      // 일반 브라우저 환경인 경우 로컬 스토리지 사용
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      return true;
    }
  } catch (error) {
    console.error('할 일 저장 중 오류 발생:', error);
    return false;
  }
}

/**
 * 할 일 목록 기본값
 */
function getDefaultTodos() {
  return [
    {
      id: 1,
      text: "Pro Tabs 프로젝트 계획 수립",
      completed: false,
      priority: "high",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      text: "할 일 목록 기능 개발",
      completed: true,
      priority: "medium",
      createdAt: new Date(Date.now() - 86400000).toISOString() // 하루 전
    },
    {
      id: 3,
      text: "북마크 기능 테스트",
      completed: false,
      priority: "low",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString() // 이틀 전
    }
  ];
}

/**
 * 할 일 항목 필터링 함수
 * @param {Array} todos 전체 할 일 목록
 * @param {String} filter 필터 유형 (all, active, completed)
 * @returns {Array} 필터링된 할 일 목록
 */
export function filterTodos(todos, filter = 'all') {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

/**
 * 우선순위 정보
 */
export const PRIORITIES = [
  { value: "high", label: "높음", color: "text-red-500" },
  { value: "medium", label: "중간", color: "text-amber-500" },
  { value: "low", label: "낮음", color: "text-blue-500" }
];

// 우선순위에 따른 색상 클래스 가져오기
export function getPriorityColor(priority) {
  const found = PRIORITIES.find(p => p.value === priority);
  return found ? found.color : "bg-gray-100 text-gray-800";
}

// 우선순위에 따른 정렬 함수
export function sortByPriority(todos) {
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  return [...todos].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
} 