<script>
  // 컴포넌트 임포트
  import Header from "$lib/components/protabs/Header.svelte";
  import Footer from "$lib/components/protabs/Footer.svelte";
  import BookmarkSidebar from "$lib/components/protabs/BookmarkSidebar.svelte";
  import Clock from "$lib/components/protabs/Clock.svelte";
  import UtilsSidebar from "$lib/components/protabs/UtilsSidebar.svelte";
  
  // 데이터 상태
  let weather = { condition: "로딩 중...", temperature: "", location: "" };
  
  // 북마크 데이터
  let bookmarks = [
    {
      id: 1,
      title: "개발 관련",
      expanded: true,
      bookmarks: [
        { id: 1, title: "GitHub", url: "https://github.com" },
        { id: 2, title: "Stack Overflow", url: "https://stackoverflow.com" }
      ]
    },
    {
      id: 2,
      title: "뉴스",
      expanded: false,
      bookmarks: [
        { id: 3, title: "Google News", url: "https://news.google.com" },
        { id: 4, title: "Naver", url: "https://naver.com" }
      ]
    },
    {
      id: 3,
      title: "자주 사용",
      expanded: true,
      bookmarks: [
        { id: 5, title: "Google", url: "https://google.com" },
        { id: 6, title: "YouTube", url: "https://youtube.com" },
        { id: 7, title: "Gmail", url: "https://mail.google.com" }
      ]
    }
  ];
  
  // TODO 데이터
  let todos = [
    { id: 1, text: "Pro Tabs 개발하기", completed: false },
    { id: 2, text: "메인 화면 디자인", completed: true },
    { id: 3, text: "날씨 API 연동", completed: false }
  ];
  
  // 메모 데이터
  let memo = "";
</script>

<div class="h-screen flex flex-col bg-background text-foreground">
  <!-- 헤더 영역 -->
  <Header {weather} />
  
  <!-- 메인 콘텐츠 영역 -->
  <main class="flex-1 flex overflow-hidden">
    <!-- 왼쪽 사이드바 - 북마크 -->
    <BookmarkSidebar {bookmarks} />
    
    <!-- 중앙 영역 - 시계와 날짜 -->
    <Clock />
    
    <!-- 오른쪽 사이드바 - 메모와 TODO -->
    <UtilsSidebar {todos} bind:memo />
  </main>
  
  <!-- 푸터 영역 -->
  <Footer />
</div>