# ProTab 북마크 기능 구현 계획

## 기술 스택 및 주요 라이브러리

*   UI: `shadcn-svelte` (JavaScript 환경)
*   데이터 저장: Chrome Extension `storage.sync`
*   데이터 구조: `BOOKMARK_DATA_STRUCTURE.md` 참조 (최상위 배열, UUID 사용, 중첩 트리 구조)

## 구현 단계

### 1단계: 기본 UI 레이아웃 및 상태 관리 설정

*   [x] `BookmarkSidebar.svelte` 기본 구조 설정 (shadcn-svelte 컴포넌트 활용 준비)
*   [x] 북마크 데이터 관리를 위한 Svelte 스토어 (`bookmarkStore.js`) 생성
    *   [x] 초기 상태: 빈 배열 `[]`
    *   [x] 데이터 로드 함수 (Chrome `storage.sync`에서 데이터 불러오기)
    *   [x] 데이터 저장 함수 (Chrome `storage.sync`에 데이터 저장하기)
*   [x] 상단 헤더 영역 UI 구현
    *   [x] 북마크 추가 버튼 (아이콘, shadcn-svelte `Button`)
    *   [x] 폴더 추가 버튼 (아이콘, shadcn-svelte `Button`)
*   [x] 북마크 목록 표시 영역 기본 UI

### 2단계: 북마크 및 폴더 생성 기능 구현

*   [x] **북마크 추가 기능:**
    *   [x] 북마크 추가 버튼 클릭 시 입력 폼/팝오버 (shadcn-svelte `Popover` 또는 `Dialog`) 표시
    *   [x] 이름, URL 입력 필드
    *   [x] 입력값 유효성 검사 (URL 형식)
    *   [x] `bookmarkStore`에 새 북마크 데이터 추가 및 `storage.sync`에 저장
    *   [x] ID는 UUID로 생성 (예: `crypto.randomUUID()`)
    *   [x] 파비콘 자동 추출 및 `meta_info.faviconUrl`에 저장 (기본 `https://<domain>/favicon.ico` 시도, 실패 시 빈 값)
*   [x] **폴더 추가 기능:**
    *   [x] 폴더 추가 버튼 클릭 시 입력 폼/팝오버 표시
    *   [x] 폴더 이름 입력 필드
    *   [x] `bookmarkStore`에 새 폴더 데이터 추가 및 `storage.sync`에 저장
    *   [x] ID는 UUID로 생성, `children`은 빈 배열로 초기화

### 3단계: 북마크 및 폴더 목록 표시 기능 구현

*   [x] `BookmarkItem.svelte` 컴포넌트 생성 (링크 표시용)
    *   [x] 파비콘 이미지 표시 (없을 경우 기본 아이콘)
    *   [x] 북마크 이름 표시
*   [x] `BookmarkFolder.svelte` 컴포넌트 생성 (폴더 표시용)
    *   [x] 폴더 아이콘 표시 (shadcn-svelte 아이콘 또는 lucide-svelte 활용)
    *   [x] 폴더 이름 표시
    *   [x] 폴더 접기/펼치기 기능 (클릭 시 `children` 표시/숨김, shadcn-svelte `Collapsible` 활용)
*   [x] `BookmarkSidebar.svelte`에서 `bookmarkStore`의 데이터를 구독하여 트리 구조로 렌더링
    *   [x] 재귀적인 컴포넌트 호출 또는 반복문과 조건부 렌더링을 통해 중첩 구조 표시

### 4단계: 컨텍스트 메뉴 기능 구현

*   [x] `shadcn-svelte`의 `ContextMenu` 컴포넌트 활용
*   [x] `BookmarkItem.svelte` 및 `BookmarkFolder.svelte`에서 오른쪽 클릭 시 컨텍스트 메뉴 표시
    *   [x] 메뉴 항목: "편집", "삭제"
*   [ ] 화면에는 하나의 컨텍스트 메뉴만 뜨도록 관리 (예: 전역 스토어 또는 `BookmarkSidebar.svelte`의 로컬 상태 활용)

### 5단계: 북마크 및 폴더 편집/삭제 기능 구현

*   [x] **편집 기능:**
    *   [x] 컨텍스트 메뉴에서 "편집" 선택 시 편집용 `Dialog` 표시
    *   [x] 북마크: 이름, URL 수정 필드
    *   [x] 폴더: 이름 수정 필드
    *   [x] 수정된 내용을 `bookmarkStore`에 반영하고 `storage.sync`에 저장
*   [x] **삭제 기능:**
    *   [x] 컨텍스트 메뉴에서 "삭제" 선택 시 확인용 `AlertDialog` 표시
    *   [x] 확인 시 해당 북마크/폴더 (및 하위 항목들)를 `bookmarkStore`에서 제거하고 `storage.sync`에 저장

### 6단계: 링크 클릭 동작 구현

*   [x] **일반 클릭:** 현재 탭에서 페이지 이동 (`<a>` 태그의 `href` 활용)
*   [x] **Ctrl/Cmd + 클릭 (또는 가운데 클릭):** 새 탭으로 페이지 열기 (`<a>` 태그의 `target="_blank"` 및 이벤트 핸들러에서 `ctrlKey`/`metaKey` 조합 또는 `window.open`)

### 7단계: (선택 사항, 후순위) 드래그 앤 드롭으로 북마크/폴더 이동 및 순서 변경

*   [ ] HTML5 드래그 앤 드롭 API 또는 Svelte 기반 라이브러리 검토 및 적용
*   [ ] 드래그 시 UI 피드백 (드래그 중인 항목, 드롭 가능한 위치 표시)
*   [ ] 드롭 시 `bookmarkStore` 데이터 구조 업데이트 (순서 변경, 부모 변경) 및 `storage.sync`에 저장

---

위 계획에 따라 단계적으로 진행하며, 각 단계 완료 시마다 확인하고 다음 단계로 넘어갑니다. 