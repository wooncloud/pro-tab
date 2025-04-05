// Content script injected into all web pages
import './content.css';

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Content script loaded');
  
  // Example of inserting a simple button into the page
  insertButton();
});

// Function to insert button
function insertButton() {
  // Check if button already exists
  if (document.getElementById('svelte-extension-button')) {
    return;
  }

  // Create button
  const button = document.createElement('div');
  button.id = 'svelte-extension-button';
  button.className = 'svelte-extension-button';
  button.innerHTML = 'S';
  
  // Add click event
  button.addEventListener('click', () => {
    // Example of sending message to background script
    chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
      console.log('Response from background:', response);
      alert('Extension button clicked!');
    });
  });
  
  // Add to document
  document.body.appendChild(button);
}

// 메시지 리스너 추가 (팝업과 통신)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 핑 요청 - 컨텐츠 스크립트가 로드되었는지 확인
  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'Content script is ready' });
    return true;
  }
  
  // 페이지 컨텐츠 스크랩 요청 처리
  if (request.action === 'scrapeContent') {
    try {
      const content = scrapePageContent();
      sendResponse({ success: true, content });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true; // 비동기 응답을 위해 true 반환
  }
});

// 페이지 내용 스크랩 함수
function scrapePageContent() {
  try {
    console.log('콘텐츠 스크랩 시작');
    
    // 1. 읽기 모드 대상 태그들 (뉴스, 블로그 등의 주요 콘텐츠)
    const contentSelectors = [
      'article', 
      '.article', 
      '.post', 
      '.post-content',
      '.entry-content',
      '.content',
      '.main-content',
      '.news-content',
      '.story-content',
      '.story-body',
      'main', 
      '#content', 
      '#main',
      '#article',
      '.article-body',
      '.article__body',
      '.article-content',
      '[itemprop="articleBody"]',
      '[role="main"]'
    ];
    
    let content = '';
    let contentElement = null;
    
    // 선택자 중 하나라도 매칭되는지 확인
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        // 가장 콘텐츠가 많은 요소 선택
        let bestElement = elements[0];
        let bestLength = bestElement.innerText.length;
        
        for (let i = 1; i < elements.length; i++) {
          const length = elements[i].innerText.length;
          if (length > bestLength) {
            bestElement = elements[i];
            bestLength = length;
          }
        }
        
        contentElement = bestElement;
        break;
      }
    }
    
    // 선택된 요소에서 텍스트 추출
    if (contentElement) {
      console.log('콘텐츠 요소 찾음:', contentElement);
      
      // 콘텐츠 요소에서 주요 텍스트 노드 추출
      const textBlocks = Array.from(contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
        .filter(el => el.innerText.trim().length > 0)
        .map(el => el.innerText.trim());
      
      if (textBlocks.length > 0) {
        content = textBlocks.join('\n\n');
      } else {
        // 단락이 올바르게 구분되어 있지 않은 경우 전체 텍스트 사용
        content = contentElement.innerText;
      }
    }
    
    // 선택자 매칭이 없거나 텍스트가 너무 적은 경우
    if (!content || content.length < 100) {
      console.log('주요 콘텐츠 영역을 찾을 수 없어 대체 방법 사용');
      
      // 1. 페이지 제목 가져오기
      const pageTitle = document.title || '';
      
      // 2. 페이지에서 가장 긴 텍스트 블록을 가진 요소들 찾기
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .filter(p => {
          // 숨겨진 요소나 너무 작은 텍스트는 제외
          const style = window.getComputedStyle(p);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 p.innerText.trim().length > 20;
        })
        .sort((a, b) => b.innerText.length - a.innerText.length)
        .slice(0, 15); // 상위 15개만 사용
      
      // 3. 헤딩 요소 찾기 (제목, 소제목)
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .filter(h => {
          const style = window.getComputedStyle(h);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 h.innerText.trim().length > 0;
        })
        .slice(0, 5); // 상위 5개만 사용
      
      // 4. 추출한 내용 결합
      let extractedTexts = [];
      
      if (pageTitle) {
        extractedTexts.push(`# ${pageTitle}`);
        extractedTexts.push('');
      }
      
      // 헤딩 추가
      headings.forEach(h => {
        const level = h.tagName.charAt(1);
        const prefix = '#'.repeat(parseInt(level));
        extractedTexts.push(`${prefix} ${h.innerText.trim()}`);
        extractedTexts.push('');
      });
      
      // 단락 추가
      paragraphs.forEach(p => {
        extractedTexts.push(p.innerText.trim());
        extractedTexts.push('');
      });
      
      content = extractedTexts.join('\n');
    }
    
    // 콘텐츠를 찾지 못한 경우
    if (!content) {
      console.log('콘텐츠를 찾지 못해 기본 추출 방법 사용');
      
      // body에서 텍스트 노드 추출 (마지막 시도)
      const allTextNodes = extractVisibleText(document.body);
      
      // 의미 있는 길이의 텍스트만 포함
      const significantTexts = allTextNodes
        .filter(text => text.length > 20)
        .slice(0, 30); // 너무 길어지지 않게 제한
        
      content = significantTexts.join('\n\n');
    }
    
    console.log('스크랩된 콘텐츠 길이:', content.length);
    return content || '페이지에서 추출할 내용을 찾을 수 없습니다.';
  } catch (error) {
    console.error('콘텐츠 스크랩 오류:', error);
    return '오류: 페이지 내용을 스크랩하는 중 문제가 발생했습니다.';
  }
}

// 보이는 텍스트 추출 헬퍼 함수
function extractVisibleText(element) {
  if (!element) return [];
  
  // 숨겨진 요소는 무시
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return [];
  }
  
  // 특정 요소 무시 (스크립트, 스타일, 폼 등)
  const ignoreTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OPTION', 'BUTTON'];
  if (ignoreTags.includes(element.tagName)) {
    return [];
  }
  
  // 텍스트 노드가 있는 경우 추출
  let texts = [];
  if (element.nodeType === Node.TEXT_NODE) {
    const text = element.textContent.trim();
    if (text) {
      texts.push(text);
    }
  } else {
    // 자식 요소에서 재귀적으로 추출
    for (const child of element.childNodes) {
      texts = texts.concat(extractVisibleText(child));
    }
    
    // 줄바꿈이 필요한 요소라면 텍스트 분리 
    const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
    if (blockElements.includes(element.tagName) && texts.length > 0) {
      texts.push(''); // 빈 줄 추가하여 분리
    }
  }
  
  return texts.filter(text => text.trim().length > 0);
} 