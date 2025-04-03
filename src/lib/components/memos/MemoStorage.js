// 스토리지 키 상수
const STORAGE_KEY = 'pro_tabs_memos';

/**
 * 메모 목록을 로드하는 함수
 * Chrome Storage API를 사용하고, 실패 시 로컬 스토리지를 사용
 */
export async function loadMemos() {
  try {
    // Chrome Extension 환경인 경우 Chrome Storage API 사용
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          const memos = result[STORAGE_KEY] || getDefaultMemos();
          resolve(memos);
        });
      });
    } else {
      // 일반 브라우저 환경인 경우 로컬 스토리지 사용
      const memosJson = localStorage.getItem(STORAGE_KEY);
      return memosJson ? JSON.parse(memosJson) : getDefaultMemos();
    }
  } catch (error) {
    console.error('메모 로드 중 오류 발생:', error);
    return getDefaultMemos();
  }
}

/**
 * 메모 목록을 저장하는 함수
 * @param {Array} memos 저장할 메모 목록
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveMemos(memos) {
  try {
    // Chrome Extension 환경인 경우 Chrome Storage API 사용
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: memos }, () => {
          resolve(true);
        });
      });
    } else {
      // 일반 브라우저 환경인 경우 로컬 스토리지 사용
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
      return true;
    }
  } catch (error) {
    console.error('메모 저장 중 오류 발생:', error);
    return false;
  }
}

/**
 * 단일 메모를 저장하는 함수
 * @param {Object} memo 저장할 메모
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveMemo(memo) {
  try {
    const memos = await loadMemos();
    const index = memos.findIndex(m => m.id === memo.id);
    
    if (index !== -1) {
      // 기존 메모 업데이트
      memos[index] = { ...memo, updatedAt: new Date().toISOString() };
    } else {
      // 새 메모 추가
      memos.push({ 
        ...memo, 
        id: memo.id || generateId(memos),
        createdAt: memo.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString() 
      });
    }
    
    return await saveMemos(memos);
  } catch (error) {
    console.error('메모 저장 중 오류 발생:', error);
    return false;
  }
}

/**
 * 메모를 삭제하는 함수
 * @param {number} id 삭제할 메모 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteMemo(id) {
  try {
    const memos = await loadMemos();
    const filteredMemos = memos.filter(memo => memo.id !== id);
    
    if (filteredMemos.length === memos.length) {
      return false; // 삭제할 메모가 없음
    }
    
    return await saveMemos(filteredMemos);
  } catch (error) {
    console.error('메모 삭제 중 오류 발생:', error);
    return false;
  }
}

/**
 * 새 메모 ID 생성
 * @param {Array} memos 기존 메모 목록
 * @returns {number} 새 메모 ID
 */
function generateId(memos) {
  return memos.length > 0 ? Math.max(...memos.map(m => m.id)) + 1 : 1;
}

/**
 * 기본 메모 목록
 * @returns {Array} 기본 메모 목록
 */
function getDefaultMemos() {
  const now = new Date().toISOString();
  return [
    {
      id: 1,
      title: '프로젝트 계획',
      content: '- Pro Tabs 기능 구현\n- 북마크 관리 시스템\n- 할 일 목록',
      createdAt: now,
      updatedAt: now
    }
  ];
} 