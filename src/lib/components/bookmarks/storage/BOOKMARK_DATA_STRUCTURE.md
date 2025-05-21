# 북마크 데이터 구조 정의

이 문서는 ProTab 애플리케이션 내 북마크 기능에서 사용될 데이터 구조를 정의합니다.

## 개요

북마크 데이터는 사용자가 저장한 웹 페이지 링크 및 이를 정리하기 위한 폴더들로 구성됩니다. 데이터는 JSON 형태로 저장되며, 최상단은 폴더 또는 북마크 객체들의 배열입니다. 각 객체는 고유한 ID (UUID)를 가집니다.

## 데이터 구조

최상위 데이터는 폴더 또는 북마크 객체의 배열입니다.

```json
[
  {
    // 폴더 또는 북마크 객체 1
  },
  {
    // 폴더 또는 북마크 객체 2
  },
  // ...
]
```

### 공통 필드

모든 북마크 및 폴더 객체는 다음 공통 필드를 가집니다.

*   `id` (String):
    *   객체의 고유 식별자입니다.
    *   UUID (Universally Unique Identifier) 형식을 사용합니다.
    *   예: `"1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"`
*   `name` (String):
    *   북마크 또는 폴더의 이름입니다.
    *   사용자에게 표시되는 제목 역할을 합니다.
    *   예: `"즐겨찾기 폴더"`, `"Svelte 공식 사이트"`
*   `type` (String):
    *   객체의 종류를 나타냅니다.
    *   `"folder"`: 해당 객체가 폴더임을 의미합니다.
    *   `"url"`: 해당 객체가 북마크(URL 링크)임을 의미합니다.

### 타입별 필드

#### 1. 폴더 (`type: "folder"`)

폴더 객체는 공통 필드 외에 다음 필드를 추가로 가집니다.

*   `children` (Array):
    *   해당 폴더 내에 포함된 자식 북마크 또는 하위 폴더 객체들의 배열입니다.
    *   자식 객체들 또한 본 문서에서 정의하는 북마크 또는 폴더 객체의 구조를 따릅니다.
    *   폴더가 비어있을 경우 빈 배열 `[]`이 됩니다.

**폴더 예시:**

```json
{
  "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
  "name": "즐겨찾기 폴더",
  "type": "folder",
  "children": [
    // 자식 북마크 또는 폴더 객체들...
  ]
}
```

#### 2. 북마크 (`type: "url"`)

북마크 객체는 공통 필드 외에 다음 필드들을 추가로 가집니다.

*   `url` (String):
    *   북마크가 가리키는 웹 페이지의 URL 주소입니다.
    *   예: `"https://svelte.dev"`
*   `meta_info` (Object, Optional):
    *   북마크에 대한 추가적인 메타 정보를 담는 객체입니다.
    *   현재는 파비콘 URL을 저장하는 용도로 사용될 수 있습니다.
    *   이 필드는 선택 사항이며, 없을 수도 있습니다.
    *   `faviconUrl` (String, Optional): 해당 URL의 파비콘 이미지 주소입니다.

**북마크 예시:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "Svelte 공식 사이트",
  "type": "url",
  "url": "https://svelte.dev",
  "meta_info": {
    "faviconUrl": "https://svelte.dev/favicon.png"
  }
}
```

## 전체 데이터 예시

다음은 위 구조를 따르는 전체 북마크 데이터의 예시입니다. (실제 저장되는 JSON 파일의 내용)

```json
[
  {
    "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    "name": "즐겨찾기 폴더",
    "type": "folder",
    "children": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "name": "Svelte 공식 사이트",
        "type": "url",
        "url": "https://svelte.dev",
        "meta_info": {
          "faviconUrl": "https://svelte.dev/favicon.png"
        }
      },
      {
        "id": "f1g2h3i4-j5k6-7890-1234-567890mnopqr",
        "name": "Google 검색",
        "type": "url",
        "url": "https://www.google.com",
        "meta_info": {
          "faviconUrl": "https://www.google.com/favicon.ico"
        }
      }
    ]
  },
  {
    "id": "c4e6f8g0-h1i2-j3k4-l5m6-n7o8p9q0r1s2",
    "name": "뉴스 사이트",
    "type": "folder",
    "children": [
      {
        "id": "s3t4u5v6-w7x8-y9z0-1234-567890abcdef",
        "name": "TechCrunch",
        "type": "url",
        "url": "https://techcrunch.com",
        "meta_info": {
          "faviconUrl": "https://techcrunch.com/favicon.ico"
        }
      }
    ]
  },
  {
    "id": "k9l8m7n6-o5p4-q3r2-s1t0-u1v2w3x4y5z6",
    "name": "GitHub",
    "type": "url",
    "url": "https://github.com"
  }
]
```

## 고려사항

*   **ID 생성**: 모든 `id`는 UUID를 사용하여 생성함으로써 전역적으로 고유함을 보장합니다.
*   **데이터 관리**: 이 중첩된 트리 구조는 UI 표현에는 직관적일 수 있으나, 상태 업데이트 시 불변성을 유지하며 특정 항목을 수정/삭제/이동하는 로직을 신중하게 구현해야 합니다. (예: 깊은 복사 후 수정, 또는 재귀적인 탐색 및 업데이트 함수 사용)
*   **확장성**: `meta_info` 객체는 향후 북마크에 필요한 추가 정보를 유연하게 확장할 수 있는 공간을 제공합니다. (예: 태그, 설명 등)
*   **성능**: 매우 많은 수의 북마크나 깊은 폴더 중첩이 발생할 경우, 특정 작업(예: 렌더링, 검색)의 성능에 영향을 미칠 수 있습니다. 필요시 데이터 구조 최적화(예: 정규화된 구조로 변경) 또는 가상 스크롤링 같은 UI 최적화 기법 도입을 고려할 수 있습니다. 